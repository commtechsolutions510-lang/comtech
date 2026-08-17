import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const settings = await prisma.websiteSetting.findMany();
  const settingsObj: Record<string, any> = {};
  for (const s of settings) {
    try {
      settingsObj[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
    } catch {
      settingsObj[s.key] = s.value;
    }
  }
  res.json(settingsObj);
});

export default router;
