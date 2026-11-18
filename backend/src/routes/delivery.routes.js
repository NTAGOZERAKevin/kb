import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDeliveryMethod,
  deleteDeliveryMethod,
  listAllDeliveryMethods,
  listDeliveryMethods,
  updateDeliveryMethod,
} from '../controllers/delivery.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const createValidation = [
  body('label')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Give this location a name between 2 and 60 characters'),
  body('areas')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Describe the areas you deliver to'),
  body('eta')
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Add an estimated delivery time'),
  body('fee')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Delivery fee must be a whole number of francs'),
  body('isActive').optional().isBoolean().withMessage('Availability must be true or false'),
];

const updateValidation = [
  body('label').optional().trim().isLength({ min: 2, max: 60 }),
  body('areas').optional().trim().isLength({ min: 2, max: 200 }),
  body('eta').optional().trim().isLength({ min: 1, max: 60 }),
  body('fee').optional().isInt({ min: 0, max: 1000000 }),
  body('isActive').optional().isBoolean(),
];

// Customers read the locations that are currently available.
router.get('/', listDeliveryMethods);

// Only the site owner may price or change delivery. Admins (including the
// super/admin helper account) get 403 from `authorize('owner')`.
router.get('/admin/all', protect, authorize('owner'), listAllDeliveryMethods);
router.post('/', protect, authorize('owner'), createValidation, validate, createDeliveryMethod);
router.patch('/:id', protect, authorize('owner'), updateValidation, validate, updateDeliveryMethod);
router.delete('/:id', protect, authorize('owner'), deleteDeliveryMethod);

export default router;
