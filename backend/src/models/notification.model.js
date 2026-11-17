import { randomUUID } from 'node:crypto';
import { collection } from '../config/db.js';
import { isUuid, mapNotification } from '../db/rows.js';

function notifications() {
  return collection('notifications');
}

export const Notification = {
  async create({ type = 'system', title, message, order, customer, channels = [] }) {
    const now = new Date();
    const document = {
      _id: randomUUID(),
      type,
      title,
      message,
      order: isUuid(order) ? order : null,
      customer: isUuid(customer) ? customer : null,
      channels,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    };

    await notifications().insertOne(document);

    return mapNotification(document);
  },

  async list(limit = 10) {
    const documents = await notifications().find().sort({ createdAt: -1 }).limit(limit).toArray();

    return documents.map(mapNotification);
  },

  async countUnread() {
    return notifications().countDocuments({ isRead: false });
  },

  async markRead(id) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await notifications().findOneAndUpdate(
      { _id: id },
      { $set: { isRead: true, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return mapNotification(updated);
  },

  async markAllRead() {
    await notifications().updateMany(
      { isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } },
    );
  },
};
