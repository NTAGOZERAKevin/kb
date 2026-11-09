import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

  const [notifications, unread] = await Promise.all([
    Notification.list(limit),
    Notification.countUnread(),
  ]);

  res.json({ success: true, data: { notifications, unread } });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.markRead(req.params.id);

  if (!notification) {
    throw new ApiError(404, 'That notification could not be found');
  }

  res.json({ success: true, data: { notification } });
});

export const markAllNotificationsRead = asyncHandler(async (_req, res) => {
  await Notification.markAllRead();
  res.json({ success: true, message: 'All notifications marked as read' });
});
