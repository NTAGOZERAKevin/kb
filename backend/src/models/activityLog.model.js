import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { isUuid } from '../db/rows.js';

export const ActivityLog = {
  async create({ userId, action, ip, userAgent, metadata }) {
    await query(
      `insert into activity_logs (id, user_id, action, ip, user_agent, metadata)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        randomUUID(),
        isUuid(userId) ? userId : null,
        action,
        ip ?? null,
        userAgent ?? null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
  },
};
