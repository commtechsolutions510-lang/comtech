import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import bcrypt from 'bcrypt';
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

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      console.log('Seeding database...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      await prisma.adminUser.create({
        data: {
          email: 'admin@commtechsolutions.com',
          fullName: 'Super Admin',
          passwordHash: adminPassword,
          role: 'super_admin',
        },
      });

      const settings = {
        company: { name: 'Commtech Solutions', tagline: 'Technology, Connectivity & Everyday Solutions', description: 'Commtech Solutions is a trusted provider of IT, telecommunications, electronics, phone accessories, computer accessories, networking products, and agency banking services.', email: 'info@commtechsolutions.com', phone: '+233 24 359 0590', address: 'Musukoo Avenue, GE-270-7367, Accra, Ghana', whatsapp: '+233 24 359 0590' },
        socials: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
        currency: { code: 'GHS', symbol: 'GH₵', rate: 1 },
        delivery: { freeDeliveryThreshold: 200, standardDeliveryFee: 15, expressDeliveryFee: 30, estimatedDays: '3-5' },
        payment: { acceptCashOnDelivery: true, acceptBankTransfer: true, acceptMobileMoney: true, acceptCard: false },
      };

      for (const [key, value] of Object.entries(settings)) {
        await prisma.websiteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }

      const categories = [
        { name: 'Storage & Memory', slug: 'storage-memory', description: 'USB drives, SD cards, memory cards and storage solutions' },
        { name: 'Cables & Adapters', slug: 'cables-adapters', description: 'Charging cables, data cables, adapters and connectors' },
        { name: 'Power & Chargers', slug: 'power-chargers', description: 'Wall chargers, power banks, car chargers and power solutions' },
        { name: 'Audio & Video', slug: 'audio-video', description: 'Headphones, speakers, earphones and video accessories' },
        { name: 'Networking & Connectivity', slug: 'networking-connectivity', description: 'Routers, modems, extenders and network accessories' },
        { name: 'Computers & Peripherals', slug: 'computers-peripherals', description: 'Keyboards, mice, laptop bags and computer accessories' },
        { name: 'Gaming & TV', slug: 'gaming-tv', description: 'Gaming accessories, TV mounts, remotes and entertainment' },
        { name: 'Phone Accessories', slug: 'phone-accessories', description: 'Phone cases, screen protectors, chargers and mobile accessories' },
        { name: 'Other Electronics', slug: 'other-electronics', description: 'Miscellaneous electronic accessories and gadgets' },
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: cat,
          create: cat,
        });
      }

      const services = [
        { title: 'IT Services', slug: 'it-services', description: 'Computer repairs, software installation, networking setup and IT consulting', icon: '💻', features: ['Computer Repairs', 'Software Installation', 'Network Setup', 'IT Consulting'], displayOrder: 1 },
        { title: 'Telecommunications', slug: 'telecommunications', description: 'Mobile phone sales, accessories and telecommunication solutions', icon: '📱', features: ['Mobile Phones', 'SIM Cards', 'Top-up Services', 'Network Support'], displayOrder: 2 },
        { title: 'Agency Banking', slug: 'agency-banking', description: 'Banking services including deposits, withdrawals and money transfers', icon: '🏦', features: ['Cash Deposits', 'Withdrawals', 'Money Transfers', 'Bill Payments'], displayOrder: 3 },
        { title: 'Fidelity Bank Agency', slug: 'fidelity-bank-agency', description: 'Fidelity Bank agency services for all your banking needs', icon: '🏛️', features: ['Account Opening', 'Deposits', 'Withdrawals', 'Transfers'], displayOrder: 4 },
        { title: 'AirtelTigo Agent Services', slug: 'airteltigo-agent-services', description: 'AirtelTigo SIM registration, top-ups and customer services', icon: '📶', features: ['SIM Registration', 'Airtime Top-up', 'Data Bundles', 'Customer Support'], displayOrder: 5 },
        { title: 'Vodafone Cash Hub', slug: 'vodafone-cash-hub', description: 'Vodafone Cash registration, deposits, withdrawals and transfers', icon: '💰', features: ['Registration', 'Deposits', 'Withdrawals', 'Transfers'], displayOrder: 6 },
      ];

      for (const svc of services) {
        await prisma.service.upsert({
          where: { slug: svc.slug },
          update: svc,
          create: svc,
        });
      }

      const locations = [
        { name: 'Commtech Solutions Head Office', slug: 'head-office', description: 'Main headquarters of Commtech Solutions', address: 'Musukoo Avenue, GE-270-7367, Accra, Ghana', phone: '+233 24 359 0590', hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM', mapUrl: 'https://www.ghanapostgps.com/map/#GE2707367', type: 'head-office', displayOrder: 1 },
        { name: 'Kwabenya Roundabout Retail Outlet', slug: 'kwabenya-outlet', description: 'Retail outlet at Kwabenya Roundabout', address: 'Kwabenya Roundabout, Accra, Ghana', phone: '+233 24 359 0590', hours: 'Mon-Sat: 8:00 AM - 7:00 PM, Sun: 1:00 PM - 5:00 PM', mapUrl: 'https://www.ghanapostgps.com/map/#GE2707367', type: 'retail', displayOrder: 2 },
        { name: 'Haatso Retail Outlet', slug: 'haatso-outlet', description: 'Retail outlet in Haatso', address: 'Haatso, Accra, Ghana', phone: '+233 24 359 0590', hours: 'Mon-Sat: 8:00 AM - 7:00 PM, Sun: 1:00 PM - 5:00 PM', mapUrl: 'https://www.ghanapostgps.com/map/#GE2707367', type: 'retail', displayOrder: 3 },
      ];

      for (const loc of locations) {
        await prisma.location.upsert({
          where: { slug: loc.slug },
          update: loc,
          create: loc,
        });
      }

      console.log('Database seeded successfully');
    } else {
      console.log('Database already seeded, skipping.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
