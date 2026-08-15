import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const settings = await prisma.websiteSetting.findMany();
  const settingsObj: Record<string, any> = {};
  for (const s of settings) settingsObj[s.key] = s.value;
  res.json(settingsObj);
});

router.patch('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const updates = req.body;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    result[key] = await prisma.websiteSetting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    });
  }
  res.json(result);
});

export default router;
