import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const locations = await prisma.location.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  const formatted = locations.map(l => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    description: l.description || '',
    address: l.address,
    phone: l.phone,
    hours: l.hours || '',
    mapUrl: l.mapUrl || '',
    image: l.image || '/images/company/placeholder.jpg',
    type: l.type,
  }));
  res.json(formatted);
});

export default router;
