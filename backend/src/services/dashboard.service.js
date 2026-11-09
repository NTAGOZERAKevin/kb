import { query } from '../config/db.js';
import { mapOrder } from '../db/rows.js';

const PENDING_STATUSES = ['pending', 'confirmed', 'preparing'];

export async function getRevenue() {
  const { rows } = await query(
    "select coalesce(sum(total), 0) as total from orders where status <> 'cancelled'",
  );
  return Number(rows[0].total);
}

export async function countOrders() {
  const { rows } = await query('select count(*)::int as total from orders');
  return rows[0].total;
}

export async function countPendingOrders() {
  const { rows } = await query(
    'select count(*)::int as total from orders where status = any($1::text[])',
    [PENDING_STATUSES],
  );
  return rows[0].total;
}

export async function getPeriodTotals(since) {
  const { rows } = await query(
    `select coalesce(sum(total), 0) as total, count(*)::int as count
     from orders
     where status <> 'cancelled' and created_at >= $1`,
    [since],
  );

  return { total: Number(rows[0].total), count: rows[0].count };
}

export async function listRecentOrders(limit = 6) {
  const { rows } = await query(
    `select o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
     from orders o
     left join users u on u.id = o.user_id
     order by o.created_at desc
     limit $1`,
    [limit],
  );

  return rows.map(mapOrder);
}

export async function getStatusBreakdown() {
  const { rows } = await query('select status, count(*)::int as count from orders group by status');

  return rows.reduce((accumulator, row) => {
    accumulator[row.status] = row.count;
    return accumulator;
  }, {});
}

export async function getTopProducts(limit = 5) {
  const { rows } = await query(
    `select item->>'name' as name,
            sum((item->>'quantity')::int)::int as quantity,
            sum((item->>'price')::numeric * (item->>'quantity')::int) as revenue
     from orders, jsonb_array_elements(items) as item
     where status <> 'cancelled'
     group by 1
     order by quantity desc
     limit $1`,
    [limit],
  );

  return rows.map((row) => ({
    _id: row.name,
    quantity: row.quantity,
    revenue: Number(row.revenue),
  }));
}

export async function getSalesSeries(since) {
  const { rows } = await query(
    `select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day,
            coalesce(sum(total), 0) as total,
            count(*)::int as orders
     from orders
     where status <> 'cancelled' and created_at >= $1
     group by 1
     order by 1`,
    [since],
  );

  return rows.map((row) => ({
    day: row.day,
    total: Number(row.total),
    orders: row.orders,
  }));
}
