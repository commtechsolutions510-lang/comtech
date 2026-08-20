import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const locations = await prisma.location.findMany({ orderBy: { displayOrder: 'asc' } });
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
    status: l.isActive ? 'active' : 'inactive',
    whatsapp: l.whatsapp || '',
  }));
  res.json(formatted);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { name, slug, description, address, phone, hours, mapUrl, image, type, whatsapp } = req.body;
  const location = await prisma.location.create({ data: { name, slug, description, address, phone, hours, mapUrl, image, type, whatsapp } });
  res.status(201).json({ id: location.id, name: location.name, slug: location.slug, description: location.description || '', address: location.address, phone: location.phone, hours: location.hours || '', mapUrl: location.mapUrl || '', image: location.image || '/images/company/placeholder.jpg', type: location.type, status: 'active', whatsapp: location.whatsapp || '' });
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const data: any = {};
  const allowed = ['name', 'slug', 'description', 'address', 'phone', 'hours', 'mapUrl', 'image', 'type', 'whatsapp', 'isActive'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }

  const location = await prisma.location.update({ where: { id: req.params.id }, data });
  res.json({ id: location.id, name: location.name, slug: location.slug, description: location.description || '', address: location.address, phone: location.phone, hours: location.hours || '', mapUrl: location.mapUrl || '', image: location.image || '/images/company/placeholder.jpg', type: location.type, status: location.isActive ? 'active' : 'inactive', whatsapp: location.whatsapp || '' });
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.location.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});

export default router;
