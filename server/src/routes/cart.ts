import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const items = await prisma.cartItem.findMany({
    where: { customerId: req.userId! },
    include: {
      product: { include: { images: true, category: true } },
      variant: { include: { optionValues: { include: { optionValue: { include: { option: true } } } } } },
    },
  });

  const formatted = items.map(item => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url || '/images/company/placeholder.jpg',
      basePrice: parseFloat(item.product.basePrice.toString()),
      salePrice: item.product.salePrice ? parseFloat(item.product.salePrice.toString()) : undefined,
      stockQuantity: item.product.stockQuantity,
      category: { name: item.product.category.name },
      images: item.product.images.map(img => ({ url: img.url })),
    },
    variant: item.variant ? {
      id: item.variant.id,
      price: parseFloat(item.variant.price.toString()),
      salePrice: item.variant.salePrice ? parseFloat(item.variant.salePrice.toString()) : undefined,
      stockQuantity: item.variant.stockQuantity,
      sku: item.variant.sku || '',
      isActive: item.variant.isActive,
      optionValues: item.variant.optionValues.map(ov => ({
        id: ov.optionValue.id,
        value: ov.optionValue.value,
        option: { id: ov.optionValue.option.id, name: ov.optionValue.option.name },
      })),
    } : undefined,
  }));

  res.json(formatted);
});

router.post('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.isArchived) return res.status(404).json({ message: 'Product not found' });

  const existing = await prisma.cartItem.findFirst({
    where: { customerId: req.userId!, productId, variantId: variantId || '' },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { customerId: req.userId!, productId, variantId, quantity },
  });
  res.status(201).json(item);
});

router.patch('/:id', authenticateCustomer, async (req: AuthRequest, res) => {
  const { quantity } = req.body;
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, customerId: req.userId! } });
  if (!item) return res.status(404).json({ message: 'Cart item not found' });

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });
  res.json(updated);
});

router.delete('/:id', authenticateCustomer, async (req: AuthRequest, res) => {
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, customerId: req.userId! } });
  if (!item) return res.status(404).json({ message: 'Cart item not found' });

  await prisma.cartItem.delete({ where: { id: item.id } });
  res.status(204).send();
});

export default router;
