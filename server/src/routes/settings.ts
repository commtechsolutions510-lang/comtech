import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const settings = await prisma.websiteSetting.findMany();
  const settingsObj: Record<string, any> = {};
  for (const s of settings) settingsObj[s.key] = s.value;
  res.json(settingsObj);
});

export default router;
