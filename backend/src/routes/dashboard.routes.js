import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, authorize('admin'), getDashboard);

export default router;
