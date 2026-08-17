import { Router } from 'express';
import dashboardRoutes from './dashboard.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import orderRoutes from './orders.js';
import customerRoutes from './customers.js';
import inventoryRoutes from './inventory.js';
import serviceRoutes from './services.js';
import locationRoutes from './locations.js';
import settingsRoutes from './settings.js';
import userRoutes from './users.js';
import notificationRoutes from './notifications.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/services', serviceRoutes);
router.use('/locations', locationRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

export default router;
