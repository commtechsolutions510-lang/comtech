import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

function parseMoney(value: unknown, field: string, required = false): number | null {
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`${field} is required`);
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error(`${field} must be a non-negative number`);
  return amount;
}

function parseStock(value: unknown, field = 'Stock'): number {
  const stock = Number(value ?? 0);
  if (!Number.isInteger(stock) || stock < 0) throw new Error(`${field} must be a non-negative whole number`);
  return stock;
}

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
    stock: p.variants?.length ? p.variants.reduce((total: number, variant: any) => total + variant.stockQuantity, 0) : p.stockQuantity,
    status: p.isActive ? (p.stockQuantity === 0 && (!p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stockQuantity === 0)) ? 'out_of_stock' : 'active') : 'inactive',
    featured: p.isFeatured,
    image: p.images?.[0]?.url || '/images/company/placeholder.jpg',
    images: (p.images || []).map((image: any) => ({ id: image.id, url: image.url, alt: image.alt || '', isPrimary: image.isPrimary })),
    description: p.description || '',
    sku: p.sku || '',
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
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
  try {
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
  const basePrice = parseMoney(req.body.price ?? req.body.basePrice, 'Base price', true)!;
  const salePrice = parseMoney(req.body.salePrice, 'Sale price');
  if (salePrice !== null && salePrice > basePrice) throw new Error('Sale price cannot exceed base price');
  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      slug: slug || `product-${Date.now()}`,
      categoryId,
      basePrice,
      salePrice,
      stockQuantity: parseStock(req.body.stock ?? req.body.stockQuantity),
      description: req.body.description,
      sku: req.body.sku,
      isActive: req.body.status !== 'inactive',
      isFeatured: req.body.featured || false,
    },
    include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true } } },
  });

  const imageUrls = Array.isArray(req.body.images) ? req.body.images.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url.trim())) : [];
  if (imageUrls.length > 0 || req.body.image) {
    await prisma.productImage.createMany({
      data: (imageUrls.length > 0 ? imageUrls : [req.body.image]).map((url, index) => ({ productId: product.id, url, isPrimary: index === 0 })),
    });
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
        price: parseMoney(v.price, 'Variant price', true)!,
        salePrice: parseMoney(v.salePrice, 'Variant sale price'),
        stockQuantity: parseStock(v.stock, 'Variant stock'),
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
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Unable to create product' });
  }
});

router.get('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
      options: { orderBy: { displayOrder: 'asc' }, include: { values: { orderBy: { displayOrder: 'asc' } } } },
    },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(formatProduct(product));
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  try {
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
  if (req.body.price !== undefined) data.basePrice = parseMoney(req.body.price, 'Base price', true);
  if (req.body.basePrice !== undefined) data.basePrice = parseMoney(req.body.basePrice, 'Base price', true);
  if (req.body.salePrice !== undefined) data.salePrice = parseMoney(req.body.salePrice, 'Sale price');
  if (req.body.stock !== undefined) data.stockQuantity = parseStock(req.body.stock);
  if (req.body.stockQuantity !== undefined) data.stockQuantity = parseStock(req.body.stockQuantity);
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
  if (Array.isArray(req.body.images)) {
    const imageUrls = req.body.images.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url.trim()));
    await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({ productId: req.params.id, url, isPrimary: index === 0 })),
      });
    }
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
        price: parseMoney(v.price, 'Variant price', true)!,
        salePrice: parseMoney(v.salePrice, 'Variant sale price'),
        stockQuantity: parseStock(v.stock, 'Variant stock'),
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
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Unable to update product' });
  }
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
