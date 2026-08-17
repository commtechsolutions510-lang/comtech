import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import authRoutes from './routes/auth.js';
import unifiedAuthRoutes from './routes/unified-auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import customerRoutes from './routes/customers.js';
import inventoryRoutes from './routes/admin/inventory.js';
import couponRoutes from './routes/coupons.js';
import serviceRoutes from './routes/services.js';
import locationRoutes from './routes/locations.js';
import settingsRoutes from './routes/settings.js';
import paymentRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin/index.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/auth', unifiedAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { prisma };
