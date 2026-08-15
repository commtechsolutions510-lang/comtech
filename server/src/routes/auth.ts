import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', body('email').isEmail(), body('password').isLength({ min: 6 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, fullName, phone } = req.body;
  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await prisma.customer.create({
    data: { email, passwordHash, fullName, phone },
  });

  const token = jwt.sign({ userId: customer.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.status(201).json({ token, customer: { id: customer.id, email: customer.email, fullName: customer.fullName, phone: customer.phone } });
});

router.post('/login', body('email').isEmail(), body('password').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.isActive) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: customer.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token, customer: { id: customer.id, email: customer.email, fullName: customer.fullName, phone: customer.phone } });
});

router.post('/forgot-password', body('email').isEmail(), async (req, res) => {
  const { email } = req.body;
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return res.status(200).json({ message: 'If an account exists, a reset link will be sent' });
  res.json({ message: 'If an account exists, a reset link will be sent' });
});

export default router;
