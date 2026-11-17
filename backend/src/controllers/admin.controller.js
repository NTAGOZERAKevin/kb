import { User } from '../models/user.model.js';
import { recordActivity } from '../services/activityLog.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAdmins = asyncHandler(async (_req, res) => {
  const admins = await User.listAdmins();

  res.json({ success: true, data: { admins } });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.existsByEmail(email)) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const admin = await User.create({ name, email, password, role: 'admin' });

  await recordActivity({
    userId: req.user._id,
    action: 'admin.created',
    req,
    metadata: { email: admin.email },
  });

  res.status(201).json({
    success: true,
    message: `${admin.name} can now sign in and manage the business`,
    data: { admin },
  });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id) {
    throw new ApiError(422, 'You cannot remove your own access');
  }

  const target = await User.findById(req.params.id);

  if (target?.role === 'owner') {
    throw new ApiError(422, 'The site owner account cannot be removed');
  }

  if ((await User.countAdmins()) <= 1) {
    throw new ApiError(422, 'At least one account must keep access');
  }

  const admin = await User.deleteAdmin(req.params.id);

  if (!admin) {
    throw new ApiError(404, 'That admin account could not be found');
  }

  await recordActivity({
    userId: req.user._id,
    action: 'admin.removed',
    req,
    metadata: { email: admin.email },
  });

  res.json({
    success: true,
    message: `${admin.name} no longer has access`,
    data: { admin },
  });
});
