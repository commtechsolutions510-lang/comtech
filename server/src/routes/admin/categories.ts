import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (req: AuthRequest, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  const formatted = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    icon: '',
    image: c.image || '/images/company/placeholder.jpg',
    productsCount: c._count.products,
    status: c.isActive ? 'active' : 'inactive',
  }));
  res.json(formatted);
});

router.post('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { name, slug, description, image } = req.body;
  const category = await prisma.category.create({ data: { name, slug, description, image } });
  res.status(201).json({ id: category.id, name: category.name, slug: category.slug, description: category.description || '', icon: '', image: category.image || '/images/company/placeholder.jpg', productsCount: 0, status: 'active' });
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const { name, slug, description, image, isActive } = req.body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (image !== undefined) data.image = image;
  if (isActive !== undefined) data.isActive = isActive;

  const category = await prisma.category.update({ where: { id: req.params.id }, data });
  const count = await prisma.product.count({ where: { categoryId: category.id } });
  res.json({ id: category.id, name: category.name, slug: category.slug, description: category.description || '', icon: '', image: category.image || '/images/company/placeholder.jpg', productsCount: count, status: category.isActive ? 'active' : 'inactive' });
});

router.delete('/:id', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});

export default router;
