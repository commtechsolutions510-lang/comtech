import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const locations = await prisma.location.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  res.json(locations);
});

export default router;
