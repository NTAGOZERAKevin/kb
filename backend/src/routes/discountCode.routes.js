import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDiscountCode,
  deleteDiscountCode,
  listDiscountCodes,
  updateDiscountCode,
  validateDiscountCode,
} from '../controllers/discountCode.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const codeRule = body('code')
  .trim()
  .matches(/^[A-Za-z0-9-]{3,24}$/)
  .withMessage('Use 3-24 letters, numbers or dashes for the code');

const valueRule = body('value')
  .isFloat({ min: 1, max: 1000000 })
  .withMessage('Enter a discount value greater than zero');

const createValidation = [
  codeRule,
  body('description').optional().trim().isLength({ max: 120 }),
  body('type').isIn(['percentage', 'fixed']).withMessage('Choose percentage or fixed amount'),
  valueRule,
  body('minSubtotal').optional().isFloat({ min: 0 }),
  body('maxUses').optional({ nullable: true }).isInt({ min: 1 }),
  body('expiresAt').optional({ nullable: true }).isISO8601(),
  body('isActive').optional().isBoolean(),
];

const updateValidation = [
  codeRule.optional(),
  body('description').optional().trim().isLength({ max: 120 }),
  body('type').optional().isIn(['percentage', 'fixed']),
  valueRule.optional(),
  body('minSubtotal').optional().isFloat({ min: 0 }),
  body('maxUses').optional({ nullable: true }).isInt({ min: 1 }),
  body('expiresAt').optional({ nullable: true }).isISO8601(),
  body('isActive').optional().isBoolean(),
];

const validateValidation = [
  body('code').trim().notEmpty().withMessage('Enter your discount code'),
  body('subtotal').isFloat({ min: 0 }).withMessage('A cart subtotal is required'),
];

router.use(protect);

router.post('/validate', validateValidation, validate, validateDiscountCode);

router.get('/admin/all', authorize('owner'), listDiscountCodes);
router.post('/', authorize('owner'), createValidation, validate, createDiscountCode);
router.patch('/:id', authorize('owner'), updateValidation, validate, updateDiscountCode);
router.delete('/:id', authorize('owner'), deleteDiscountCode);

export default router;
