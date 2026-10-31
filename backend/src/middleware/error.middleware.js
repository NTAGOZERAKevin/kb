import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(error, _req, res, _next) {
  let normalizedError = error;

  if (error.name === 'CastError') {
    normalizedError = new ApiError(400, 'The requested resource identifier is invalid');
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    normalizedError = new ApiError(409, `An account with this ${field} already exists`);
  } else if (error.name === 'ValidationError') {
    normalizedError = new ApiError(
      422,
      'Please correct the highlighted fields',
      Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    );
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    normalizedError = new ApiError(401, 'Your session is invalid or has expired');
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
