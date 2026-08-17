import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Unified login endpoint for both admin and customer
router.post('/unified-login', body('email').isEmail(), body('password').notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    // Check if it's an admin user
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });
    if (adminUser && adminUser.isActive) {
      const valid = await bcrypt.compare(password, adminUser.passwordHash);
      if (valid) {
        await prisma.adminUser.update({ where: { id: adminUser.id }, data: { lastLogin: new Date() } });
        const token = jwt.sign({ adminId: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET!, { expiresIn: '8h' });
        return res.json({
          token,
          userType: 'admin',
          user: { id: adminUser.id, email: adminUser.email, fullName: adminUser.fullName, role: adminUser.role }
        });
      }
    }

    // Check if it's a customer
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer && customer.isActive) {
      const valid = await bcrypt.compare(password, customer.passwordHash);
      if (valid) {
        const token = jwt.sign({ userId: customer.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        return res.json({
          token,
          userType: 'customer',
          user: { id: customer.id, email: customer.email, fullName: customer.fullName, phone: customer.phone }
        });
      }
    }

    // No valid user found
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
