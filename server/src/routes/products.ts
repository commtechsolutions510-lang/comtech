import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, authenticateAdmin, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { category, search, sort, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isActive: true, isArchived: false };
  if (category) where.categoryId = category as string;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy.basePrice = 'asc';
  if (sort === 'price_desc') orderBy.basePrice = 'desc';
  if (sort === 'name') orderBy.name = 'asc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: { where: { isPrimary: true } }, variants: { where: { isActive: true }, orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } } },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  const formatted = products.map(p => {
    const variants = p.variants.map(v => {
      const optionValues = v.optionValues.map(ov => ({
        id: ov.optionValue.id,
        value: ov.optionValue.value,
        option: { id: ov.optionValue.option.id, name: ov.optionValue.option.name },
      }));
      return {
        id: v.id,
        price: parseFloat(v.price.toString()),
        salePrice: v.salePrice ? parseFloat(v.salePrice.toString()) : undefined,
        stock: v.stockQuantity,
        sku: v.sku || '',
        isActive: v.isActive,
        optionValues,
      };
    });
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      categorySlug: p.category.slug,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      image: p.images[0]?.url || '/images/company/placeholder.jpg',
      basePrice: parseFloat(p.basePrice.toString()),
      salePrice: p.salePrice ? parseFloat(p.salePrice.toString()) : undefined,
      featured: p.isFeatured,
      stockQuantity: p.stockQuantity,
      variants,
      images: p.images.map(img => ({ url: img.url, alt: img.alt || '', isPrimary: img.isPrimary })),
    };
  });

  res.json({ products: formatted, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      images: true,
      variants: { orderBy: { displayOrder: 'asc' }, include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
      options: { orderBy: { displayOrder: 'asc' }, include: { values: { orderBy: { displayOrder: 'asc' } } } },
    },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const variants = product.variants.map(v => {
    const optionValues = v.optionValues.map(ov => ({
      id: ov.optionValue.id,
      value: ov.optionValue.value,
      option: { id: ov.optionValue.option.id, name: ov.optionValue.option.name },
    }));
    return {
      id: v.id,
      price: parseFloat(v.price.toString()),
      salePrice: v.salePrice ? parseFloat(v.salePrice.toString()) : undefined,
      stock: v.stockQuantity,
      sku: v.sku || '',
      isActive: v.isActive,
      optionValues,
    };
  });

  const options = product.options.map(o => ({
    id: o.id,
    name: o.name,
    values: o.values.map(v => ({ id: v.id, value: v.value })),
  }));

  const formatted = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    categorySlug: product.category.slug,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    image: product.images[0]?.url || '/images/company/placeholder.jpg',
    basePrice: parseFloat(product.basePrice.toString()),
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : undefined,
    featured: product.isFeatured,
    stockQuantity: product.stockQuantity,
    variants,
    options,
    images: product.images.map(img => ({ url: img.url, alt: img.alt || '', isPrimary: img.isPrimary })),
  };

  res.json(formatted);
});

export default router;
