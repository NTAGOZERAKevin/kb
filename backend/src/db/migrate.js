import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB, getDb } from '../config/db.js';

// Indexes take the place of the old SQL schema: MongoDB creates collections on
// first write, so only the indexes need to be declared up front.
const indexes = [
  ['users', { email: 1 }, { unique: true }],
  ['users', { role: 1 }],
  ['users', { createdAt: -1 }],
  ['products', { slug: 1 }, { unique: true }],
  ['products', { category: 1 }],
  ['products', { isActive: 1 }],
  ['products', { createdAt: -1 }],
  ['reviews', { product: 1, user: 1 }, { unique: true }],
  ['reviews', { product: 1 }],
  ['orders', { orderNumber: 1 }, { unique: true }],
  ['orders', { user: 1 }],
  ['orders', { status: 1 }],
  ['orders', { createdAt: -1 }],
  ['notifications', { isRead: 1 }],
  ['notifications', { createdAt: -1 }],
  ['activity_logs', { user: 1 }],
  ['activity_logs', { action: 1 }],
  ['activity_logs', { createdAt: -1 }],
];

export async function migrate() {
  const db = getDb();

  for (const [name, keys, options] of indexes) {
    await db.collection(name).createIndex(keys, options);
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  await connectDB();
  await migrate();
  console.info('Database indexes are up to date.');
  await disconnectDB();
}
