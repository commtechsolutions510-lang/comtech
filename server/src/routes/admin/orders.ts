import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true, customer: true },
  });
  res.json(orders);
});

router.get('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true, variant: true } }, payments: true, customer: true },
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

router.patch('/:id/status', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { status, paymentStatus } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, paymentStatus },
  });
  res.json(order);
});

export default router;
