import { Router } from 'express';
import dashboardRoutes from './dashboard';
import productRoutes from './products';
import categoryRoutes from './categories';
import orderRoutes from './orders';
import customerRoutes from './customers';
import inventoryRoutes from './inventory';
import serviceRoutes from './services';
import locationRoutes from './locations';
import settingsRoutes from './settings';
import userRoutes from './users';

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

export default router;
