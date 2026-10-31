import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';

const router = Router();

const databaseStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

router.get('/health', (_req, res) => {
  const database = databaseStates[mongoose.connection.readyState] || 'unknown';
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);

export default router;
