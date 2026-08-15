import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const { items, deliveryMethod, deliveryFee, discountAmount, couponId, deliveryAddress, notes } = req.body;
  
  const customer = await prisma.customer.findUnique({ where: { id: req.userId! } });
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, include: { variants: true } });

  const orderItems = items.map((item: any) => {
    const product = products.find(p => p.id === item.productId)!;
    const variant = product.variants.find(v => v.id === item.variantId);
    const unitPrice = variant?.price ? parseFloat(variant.price.toString()) : parseFloat(product.basePrice.toString());
    return {
      productId: product.id,
      variantId: item.variantId,
      productName: product.name,
      variantLabel: variant ? `${variant.label}: ${variant.value}` : null,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const total = subtotal + parseFloat(deliveryFee) - parseFloat(discountAmount);

  const orderNumber = `COM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerName: customer.fullName,
      deliveryMethod,
      deliveryFee: parseFloat(deliveryFee),
      discountAmount: parseFloat(discountAmount),
      subtotal,
      total,
      deliveryAddress: deliveryAddress?.address,
      deliveryRegion: deliveryAddress?.region,
      deliveryCity: deliveryAddress?.city,
      deliveryArea: deliveryAddress?.area,
      deliveryPhone: deliveryAddress?.contactPhone,
      deliveryNotes: deliveryAddress?.additional,
      notes,
      items: { create: orderItems },
      payments: { create: { amount: total, method: 'paystack', status: 'pending' } },
    },
    include: { items: true, payments: true },
  });

  await prisma.cartItem.deleteMany({ where: { customerId: customer.id } });

  res.status(201).json(order);
});

router.get('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { include: { images: true } } } }, payments: true },
  });
  res.json(orders);
});

router.get('/:id', authenticateCustomer, async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, customerId: req.userId! },
    include: { items: { include: { product: { include: { images: true } } } }, payments: true },
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

export default router;
