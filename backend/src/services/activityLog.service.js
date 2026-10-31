import { ActivityLog } from '../models/activityLog.model.js';

export async function recordActivity({ userId, action, req, metadata }) {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      ip: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 300),
      metadata,
    });
  } catch (error) {
    console.error('Failed to record activity log', error);
  }
}
