import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { isUuid, mapUser } from '../db/rows.js';

const publicColumns =
  'id, name, email, role, phone, address, is_active, last_login, created_at, updated_at';

function normalizeEmail(email) {
  return String(email ?? '')
    .toLowerCase()
    .trim();
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
}

export const User = {
  async existsByEmail(email) {
    const { rows } = await query('select 1 from users where email = $1', [normalizeEmail(email)]);
    return rows.length > 0;
  },

  async create({ name, email, password, phone, role = 'customer', isActive = true }) {
    const { rows } = await query(
      `insert into users (id, name, email, password, role, phone, is_active)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning ${publicColumns}`,
      [
        randomUUID(),
        name,
        normalizeEmail(email),
        await hashPassword(password),
        role,
        phone || null,
        isActive,
      ],
    );

    return mapUser(rows[0]);
  },

  async findByEmail(email, { withPassword = false } = {}) {
    const { rows } = await query(
      `select ${publicColumns}${withPassword ? ', password' : ''} from users where email = $1`,
      [normalizeEmail(email)],
    );

    return mapUser(rows[0], { includePassword: withPassword });
  },

  async findById(id, { withPassword = false } = {}) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `select ${publicColumns}${withPassword ? ', password' : ''} from users where id = $1`,
      [id],
    );

    return mapUser(rows[0], { includePassword: withPassword });
  },

  async updateProfile(id, { name, phone, address }) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows: currentRows } = await query('select name, phone, address from users where id = $1', [
      id,
    ]);

    const current = currentRows[0];

    if (!current) {
      return null;
    }

    const mergedAddress =
      address === undefined ? current.address : { ...(current.address ?? {}), ...address };

    const { rows } = await query(
      `update users
       set name = $2, phone = $3, address = $4, updated_at = now()
       where id = $1
       returning ${publicColumns}`,
      [
        id,
        name ?? current.name,
        phone === undefined ? current.phone : phone || null,
        mergedAddress ?? null,
      ],
    );

    return mapUser(rows[0]);
  },

  async setPassword(id, newPassword) {
    await query('update users set password = $2, updated_at = now() where id = $1', [
      id,
      await hashPassword(newPassword),
    ]);
  },

  async recordLogin(id) {
    await query('update users set last_login = now() where id = $1', [id]);
  },

  async setActive(id, isActive) {
    const { rows } = await query(
      `update users set is_active = $2, updated_at = now()
       where id = $1 and role = 'customer'
       returning ${publicColumns}`,
      [id, isActive],
    );

    return mapUser(rows[0]);
  },

  async findCustomerById(id) {
    if (!isUuid(id)) {
      return null;
    }

    const { rows } = await query(
      `select ${publicColumns} from users where id = $1 and role = 'customer'`,
      [id],
    );

    return mapUser(rows[0]);
  },

  async countCustomers({ isActive, search } = {}) {
    const { clause, params } = customerFilter({ isActive, search });
    const { rows } = await query(
      `select count(*)::int as total from users u where ${clause}`,
      params,
    );
    return rows[0].total;
  },

  async listCustomers({ isActive, search, limit, offset }) {
    const { clause, params } = customerFilter({ isActive, search });
    const limitIndex = params.length + 1;

    const { rows } = await query(
      `select u.id, u.name, u.email, u.phone, u.address, u.is_active, u.last_login,
              u.created_at, u.updated_at,
              count(o.id)::int as order_count,
              coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0) as total_spent,
              max(o.created_at) as last_order_at
       from users u
       left join orders o on o.user_id = u.id
       where ${clause}
       group by u.id
       order by u.created_at desc
       limit $${limitIndex} offset $${limitIndex + 1}`,
      [...params, limit, offset],
    );

    return rows.map((row) => ({
      ...mapUser(row),
      orderCount: row.order_count,
      totalSpent: Number(row.total_spent),
      lastOrderAt: row.last_order_at ?? null,
    }));
  },

  async customerSummary(monthStart) {
    const { rows } = await query(
      `select
         count(*) filter (where role = 'customer')::int as total,
         count(*) filter (where role = 'customer' and not is_active)::int as inactive,
         count(*) filter (where role = 'customer' and created_at >= $1)::int as new_this_month
       from users`,
      [monthStart],
    );

    return rows[0];
  },
};

function customerFilter({ isActive, search }) {
  const conditions = ["u.role = 'customer'"];
  const params = [];

  if (typeof isActive === 'boolean') {
    params.push(isActive);
    conditions.push(`u.is_active = $${params.length}`);
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    params.push(`%${term}%`);
    const index = params.length;
    conditions.push(
      `(u.name ilike $${index} or u.email ilike $${index} or u.phone ilike $${index})`,
    );
  }

  return { clause: conditions.join(' and '), params };
}
