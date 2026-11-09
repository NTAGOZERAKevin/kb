import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(error, _req, res, _next) {
  let normalizedError = error;

  if (error.code === '23505') {
    normalizedError = new ApiError(
      409,
      String(error.constraint || '').includes('email')
        ? 'An account with this email already exists'
        : 'That value is already in use',
    );
  } else if (error.code === '23503') {
    normalizedError = new ApiError(400, 'That record is linked to missing data');
  } else if (error.code === '23514') {
    normalizedError = new ApiError(422, 'Please correct the highlighted fields');
  } else if (error.code === '22P02') {
    normalizedError = new ApiError(400, 'The requested resource identifier is invalid');
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    normalizedError = new ApiError(401, 'Your session is invalid or has expired');
  } else if (error.name === 'MulterError') {
    normalizedError = new ApiError(
      error.code === 'LIMIT_FILE_SIZE' ? 413 : 400,
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Images must be 5MB or smaller'
        : 'We could not process that upload',
    );
  } else if (error.type === 'entity.parse.failed') {
    normalizedError = new ApiError(400, 'The request body contains invalid JSON');
  } else if (error.type === 'entity.too.large') {
    normalizedError = new ApiError(413, 'The request body is too large');
  }

  const statusCode = normalizedError.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError && !env.isTest) {
    console.error(normalizedError);
  }

  const response = {
    success: false,
    message:
      isServerError && env.isProduction
        ? 'Something went wrong. Please try again later.'
        : normalizedError.message,
  };

  if (normalizedError.details) {
    response.errors = normalizedError.details;
  }

  if (!env.isProduction && isServerError) {
    response.stack = normalizedError.stack;
  }

  res.status(statusCode).json(response);
}
