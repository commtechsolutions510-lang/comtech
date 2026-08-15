import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isArchived: false };
  if (search) where.name = { contains: search as string, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: true, variants: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  res.json(product);
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isArchived: true } });
  res.status(204).send();
});

export default router;
