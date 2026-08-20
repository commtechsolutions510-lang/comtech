import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

function formatProduct(p: any) {
  const variants = (p.variants || []).map((v: any) => ({
    id: v.id,
    sku: v.sku || '',
    price: parseFloat(v.price.toString()),
    salePrice: v.salePrice ? parseFloat(v.salePrice.toString()) : undefined,
    stock: v.stockQuantity,
    isActive: v.isActive,
    displayOrder: v.displayOrder,
    optionValues: (v.optionValues || []).map((ov: any) => ({
      id: ov.optionValue.id,
      value: ov.optionValue.value,
      option: { id: ov.optionValue.option.id, name: ov.optionValue.option.name },
    })),
  }));

  const options = (p.options || []).map((o: any) => ({
    id: o.id,
    name: o.name,
    displayOrder: o.displayOrder,
    values: o.values.map((v: any) => ({ id: v.id, value: v.value, displayOrder: v.displayOrder })),
  }));

  return {
    id: p.id,
    name: p.name,
    category: p.category.name,
    categorySlug: p.category.slug,
    price: parseFloat(p.basePrice.toString()),
    salePrice: p.salePrice ? parseFloat(p.salePrice.toString()) : undefined,
    stock: p.stockQuantity,
    status: p.isActive ? (p.stockQuantity === 0 && (!p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stockQuantity === 0)) ? 'out_of_stock' : 'active') : 'inactive',
    featured: p.isFeatured,
    image: p.images?.[0]?.url || '/images/company/placeholder.jpg',
    description: p.description || '',
    createdAt: p.createdAt.toISOString(),
    variants,
    options,
  };
}

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', search, sort = 'createdAt', order = 'desc' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isArchived: false };
  if (search) where.name = { contains: search as string, mode: 'insensitive' };

  const orderBy: any = {};
  orderBy[sort as string] = order as string;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true } },
        variants: { orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
        options: { orderBy: { displayOrder: 'asc' }, include: { values: { orderBy: { displayOrder: 'asc' } } } },
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ data: products.map(formatProduct), total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  let categoryId = req.body.categoryId;
  if (!categoryId && req.body.category) {
    const cat = await prisma.category.findFirst({ where: { name: req.body.category } });
    if (cat) categoryId = cat.id;
  }
  if (!categoryId && req.body.categorySlug) {
    const cat = await prisma.category.findFirst({ where: { slug: req.body.categorySlug } });
    if (cat) categoryId = cat.id;
  }

  const slug = (req.body.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      slug: slug || `product-${Date.now()}`,
      categoryId,
      basePrice: parseFloat(req.body.price || req.body.basePrice || 0),
      salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : null,
      stockQuantity: parseInt(req.body.stock || req.body.stockQuantity || 0),
      description: req.body.description,
      sku: req.body.sku,
      isActive: req.body.status !== 'inactive',
      isFeatured: req.body.featured || false,
    },
    include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true } } },
  });

  if (req.body.image) {
    await prisma.productImage.create({ data: { productId: product.id, url: req.body.image, isPrimary: true } });
  }

  if (req.body.options?.length) {
    const optionRecords = await prisma.productOption.createMany({
      data: req.body.options.map((o: any) => ({
        productId: product.id,
        name: o.name,
        displayOrder: o.displayOrder || 0,
      })),
    });

    const createdOptions = await prisma.productOption.findMany({
      where: { productId: product.id },
      orderBy: { displayOrder: 'asc' },
    });

    for (let i = 0; i < createdOptions.length; i++) {
      const option = createdOptions[i];
      const optionValues = req.body.options[i]?.values || [];
      if (optionValues.length > 0) {
        await prisma.productOptionValue.createMany({
          data: optionValues.map((v: any) => ({
            optionId: option.id,
            value: v.value,
            displayOrder: v.displayOrder || 0,
          })),
        });
      }
    }
  }

  if (req.body.variants?.length) {
    const options = await prisma.productOption.findMany({
      where: { productId: product.id },
      include: { values: { orderBy: { displayOrder: 'asc' } } },
    });

    const optionValueMap = new Map<string, string>();
    for (const opt of options) {
      for (const val of opt.values) {
        optionValueMap.set(`${opt.name}::${val.value}`, val.id);
      }
    }

    const variantRecords = await prisma.productVariant.createMany({
      data: req.body.variants.map((v: any) => ({
        productId: product.id,
        sku: v.sku,
        price: parseFloat(v.price || 0),
        salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
        stockQuantity: parseInt(v.stock || 0),
        isActive: v.isActive !== false,
        displayOrder: v.displayOrder || 0,
      })),
    });

    const createdVariants = await prisma.productVariant.findMany({
      where: { productId: product.id },
      orderBy: { displayOrder: 'asc' },
    });

    const variantLinks: { variantId: string; optionValueId: string }[] = [];
    for (let i = 0; i < createdVariants.length; i++) {
      const variant = createdVariants[i];
      const inputVariant = req.body.variants[i];
      if (inputVariant?.optionValues?.length) {
        for (const ov of inputVariant.optionValues) {
          const realOptionValueId = optionValueMap.get(`${ov.optionName}::${ov.value}`);
          if (realOptionValueId) {
            variantLinks.push({ variantId: variant.id, optionValueId: realOptionValueId });
          }
        }
      }
    }

    if (variantLinks.length > 0) {
      await prisma.variantOptionValue.createMany({ data: variantLinks });
    }
  }

  const finalProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: { select: { name: true, slug: true } },
      images: { where: { isPrimary: true } },
      variants: { orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
      options: { orderBy: { displayOrder: 'asc' }, include: { values: { orderBy: { displayOrder: 'asc' } } } },
    },
  });

  res.status(201).json(formatProduct(finalProduct!));
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const data: any = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.category !== undefined) {
    const cat = await prisma.category.findFirst({ where: { name: req.body.category } });
    if (cat) data.categoryId = cat.id;
  }
  if (req.body.categoryId !== undefined) data.categoryId = req.body.categoryId;
  if (req.body.categorySlug !== undefined) {
    const cat = await prisma.category.findFirst({ where: { slug: req.body.categorySlug } });
    if (cat) data.categoryId = cat.id;
  }
  if (req.body.price !== undefined) data.basePrice = parseFloat(req.body.price);
  if (req.body.basePrice !== undefined) data.basePrice = parseFloat(req.body.basePrice);
  if (req.body.salePrice !== undefined) data.salePrice = req.body.salePrice ? parseFloat(req.body.salePrice) : null;
  if (req.body.stock !== undefined) data.stockQuantity = parseInt(req.body.stock);
  if (req.body.stockQuantity !== undefined) data.stockQuantity = parseInt(req.body.stockQuantity);
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.sku !== undefined) data.sku = req.body.sku;
  if (req.body.status === 'active') { data.isActive = true; data.isArchived = false; }
  else if (req.body.status === 'inactive') data.isActive = false;
  else if (req.body.status === 'out_of_stock') { data.isActive = true; data.stockQuantity = 0; }
  if (req.body.isArchived !== undefined) data.isArchived = req.body.isArchived;
  if (req.body.isActive !== undefined) data.isActive = req.body.isActive;
  if (req.body.featured !== undefined) data.isFeatured = req.body.featured;
  if (req.body.image !== undefined) {
    const existing = await prisma.productImage.findFirst({ where: { productId: req.params.id, isPrimary: true } });
    if (existing) await prisma.productImage.update({ where: { id: existing.id }, data: { url: req.body.image } });
    else await prisma.productImage.create({ data: { productId: req.params.id, url: req.body.image, isPrimary: true } });
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data,
    include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true } } },
  });

  if (req.body.options) {
    await prisma.productOption.deleteMany({ where: { productId: req.params.id } });
    await prisma.productOption.createMany({
      data: req.body.options.map((o: any) => ({
        productId: req.params.id,
        name: o.name,
        displayOrder: o.displayOrder || 0,
      })),
    });

    const createdOptions = await prisma.productOption.findMany({
      where: { productId: req.params.id },
      orderBy: { displayOrder: 'asc' },
    });

    for (let i = 0; i < createdOptions.length; i++) {
      const option = createdOptions[i];
      const optionValues = req.body.options[i]?.values || [];
      if (optionValues.length > 0) {
        await prisma.productOptionValue.createMany({
          data: optionValues.map((v: any) => ({
            optionId: option.id,
            value: v.value,
            displayOrder: v.displayOrder || 0,
          })),
        });
      }
    }
  }

  if (req.body.variants) {
    await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
    await prisma.productVariant.createMany({
      data: req.body.variants.map((v: any) => ({
        productId: req.params.id,
        sku: v.sku,
        price: parseFloat(v.price || 0),
        salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
        stockQuantity: parseInt(v.stock || 0),
        isActive: v.isActive !== false,
        displayOrder: v.displayOrder || 0,
      })),
    });

    const createdVariants = await prisma.productVariant.findMany({
      where: { productId: req.params.id },
      orderBy: { displayOrder: 'asc' },
    });

    const options = await prisma.productOption.findMany({
      where: { productId: req.params.id },
      include: { values: { orderBy: { displayOrder: 'asc' } } },
    });

    const optionValueMap = new Map<string, string>();
    for (const opt of options) {
      for (const val of opt.values) {
        optionValueMap.set(`${opt.name}::${val.value}`, val.id);
      }
    }

    const variantLinks: { variantId: string; optionValueId: string }[] = [];
    for (let i = 0; i < createdVariants.length; i++) {
      const variant = createdVariants[i];
      const inputVariant = req.body.variants[i];
      if (inputVariant?.optionValues?.length) {
        for (const ov of inputVariant.optionValues) {
          const realOptionValueId = optionValueMap.get(`${ov.optionName}::${ov.value}`);
          if (realOptionValueId) {
            variantLinks.push({ variantId: variant.id, optionValueId: realOptionValueId });
          }
        }
      }
    }

    if (variantLinks.length > 0) {
      await prisma.variantOptionValue.createMany({ data: variantLinks });
    }
  }

  const updatedProduct = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: { select: { name: true, slug: true } },
      images: { where: { isPrimary: true } },
      variants: { orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
      options: { orderBy: { displayOrder: 'asc' }, include: { values: { orderBy: { displayOrder: 'asc' } } } },
    },
  });

  res.json(formatProduct(updatedProduct!));
});

router.patch('/:id/archive', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isArchived: true },
  });
  res.json({ id: product.id, isArchived: true });
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isArchived: true } });
  res.status(204).send();
});

export default router;
