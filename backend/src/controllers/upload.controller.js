import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please choose an image to upload');
  }

  if (!allowedTypes.has(req.file.mimetype)) {
    throw new ApiError(415, 'Only JPG, PNG, WEBP, or GIF images are allowed');
  }

  if (isCloudinaryConfigured) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'beauty-oil-market',
          resource_type: 'image',
          transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }],
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(req.file.buffer);
    });

    res.status(201).json({
      success: true,
      data: { url: result.secure_url, provider: 'cloudinary' },
    });
    return;
  }

  await fs.mkdir(env.uploadDir, { recursive: true });

  const extension = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(env.uploadDir, filename), req.file.buffer);

  res.status(201).json({
    success: true,
    data: {
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
      provider: 'local',
    },
  });
});
