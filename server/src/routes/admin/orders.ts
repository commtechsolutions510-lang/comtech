import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', search, status } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string, mode: 'insensitive' } },
      { customerName: { contains: search as string, mode: 'insensitive' } },
      { customerEmail: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  if (status && status !== 'all') where.status = status as string;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payments: true, customer: { select: { fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);

  const formatted = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer?.fullName || order.customerName,
    email: order.customer?.email || order.customerEmail,
    phone: order.customer?.phone || order.customerPhone,
    date: order.createdAt.toISOString().split('T')[0],
    items: order.items.length,
    total: parseFloat(order.total.toString()),
    status: order.status,
    paymentStatus: order.paymentStatus,
    shippingAddress: order.deliveryAddress || '',
    notes: order.notes || '',
  }));

  res.json({ data: formatted, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
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

router.patch('/:id/notes', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { notes } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { notes },
  });
  res.json(order);
});

export default router;
