import { collection } from '../config/db.js';
import { Order } from '../models/order.model.js';

const PENDING_STATUSES = ['pending', 'confirmed', 'preparing'];

function orders() {
  return collection('orders');
}

export async function getRevenue() {
  const [stats] = await orders()
    .aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])
    .toArray();

  return Number(stats?.total ?? 0);
}

export async function countOrders() {
  return orders().countDocuments();
}

export async function countPendingOrders() {
  return orders().countDocuments({ status: { $in: PENDING_STATUSES } });
}

export async function getPeriodTotals(since) {
  const [stats] = await orders()
    .aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ])
    .toArray();

  return { total: Number(stats?.total ?? 0), count: stats?.count ?? 0 };
}

export async function listRecentOrders(limit = 6) {
  return Order.list({ limit, offset: 0 });
}

export async function getStatusBreakdown() {
  const rows = await orders()
    .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    .toArray();

  return rows.reduce((accumulator, row) => {
    accumulator[row._id] = row.count;
    return accumulator;
  }, {});
}

export async function getTopProducts(limit = 5) {
  const rows = await orders()
    .aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: limit },
    ])
    .toArray();

  return rows.map((row) => ({
    _id: row._id,
    quantity: row.quantity,
    revenue: Number(row.revenue),
  }));
}

export async function getSalesSeries(since) {
  const rows = await orders()
    .aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          total: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  return rows.map((row) => ({
    day: row._id,
    total: Number(row.total),
    orders: row.orders,
  }));
}
