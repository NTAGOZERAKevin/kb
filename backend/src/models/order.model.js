import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { isUuid, mapOrder } from '../db/rows.js';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'delivered',
  'cancelled',
];

export const PAYMENT_METHODS = ['mtn_momo', 'airtel_money', 'card', 'cash_on_delivery'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const ORDER_FIELDS = [
  'id',
  'order_number',
  'user_id',
  'items',
  'customer',
  'shipping_address',
  'payment_method',
  'payment_status',
  'payment_reference',
  'paid_at',
  'status',
  'subtotal',
  'delivery_fee',
  'total',
  'notes',
  'status_history',
  'created_at',
  'updated_at',
];

const ORDER_COLUMNS = ORDER_FIELDS.map((field) => `o.${field}`).join(', ');

const USER_REF_COLUMNS =
  'u.name as user_name, u.email as user_email, u.phone as user_phone';

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BOM-${stamp}${random}`;
}

function orderFilter({ status, search } = {}) {
  const conditions = [];
  const params = [];

  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    params.push(`%${term}%`);
    const index = params.length;
    conditions.push(
      `(o.order_number ilike $${index} or o.customer->>'name' ilike $${index} or o.customer->>'email' ilike $${index})`,
    );
  }

  return {
    clause: conditions.length > 0 ? conditions.join(' and ') : 'true',
    params,
  };
}

export const Order = {
  async create(
    { userId, items, customer, shippingAddress, paymentMethod, subtotal, deliveryFee, total, notes },
    client,
  ) {
    const status = 'pending';
    const statusHistory = [
      { status, note: 'Order placed', changedAt: new Date().toISOString() },
    ];

    const { rows } = await query(
      `insert into orders (id, order_number, user_id, items, customer, shipping_address,
                           payment_method, payment_status, status, subtotal, delivery_fee, total,
                           notes, status_history)
       values ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13)
       returning ${ORDER_FIELDS.join(', ')}`,
      [
        randomUUID(),
        generateOrderNumber(),
        userId,
        JSON.stringify(items),
        JSON.stringify(customer),
        JSON.stringify(shippingAddress),
        paymentMethod,
        status,
        subtotal,
        deliveryFee,
        total,
        notes || null,
        JSON.stringify(statusHistory),
      ],
      client,
    );

    return mapOrder(rows[0]);
  },

  async findById(id, { withUser = false, client } = {}) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `select ${ORDER_COLUMNS}${withUser ? `, ${USER_REF_COLUMNS}` : ''}
       from orders o${withUser ? ' left join users u on u.id = o.user_id' : ''}
       where o.id = $1`,
      [id],
      client,
    );

    return mapOrder(rows[0]);
  },

  async listByUser(userId, limit = 50) {
    if (!isUuid(userId)) {
      return [];
    }

    const { rows } = await query(
      `select ${ORDER_COLUMNS} from orders o
       where o.user_id = $1
       order by o.created_at desc
       limit $2`,
      [userId, limit],
    );

    return rows.map(mapOrder);
  },

  async list({ status, search, limit, offset }) {
    const { clause, params } = orderFilter({ status, search });
    const limitIndex = params.length + 1;

    const { rows } = await query(
      `select ${ORDER_COLUMNS}, ${USER_REF_COLUMNS}
       from orders o
       left join users u on u.id = o.user_id
       where ${clause}
       order by o.created_at desc
       limit $${limitIndex} offset $${limitIndex + 1}`,
      [...params, limit, offset],
    );

    return rows.map(mapOrder);
  },

  async statsForUser(userId) {
    if (!isUuid(userId)) {
      return { count: 0, total: 0 };
    }

    const { rows } = await query(
      `select count(*)::int as count, coalesce(sum(total), 0) as total
       from orders
       where user_id = $1 and status <> 'cancelled'`,
      [userId],
    );

    return { count: rows[0].count, total: Number(rows[0].total) };
  },

  async count({ status, search } = {}) {
    const { clause, params } = orderFilter({ status, search });
    const { rows } = await query(`select count(*)::int as total from orders o where ${clause}`, params);
    return rows[0].total;
  },

  async updateStatus(id, { status, note, paymentStatus }, client) {
    if (!isUuid(id)) {
      return null;
    }

    const entry = [{ status, ...(note ? { note } : {}), changedAt: new Date().toISOString() }];

    const { rows } = await query(
      `update orders o set
         status = $2,
         payment_status = coalesce($3, o.payment_status),
         status_history = o.status_history || $4::jsonb,
         updated_at = now()
       where o.id = $1
       returning ${ORDER_COLUMNS}`,
      [id, status, paymentStatus ?? null, JSON.stringify(entry)],
      client,
    );

    return mapOrder(rows[0]);
  },

  async setPaymentReference(id, reference) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `update orders o set payment_reference = $2, updated_at = now()
       where o.id = $1
       returning ${ORDER_COLUMNS}`,
      [id, reference],
    );

    return mapOrder(rows[0]);
  },

  async confirmPayment(id, { reference }) {
    if (!isUuid(id)) {
      return null;
    }

    const historyEntry = [
      { status: 'confirmed', note: 'Payment confirmed', changedAt: new Date().toISOString() },
    ];

    const { rows } = await query(
      `update orders o set
         payment_status = 'paid',
         paid_at = now(),
         payment_reference = coalesce(o.payment_reference, $2),
         status = case when o.status = 'pending' then 'confirmed' else o.status end,
         status_history = case
           when o.status = 'pending' then o.status_history || $3::jsonb
           else o.status_history
         end,
         updated_at = now()
       where o.id = $1
       returning ${ORDER_COLUMNS}`,
      [id, reference, JSON.stringify(historyEntry)],
    );

    return mapOrder(rows[0]);
  },
};
