import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const details = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  next(new ApiError(422, 'Please correct the highlighted fields', details));
}
