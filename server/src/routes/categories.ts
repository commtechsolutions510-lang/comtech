import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
  const formatted = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    icon: '',
    image: c.image || '/images/company/placeholder.jpg',
  }));
  res.json(formatted);
});

export default router;
