import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { search } = req.query;
  const where: any = {};
  if (search) where.OR = [
    { fullName: { contains: search as string, mode: 'insensitive' } },
    { email: { contains: search as string, mode: 'insensitive' } },
    { phone: { contains: search as string, mode: 'insensitive' } },
  ];

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const customersWithStats = customers.map(c => ({
    ...c,
    totalOrders: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
  }));

  res.json(customersWithStats);
});

router.get('/:id', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { addresses: true, orders: { include: { items: true } } },
  });
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

export default router;
