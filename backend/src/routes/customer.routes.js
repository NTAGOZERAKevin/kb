import { Router } from 'express';
import { body } from 'express-validator';
import {
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from '../controllers/customer.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const updateValidation = [
  body('isActive').isBoolean().withMessage('Choose whether this customer can sign in'),
];

router.use(protect, authorize('admin'));

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.patch('/:id', updateValidation, validate, updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
