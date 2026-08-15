import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const services = await prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
  res.json(services);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const service = await prisma.service.create({ data: req.body });
  res.status(201).json(service);
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
  res.json(service);
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
