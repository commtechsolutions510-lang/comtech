import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.userId! },
    include: { addresses: true },
  });
  res.json(customer);
});

router.patch('/', authenticateCustomer, async (req: AuthRequest, res) => {
  const { fullName, phone } = req.body;
  const customer = await prisma.customer.update({
    where: { id: req.userId! },
    data: { fullName, phone },
  });
  res.json(customer);
});

export default router;
