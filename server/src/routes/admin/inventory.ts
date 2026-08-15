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
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(transactions);
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
    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: { increment: quantity } },
      });
    }
  } else if (type === 'sale' || type === 'damaged') {
    await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: { decrement: quantity } },
    });
    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: { decrement: quantity } },
      });
    }
  }

  res.status(201).json(transaction);
});

export default router;
