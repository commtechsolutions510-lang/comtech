import { Router } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authenticateCustomer, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: AuthRequest, res) => {
  const { items, deliveryMethod, deliveryFee, discountAmount, couponId, deliveryAddress, notes, customerEmail, customerName, customerPhone } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one order item is required' });
  }

  const deliveryFeeAmount = new Prisma.Decimal(deliveryFee || 0);
  const discountAmountValue = new Prisma.Decimal(discountAmount || 0);
  if (deliveryFeeAmount.isNegative() || discountAmountValue.isNegative()) {
    return res.status(400).json({ message: 'Delivery fee and discount cannot be negative' });
  }
  
  let customerId: string | undefined;
  let customerEmailFinal = customerEmail;
  let customerNameFinal = customerName;
  let customerPhoneFinal = customerPhone;

  if (req.userId) {
    const customer = await prisma.customer.findUnique({ where: { id: req.userId } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    customerId = customer.id;
    customerEmailFinal = customer.email;
    customerNameFinal = customer.fullName;
    customerPhoneFinal = customer.phone;
  } else {
    if (!customerEmailFinal || !customerNameFinal || !customerPhoneFinal) {
      return res.status(400).json({ message: 'Customer email, name, and phone are required for guest checkout' });
    }
  }

  const productIds = [...new Set(items.map((i: any) => i.productId).filter(Boolean))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: { include: { optionValues: { include: { optionValue: { include: { option: true } } } } } } },
  });

  const orderItems = items.map((item: any) => {
    const product = products.find(p => p.id === item.productId);
    const quantity = Number(item.quantity);
    if (!product || product.isArchived || !product.isActive) throw new Error('Product is unavailable');
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid item quantity');
    const variant = item.variantId ? product.variants.find(v => v.id === item.variantId) : undefined;
    if (product.variants.length > 0 && !variant) throw new Error(`A variant is required for ${product.name}`);
    if (variant && (!variant.isActive || variant.stockQuantity < quantity)) throw new Error(`Insufficient stock for ${product.name}`);
    if (!variant && product.stockQuantity < quantity) throw new Error(`Insufficient stock for ${product.name}`);
    const unitPriceDecimal = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.basePrice;
    const unitPrice = new Prisma.Decimal(unitPriceDecimal);
    const variantLabel = variant?.optionValues.map(ov => `${ov.optionValue.option.name}: ${ov.optionValue.value}`).join(', ') || null;
    return {
      productId: product.id,
      variantId: variant?.id || null,
      productName: product.name,
      variantLabel,
      quantity,
      unitPrice,
      subtotal: unitPrice.mul(quantity),
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum.add(i.subtotal), new Prisma.Decimal(0));
  const total = subtotal.add(deliveryFeeAmount).sub(discountAmountValue);
  if (total.isNegative()) return res.status(400).json({ message: 'Order total cannot be negative' });

  const orderNumber = `COM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        if (item.variantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, isActive: true, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (updated.count !== 1) throw new Error(`Insufficient stock for ${item.productName}`);
        } else {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, isActive: true, isArchived: false, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (updated.count !== 1) throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          customerEmail: customerEmailFinal,
          customerPhone: customerPhoneFinal,
          customerName: customerNameFinal,
          deliveryMethod,
          deliveryFee: deliveryFeeAmount,
          discountAmount: discountAmountValue,
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

      for (const item of orderItems) {
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: 'sale',
            quantity: -item.quantity,
            reason: `Order ${orderNumber}`,
            referenceId: created.id,
            createdBy: customerId || 'guest',
          },
        });
      }
      if (customerId) await tx.cartItem.deleteMany({ where: { customerId } });
      return created;
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Unable to create order' });
  }
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
