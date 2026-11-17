import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { collection } from '../config/db.js';
import { isUuid, mapUser } from '../db/rows.js';

function users() {
  return collection('users');
}

function normalizeEmail(email) {
  return String(email ?? '')
    .toLowerCase()
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
}

export const User = {
  async existsByEmail(email) {
    const user = await users().findOne({ email: normalizeEmail(email) }, { projection: { _id: 1 } });
    return user !== null;
  },

  async create({ name, email, password, phone, role = 'customer', isActive = true }) {
    const now = new Date();
    const document = {
      _id: randomUUID(),
      name,
      email: normalizeEmail(email),
      password: await hashPassword(password),
      role,
      phone: phone || null,
      address: null,
      isActive,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };

    await users().insertOne(document);

    return mapUser(document);
  },

  async findByEmail(email, { withPassword = false } = {}) {
    const user = await users().findOne({ email: normalizeEmail(email) });

    return mapUser(user, { includePassword: withPassword });
  },

  async findById(id, { withPassword = false } = {}) {
    if (!isUuid(id)) {
      return null;
    }

    const user = await users().findOne({ _id: id });

    return mapUser(user, { includePassword: withPassword });
  },

  async updateProfile(id, { name, phone, address }) {
    if (!isUuid(id)) {
      return null;
    }

    const current = await users().findOne({ _id: id });

    if (!current) {
      return null;
    }

    const mergedAddress =
      address === undefined ? current.address : { ...(current.address ?? {}), ...address };

    const updated = await users().findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name: name ?? current.name,
          phone: phone === undefined ? current.phone : phone || null,
          address: mergedAddress ?? null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return mapUser(updated);
  },

  async setPassword(id, newPassword) {
    await users().updateOne(
      { _id: id },
      { $set: { password: await hashPassword(newPassword), updatedAt: new Date() } },
    );
  },

  async recordLogin(id) {
    await users().updateOne({ _id: id }, { $set: { lastLogin: new Date() } });
  },

  async setActive(id, isActive) {
    if (!isUuid(id)) {
      return null;
    }

    const updated = await users().findOneAndUpdate(
      { _id: id, role: 'customer' },
      { $set: { isActive, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return mapUser(updated);
  },

  async findCustomerById(id) {
    if (!isUuid(id)) {
      return null;
    }

    const user = await users().findOne({ _id: id, role: 'customer' });

    return mapUser(user);
  },

  async listAdmins() {
    const documents = await users()
      .find({ role: { $in: ['owner', 'admin'] } })
      .sort({ role: 1, createdAt: 1 })
      .toArray();

    return documents.map((document) => mapUser(document));
  },

  async countAdmins() {
    return users().countDocuments({ role: { $in: ['owner', 'admin'] } });
  },

  // The site owner is the single "owner" account. If none exists yet, the oldest
  // admin is promoted so an existing installation keeps working after this role
  // was introduced.
  async ensureOwner() {
    const existingOwner = await users().findOne({ role: 'owner' });

    if (existingOwner) {
      return mapUser(existingOwner);
    }

    const oldestAdmin = await users().find({ role: 'admin' }).sort({ createdAt: 1 }).limit(1).next();

    if (!oldestAdmin) {
      return null;
    }

    const promoted = await users().findOneAndUpdate(
      { _id: oldestAdmin._id },
      { $set: { role: 'owner', updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return mapUser(promoted);
  },

  async deleteCustomer(id) {
    if (!isUuid(id)) {
      return null;
    }

    const user = await users().findOneAndDelete({ _id: id, role: 'customer' });

    return mapUser(user);
  },

  async deleteAdmin(id) {
    if (!isUuid(id)) {
      return null;
    }

    const user = await users().findOneAndDelete({ _id: id, role: 'admin' });

    return mapUser(user);
  },

  async countCustomers({ isActive, search } = {}) {
    return users().countDocuments(customerFilter({ isActive, search }));
  },

  async listCustomers({ isActive, search, limit, offset }) {
    const matches = await users()
      .find(customerFilter({ isActive, search }))
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const ids = matches.map((user) => user._id);

    const stats =
      ids.length > 0
        ? await collection('orders')
            .aggregate([
              { $match: { user: { $in: ids } } },
              {
                $group: {
                  _id: '$user',
                  orderCount: { $sum: 1 },
                  totalSpent: {
                    $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0] },
                  },
                  lastOrderAt: { $max: '$createdAt' },
                },
              },
            ])
            .toArray()
        : [];

    const statsByUser = new Map(stats.map((entry) => [entry._id, entry]));

    return matches.map((user) => {
      const summary = statsByUser.get(user._id);

      return {
        ...mapUser(user),
        orderCount: summary?.orderCount ?? 0,
        totalSpent: Number(summary?.totalSpent ?? 0),
        lastOrderAt: summary?.lastOrderAt ?? null,
      };
    });
  },

  async customerSummary(monthStart) {
    const [total, inactive, newThisMonth] = await Promise.all([
      users().countDocuments({ role: 'customer' }),
      users().countDocuments({ role: 'customer', isActive: false }),
      users().countDocuments({ role: 'customer', createdAt: { $gte: monthStart } }),
    ]);

    return { total, inactive, new_this_month: newThisMonth };
  },
};

function customerFilter({ isActive, search }) {
  const filter = { role: 'customer' };

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  const term = String(search ?? '').trim().slice(0, 80);

  if (term) {
    const pattern = { $regex: escapeRegExp(term), $options: 'i' };
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }

  return filter;
}
