import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { imageUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.post(
  '/image',
  protect,
  authorize('admin'),
  imageUpload.single('image'),
  uploadImage,
);

export default router;
