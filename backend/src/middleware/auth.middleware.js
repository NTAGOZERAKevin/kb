import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { verifyAccessToken } from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';

function getRequestToken(req) {
  const authorization = req.get('authorization');

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return req.cookies?.[env.cookieName];
}

export async function protect(req, _res, next) {
  try {
    const token = getRequestToken(req);

    if (!token) {
      throw new ApiError(401, 'Please sign in to continue');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new ApiError(401, 'This account no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'This account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, 'Your session is invalid or has expired'));
  }
}

export function authorize(...roles) {
  return function authorizeRoles(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
}
