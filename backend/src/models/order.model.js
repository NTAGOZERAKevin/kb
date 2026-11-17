import { randomUUID } from 'node:crypto';
import { collection, sessionOptions } from '../config/db.js';
import { isUuid, mapOrder } from '../db/rows.js';

function orders() {
  return collection('orders');
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'delivered',
  'cancelled',
];

export const PAYMENT_METHODS = ['mtn_momo', 'airtel_money', 'card', 'cash_on_delivery'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SGB-${stamp}${random}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function orderFilter({ status, search } = {}) {
  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    const pattern = { $regex: escapeRegExp(term), $options: 'i' };
    filter.$or = [
      { orderNumber: pattern },
      { 'customer.name': pattern },
      { 'customer.email': pattern },
    ];
  }

  return filter;
}

async function usersById(ids) {
  if (ids.length === 0) {
    return new Map();
  }

  const users = await collection('users')
    .find({ _id: { $in: [...new Set(ids)] } })
    .project({ name: 1, email: 1, phone: 1 })
    .toArray();

  return new Map(users.map((user) => [user._id, user]));
}

export const Order = {
  async create(
    { userId, items, customer, shippingAddress, paymentMethod, subtotal, deliveryFee, total, notes },
    client,
  ) {
    const now = new Date();
    const status = 'pending';
    const statusHistory = [
      { status, note: 'Order placed', changedAt: now.toISOString() },
    ];

    const document = {
      _id: randomUUID(),
      orderNumber: generateOrderNumber(),
      user: userId,
      items,
      customer,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      paymentReference: null,
      paidAt: null,
      status,
      subtotal,
      deliveryFee,
      total,
      notes: notes || null,
      statusHistory,
      createdAt: now,
      updatedAt: now,
    };

    await orders().insertOne(document, sessionOptions(client));

    return mapOrder(document);
  },

  async findById(id, { withUser = false, client } = {}) {
    if (!isUuid(id)) {
      return null;
    }

    const document = await orders().findOne({ _id: id }, sessionOptions(client));

    if (!document) {
      return null;
    }

    const user = withUser ? (await usersById([document.user])).get(document.user) : undefined;

    return mapOrder(document, { user });
  },

  async listByUser(userId, limit = 50) {
    if (!isUuid(userId)) {
      return [];
    }

    const documents = await orders()
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return documents.map((document) => mapOrder(document));
  },

  async list({ status, search, limit, offset }) {
    const documents = await orders()
      .find(orderFilter({ status, search }))
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const users = await usersById(documents.map((document) => document.user));

    return documents.map((document) => mapOrder(document, { user: users.get(document.user) }));
  },

  async statsForUser(userId) {
    if (!isUuid(userId)) {
      return { count: 0, total: 0 };
    }

    const [stats] = await orders()
      .aggregate([
        { $match: { user: userId, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } },
      ])
      .toArray();

    return { count: stats?.count ?? 0, total: Number(stats?.total ?? 0) };
  },

  async count({ status, search } = {}) {
    return orders().countDocuments(orderFilter({ status, search }));
  },

  async updateStatus(id, { status, note, paymentStatus }, client) {
    if (!isUuid(id)) {
      return null;
    }

    const entry = [{ status, ...(note ? { note } : {}), changedAt: new Date().toISOString() }];

    const updated = await orders().findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
          updatedAt: new Date(),
        },
        $push: { statusHistory: { $each: entry } },
      },
      { ...sessionOptions(client), returnDocument: 'after' },
    );

    return mapOrder(updated);
  },

  async setPaymentReference(id, reference) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await orders().findOneAndUpdate(
      { _id: id },
      { $set: { paymentReference: reference, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return mapOrder(updated);
  },

  async confirmPayment(id, { reference }) {
    if (!isUuid(id)) {
      return null;
    }

    const current = await orders().findOne({ _id: id });

    if (!current) {
      return null;
    }

    const wasPending = current.status === 'pending';
    const historyEntry = [
      { status: 'confirmed', note: 'Payment confirmed', changedAt: new Date().toISOString() },
    ];

    const updated = await orders().findOneAndUpdate(
      { _id: id },
      {
        $set: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          paymentReference: current.paymentReference ?? reference,
          ...(wasPending ? { status: 'confirmed' } : {}),
          updatedAt: new Date(),
        },
        ...(wasPending ? { $push: { statusHistory: { $each: historyEntry } } } : {}),
      },
      { returnDocument: 'after' },
    );

    return mapOrder(updated);
  },
};
