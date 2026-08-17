import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const services = await prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
  const formatted = services.map(s => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description || '',
    icon: s.icon || '',
    image: s.image || '',
    features: s.features,
    status: s.isActive ? 'active' : 'inactive',
  }));
  res.json(formatted);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { title, slug, description, icon, image, features, isActive = true } = req.body;
  const service = await prisma.service.create({ data: { title, slug, description, icon, image, features: features || [], isActive, displayOrder: 0 } });
  res.status(201).json({ id: service.id, title: service.title, slug: service.slug, description: service.description || '', icon: service.icon || '', image: service.image || '', features: service.features, status: service.isActive ? 'active' : 'inactive' });
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const data: any = {};
  const allowed = ['title', 'slug', 'description', 'icon', 'image', 'features', 'isActive', 'displayOrder'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      data[key] = req.body[key];
    }
  }

  const service = await prisma.service.update({ where: { id: req.params.id }, data });
  res.json({ id: service.id, title: service.title, slug: service.slug, description: service.description || '', icon: service.icon || '', image: service.image || '', features: service.features, status: service.isActive ? 'active' : 'inactive' });
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;