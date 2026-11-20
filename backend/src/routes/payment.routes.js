import { Router } from 'express';
import { flutterwaveWebhook } from '../controllers/payment.controller.js';

const router = Router();

// Public: Flutterwave signs each call with the verif-hash header.
router.post('/flutterwave/webhook', flutterwaveWebhook);

export default router;
