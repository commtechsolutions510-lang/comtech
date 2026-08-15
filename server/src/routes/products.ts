import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, authenticateAdmin, AuthRequest, requireRole } from '../middleware/auth';

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
      include: { category: true, images: true, variants: { where: { stockQuantity: { gt: 0 } } } },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, images: true, variants: true },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

export default router;
