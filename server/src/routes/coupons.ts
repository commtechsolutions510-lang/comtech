import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(coupons);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json(coupon);
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  res.json(coupon);
});

export default router;
