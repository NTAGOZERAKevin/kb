import { Router } from 'express';
import { body } from 'express-validator';
import {
  confirmOrderPayment,
  createOrder,
  getOrder,
  initiateOrderPayment,
  listMyOrders,
  listOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Your cart is empty'),
  body('items.*.product').isUUID().withMessage('Invalid product in cart'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('paymentMethod')
    .optional()
    .isIn(['mtn_momo', 'airtel_money', 'card', 'cash_on_delivery'])
    .withMessage('Choose a valid payment method'),
];

router.use(protect);

router.post('/', orderValidation, validate, createOrder);
router.get('/my', listMyOrders);
router.get('/admin/all', authorize('admin'), listOrders);
router.patch('/admin/:id/status', authorize('admin'), updateOrderStatus);
router.patch('/admin/:id/confirm-payment', authorize('admin'), confirmOrderPayment);
router.post('/:id/pay', initiateOrderPayment);
router.get('/:id', getOrder);

export default router;
