import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const message = await prisma.contactMessage.create({ data: req.body });
  res.status(201).json({ message: 'Message received', id: message.id });
});

export default router;
