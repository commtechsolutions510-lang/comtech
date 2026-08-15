import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
  res.json(categories);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json(category);
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});

export default router;
