import { User } from '../models/user.model.js';
import { recordActivity } from '../services/activityLog.service.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signAccessToken,
} from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.exists({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  const token = signAccessToken(user);
  setAuthCookie(res, token);

  await recordActivity({
    userId: user._id,
    action: 'auth.register',
    req,
  });

  res.status(201).json({
    success: true,
    message: 'Your account has been created',
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await recordActivity({
      action: 'auth.login_failed',
      req,
      metadata: { email },
    });
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    await recordActivity({
      userId: user._id,
      action: 'auth.login_failed',
      req,
    });
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Please contact support.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signAccessToken(user);
  setAuthCookie(res, token);

  await recordActivity({
    userId: user._id,
    action: 'auth.login',
    req,
  });

  res.json({
    success: true,
    message: 'Welcome back',
    data: { user },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'You have been signed out',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});
