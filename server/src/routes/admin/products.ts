import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

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
      include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true } } },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  const formatted = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    categorySlug: p.category.slug,
    price: parseFloat(p.basePrice.toString()),
    stock: p.stockQuantity,
    status: p.isActive ? (p.stockQuantity === 0 ? 'out_of_stock' : 'active') : 'inactive',
    featured: p.isFeatured,
    image: p.images[0]?.url || '/images/company/placeholder.jpg',
    description: p.description || '',
    createdAt: p.createdAt.toISOString(),
  }));

  res.json({ data: formatted, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
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
      stockQuantity: parseInt(req.body.stock || req.body.stockQuantity || 0),
      description: req.body.description,
      isActive: req.body.status !== 'inactive',
      isFeatured: req.body.featured || false,
    },
    include: { category: { select: { name: true, slug: true } }, images: { where: { isPrimary: true } } },
  });

  if (req.body.image) {
    await prisma.productImage.create({ data: { productId: product.id, url: req.body.image, isPrimary: true } });
  }

  const formatted = {
    id: product.id,
    name: product.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: parseFloat(product.basePrice.toString()),
    stock: product.stockQuantity,
    status: product.isActive ? (product.stockQuantity === 0 ? 'out_of_stock' : 'active') : 'inactive',
    featured: product.isFeatured,
    image: product.images[0]?.url || '/images/company/placeholder.jpg',
    description: product.description || '',
    createdAt: product.createdAt.toISOString(),
  };
  res.status(201).json(formatted);
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
  if (req.body.stock !== undefined) data.stockQuantity = parseInt(req.body.stock);
  if (req.body.stockQuantity !== undefined) data.stockQuantity = parseInt(req.body.stockQuantity);
  if (req.body.description !== undefined) data.description = req.body.description;
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

  const formatted = {
    id: product.id,
    name: product.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: parseFloat(product.basePrice.toString()),
    stock: product.stockQuantity,
    status: product.isActive ? (product.stockQuantity === 0 ? 'out_of_stock' : 'active') : 'inactive',
    featured: product.isFeatured,
    image: product.images[0]?.url || '/images/company/placeholder.jpg',
    description: product.description || '',
    createdAt: product.createdAt.toISOString(),
  };
  res.json(formatted);
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
