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
  const requestedQuantity = Number(quantity);
  if (!productId || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    return res.status(400).json({ message: 'A valid product and positive integer quantity are required' });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || product.isArchived || !product.isActive) return res.status(404).json({ message: 'Product not found' });

  const hasVariants = product.variants.length > 0;
  const variant = variantId ? product.variants.find(item => item.id === variantId) : undefined;
  if (hasVariants && !variant) return res.status(400).json({ message: 'A valid product variant is required' });
  if (variant && (!variant.isActive || variant.stockQuantity < requestedQuantity)) {
    return res.status(400).json({ message: 'The selected variant is unavailable or has insufficient stock' });
  }
  if (!variant && product.stockQuantity < requestedQuantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { customerId: req.userId!, productId, variantId: variantId || null },
  });

  if (existing) {
    const availableStock = variant?.stockQuantity ?? product.stockQuantity;
    if (existing.quantity + requestedQuantity > availableStock) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
    }
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + requestedQuantity },
    });
    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { customerId: req.userId!, productId, variantId: variantId || null, quantity: requestedQuantity },
  });
  res.status(201).json(item);
});

router.patch('/:id', authenticateCustomer, async (req: AuthRequest, res) => {
  const { quantity } = req.body;
  const requestedQuantity = Number(quantity);
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, customerId: req.userId! } });
  if (!item) return res.status(404).json({ message: 'Cart item not found' });

  const stock = item.variantId
    ? await prisma.productVariant.findUnique({ where: { id: item.variantId }, select: { stockQuantity: true, isActive: true } })
    : await prisma.product.findUnique({ where: { id: item.productId }, select: { stockQuantity: true, isActive: true } });
  if (!stock?.isActive || requestedQuantity > stock.stockQuantity) {
    return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: requestedQuantity },
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
