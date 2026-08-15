import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const locations = await prisma.location.findMany({ orderBy: { displayOrder: 'asc' } });
  res.json(locations);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const location = await prisma.location.create({ data: req.body });
  res.status(201).json(location);
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const location = await prisma.location.update({ where: { id: req.params.id }, data: req.body });
  res.json(location);
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.location.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
