import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  const formatted = services.map(s => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description || '',
    icon: s.icon || '',
    features: s.features,
  }));
  res.json(formatted);
});

export default router;
