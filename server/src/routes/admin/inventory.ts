import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

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

  const qty = parseInt(quantity);
  const type = qty > 0 ? 'restock' : 'adjustment';

  if (!Number.isInteger(qty) || qty === 0) return res.status(400).json({ message: 'Quantity must be a non-zero whole number' });

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      if (variantId) {
        const variant = await tx.productVariant.findFirst({ where: { id: variantId, productId } });
        if (!variant) throw new Error('Variant not found');
        if (variant.stockQuantity + qty < 0) throw new Error('Stock cannot be negative');
        await tx.productVariant.update({ where: { id: variantId }, data: { stockQuantity: variant.stockQuantity + qty } });
        const variants = await tx.productVariant.findMany({ where: { productId }, select: { stockQuantity: true } });
        await tx.product.update({ where: { id: productId }, data: { stockQuantity: variants.reduce((sum, item) => sum + item.stockQuantity, 0) } });
      } else {
        if (product.stockQuantity + qty < 0) throw new Error('Stock cannot be negative');
        await tx.product.update({ where: { id: productId }, data: { stockQuantity: product.stockQuantity + qty } });
      }
      return tx.inventoryTransaction.create({
        data: { productId, variantId, type, quantity: qty, reason, createdBy: req.adminId },
      });
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Unable to adjust stock' });
  }
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
