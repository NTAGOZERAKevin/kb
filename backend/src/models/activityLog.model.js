import { randomUUID } from 'node:crypto';
import { collection } from '../config/db.js';
import { isUuid } from '../db/rows.js';

export const ActivityLog = {
  async create({ userId, user, action, ip, userAgent, metadata }) {
    const owner = userId ?? user;

    await collection('activity_logs').insertOne({
      _id: randomUUID(),
      user: isUuid(owner) ? owner : null,
      action,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ?? null,
      createdAt: new Date(),
    });
  },
};
