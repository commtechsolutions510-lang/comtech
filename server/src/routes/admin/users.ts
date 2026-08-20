import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin'), async (_req: AuthRequest, res) => {
  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, lastLogin: true },
  });
  res.json(users);
});

router.post('/', authenticateAdmin, requireRole('super_admin'), async (req: AuthRequest, res) => {
  const { email, fullName, password, role = 'admin' } = req.body;
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Admin already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({ data: { email, fullName, passwordHash, role } });
  res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
});

router.patch('/:id', authenticateAdmin, requireRole('super_admin'), async (req: AuthRequest, res) => {
  const { role, isActive } = req.body;
  const user = await prisma.adminUser.update({
    where: { id: req.params.id },
    data: { role, isActive },
  });
  res.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, isActive: user.isActive });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = jwt.sign({ adminId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '8h' });
  res.json({ token, admin: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
});

export default router;
