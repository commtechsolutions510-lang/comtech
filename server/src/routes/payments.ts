import { Router } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

router.post('/paystack/initialize', async (req: AuthRequest, res) => {
  const { orderId, email, amount } = req.body;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const reference = `COM-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  await prisma.payment.updateMany({
    where: { orderId, status: 'pending' },
    data: { reference, providerRef: reference },
  });

  res.json({
    reference,
    amount: parseFloat(amount.toString()),
    email,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  });
});

router.post('/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!).update(req.body).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(401).send();

  const event = JSON.parse(req.body.toString());
  if (event.event === 'charge.success') {
    const { reference, amount, customer } = event.data;
    const payment = await prisma.payment.findFirst({ where: { reference } });
    if (!payment) return res.status(404).send();

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success', providerRef: event.data.id, metadata: event.data as any },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'paid', status: 'processing', paymentReference: reference },
    });
  }

  res.sendStatus(200);
});

export default router;
