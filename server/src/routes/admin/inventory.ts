import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { productId } = req.query;
  const where: any = {};
  if (productId) where.productId = productId;

  const transactions = await prisma.inventoryTransaction.findMany({
    where,
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(transactions);
});

router.post('/adjust', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { productId, variantId, quantity, reason } = req.body;
  if (!productId || !reason || quantity === undefined) {
    return res.status(400).json({ message: 'productId, quantity, and reason are required' });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const newStock = product.stockQuantity + parseInt(quantity);
  if (newStock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

  const type = parseInt(quantity) > 0 ? 'restock' : 'adjustment';

  const transaction = await prisma.inventoryTransaction.create({
    data: { productId, variantId, type, quantity: parseInt(quantity), reason, createdBy: req.adminId },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { stockQuantity: newStock },
  });

  res.status(201).json(transaction);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const { productId, variantId, type, quantity, reason, referenceId } = req.body;
  const transaction = await prisma.inventoryTransaction.create({
    data: { productId, variantId, type, quantity, reason, referenceId, createdBy: req.adminId },
  });

  if (type === 'restock' || type === 'adjustment') {
    await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: { increment: quantity } },
    });
  } else if (type === 'sale' || type === 'damaged') {
    await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: { decrement: quantity } },
    });
  }

  res.status(201).json(transaction);
});

export default router;
