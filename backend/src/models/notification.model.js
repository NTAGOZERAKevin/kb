import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { isUuid, mapNotification } from '../db/rows.js';

const NOTIFICATION_COLUMNS =
  'id, type, title, message, order_id, customer_id, channels, is_read, created_at, updated_at';

export const Notification = {
  async create({ type = 'system', title, message, order, customer, channels = [] }) {
    const { rows } = await query(
      `insert into notifications (id, type, title, message, order_id, customer_id, channels)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning ${NOTIFICATION_COLUMNS}`,
      [
        randomUUID(),
        type,
        title,
        message,
        isUuid(order) ? order : null,
        isUuid(customer) ? customer : null,
        JSON.stringify(channels),
      ],
    );

    return mapNotification(rows[0]);
  },

  async list(limit = 10) {
    const { rows } = await query(
      `select ${NOTIFICATION_COLUMNS} from notifications
       order by created_at desc
       limit $1`,
      [limit],
    );

    return rows.map(mapNotification);
  },

  async countUnread() {
    const { rows } = await query(
      'select count(*)::int as total from notifications where is_read = false',
    );
    return rows[0].total;
  },

  async markRead(id) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `update notifications set is_read = true, updated_at = now()
       where id = $1
       returning ${NOTIFICATION_COLUMNS}`,
      [id],
    );

    return mapNotification(rows[0]);
  },

  async markAllRead() {
    await query('update notifications set is_read = true, updated_at = now() where is_read = false');
  },
};
