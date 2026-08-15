import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  res.json(services);
});

export default router;
