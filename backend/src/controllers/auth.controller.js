import { User, verifyPassword } from '../models/user.model.js';
import { recordActivity } from '../services/activityLog.service.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signAccessToken,
} from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function withoutPassword(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.existsByEmail(email);
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

  const user = await User.findByEmail(email, { withPassword: true });

  if (!user) {
    await recordActivity({
      action: 'auth.login_failed',
      req,
      metadata: { email },
    });
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await verifyPassword(password, user.password);

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

  await User.recordLogin(user._id);
  user.lastLogin = new Date();

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
    data: { user: withoutPassword(user) },
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

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const existingUser = await User.findById(req.user._id);

  if (!existingUser) {
    throw new ApiError(404, 'That account could not be found');
  }

  const addressPatch = address
    ? Object.fromEntries(
        Object.entries(address).filter(([, value]) => value !== undefined && value !== ''),
      )
    : undefined;

  const user = await User.updateProfile(req.user._id, {
    name,
    phone,
    address: addressPatch,
  });

  await recordActivity({
    userId: user._id,
    action: 'auth.profile_updated',
    req,
  });

  res.json({
    success: true,
    message: 'Your details have been updated',
    data: { user },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id, { withPassword: true });

  if (!user) {
    throw new ApiError(404, 'That account could not be found');
  }

  const passwordMatches = await verifyPassword(currentPassword, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, 'Your current password is incorrect');
  }

  await User.setPassword(user._id, newPassword);

  await recordActivity({
    userId: user._id,
    action: 'auth.password_changed',
    req,
  });

  res.json({
    success: true,
    message: 'Your password has been updated',
  });
});
