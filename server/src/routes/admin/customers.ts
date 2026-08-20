import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.customer.count({ where }),
  ]);

  const formatted = customers.map(c => ({
    id: c.id,
    name: c.fullName,
    email: c.email,
    phone: c.phone,
    orders: c._count.orders,
    spending: c.orders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0),
    status: c.isActive ? 'active' : 'inactive',
    joined: c.createdAt.toISOString().split('T')[0],
  }));

  res.json({ data: formatted, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
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