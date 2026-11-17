import { Router } from 'express';
import { body } from 'express-validator';
import { createAdmin, deleteAdmin, listAdmins } from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const createValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      'Password must be at least 8 characters and include uppercase, lowercase, and a number',
    ),
];

// Only the site owner may see, grant, or remove admin access. Admins get 403.
router.use(protect, authorize('owner'));

router.get('/', listAdmins);
router.post('/', createValidation, validate, createAdmin);
router.delete('/:id', deleteAdmin);

export default router;
