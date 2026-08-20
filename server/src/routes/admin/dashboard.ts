import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const [totalSales, todaySales, weekSales, monthSales, totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders, totalCustomers, newCustomers, totalProducts, activeProducts, outOfStock] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: 'processing' } }),
    prisma.order.count({ where: { status: 'completed' } }),
    prisma.order.count({ where: { status: 'cancelled' } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true, isArchived: false } }),
    prisma.product.count({ where: { stockQuantity: 0 } }),
  ]);

  res.json({
    sales: { total: totalSales._sum.total, today: todaySales._sum.total, week: weekSales._sum.total, month: monthSales._sum.total },
    orders: { total: totalOrders, pending: pendingOrders, processing: processingOrders, completed: completedOrders, cancelled: cancelledOrders },
    customers: { total: totalCustomers, new: newCustomers },
    products: { total: totalProducts, active: activeProducts, outOfStock },
  });
});

export default router;
