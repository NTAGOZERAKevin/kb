import { Router } from 'express';
import { isDatabaseHealthy } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import notificationRoutes from './notification.routes.js';
import orderRoutes from './order.routes.js';
import productRoutes from './product.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const connected = await isDatabaseHealthy();

    res.status(connected ? 200 : 503).json({
      success: connected,
      status: connected ? 'ok' : 'degraded',
      database: connected ? 'connected' : 'disconnected',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }),
);

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/uploads', uploadRoutes);
router.use('/notifications', notificationRoutes);

export default router;
