import { Router } from 'express';
import { body } from 'express-validator';
import { PRODUCT_CATEGORIES } from '../data/categories.js';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  listReviews,
  updateProduct,
  upsertReview,
} from '../controllers/product.controller.js';
import { authorize, optionalProtect, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const productValidation = [
  body('name').trim().isLength({ min: 2, max: 90 }).withMessage('Name is required'),
  body('category')
    .trim()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage('Choose a valid product category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 600 })
    .withMessage('Description must be between 10 and 600 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image')
    .trim()
    .isURL({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
    .withMessage('A valid image URL is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock cannot be negative'),
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Review must be between 3 and 500 characters'),
];

router.get('/', optionalProtect, listProducts);
router.get('/:identifier', getProduct);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', protect, reviewValidation, validate, upsertReview);

router.post('/', protect, authorize('admin'), productValidation, validate, createProduct);
router.patch('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
