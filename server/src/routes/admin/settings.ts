import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, requireRole, AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const defaultSettings = {
  company: { name: 'Commtech Solutions', tagline: 'Technology, Connectivity & Everyday Solutions', description: '', email: '', phone: '', address: '' },
  socials: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
  currency: { code: 'GHS', symbol: 'GH₵', rate: 1 },
  delivery: { freeDeliveryThreshold: 200, standardDeliveryFee: 15, expressDeliveryFee: 30, estimatedDays: '3-5' },
  payment: { acceptCashOnDelivery: true, acceptBankTransfer: true, acceptMobileMoney: true, acceptCard: false },
};

router.get('/', authenticateAdmin, requireRole('super_admin', 'admin', 'staff'), async (_req: AuthRequest, res) => {
  const settings = await prisma.websiteSetting.findMany();
  const settingsObj: Record<string, any> = { ...defaultSettings };
  for (const s of settings) {
    try {
      settingsObj[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
    } catch {
      settingsObj[s.key] = s.value;
    }
  }
  res.json(settingsObj);
});

router.patch('/', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  const updates = req.body;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    result[key] = await prisma.websiteSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
  res.json(result);
});

router.delete('/:key', authenticateAdmin, requireRole('super_admin', 'admin'), async (req: AuthRequest, res) => {
  await prisma.websiteSetting.delete({ where: { key: req.params.key } }).catch(() => null);
  res.status(204).send();
});

export default router;
