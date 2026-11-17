import { MongoClient } from 'mongodb';
import { env } from './env.js';

let client;
let db;
let transactionsSupported = false;

export function getClient() {
  if (!client) {
    client = new MongoClient(env.mongodbUri, {
      maxPoolSize: Number(process.env.MONGODB_POOL_MAX || 10),
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  return client;
}

export function getDb() {
  if (!db) {
    db = getClient().db(env.mongodbDb || undefined);
  }

  return db;
}

export function collection(name) {
  return getDb().collection(name);
}

// Sessions (multi-document transactions) need a replica set or a sharded
// cluster. A standalone server, which is what a local Compass connection
// usually points at, runs the handler without a transaction.
async function detectTransactions() {
  try {
    const hello = await getDb().admin().command({ hello: 1 });
    return Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch {
    return false;
  }
}

export async function connectDB() {
  await getClient().connect();
  await getDb().command({ ping: 1 });
  transactionsSupported = await detectTransactions();

  if (!transactionsSupported && !env.isTest) {
    console.warn(
      'MongoDB is running without transactions (standalone server). Order writes are not atomic.',
    );
  }

  return getDb();
}

export async function disconnectDB() {
  if (client) {
    const activeClient = client;
    client = undefined;
    db = undefined;
    transactionsSupported = false;
    await activeClient.close();
  }
}

export function sessionOptions(session) {
  return session ? { session } : {};
}

export async function withTransaction(handler) {
  if (!transactionsSupported) {
    return handler(null);
  }

  const session = getClient().startSession();

  try {
    session.startTransaction();
    const result = await handler(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function isDatabaseHealthy() {
  try {
    await getDb().command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
