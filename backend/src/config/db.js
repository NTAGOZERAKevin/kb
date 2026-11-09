import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool;

function connectionString() {
  try {
    const value = new URL(env.databaseUrl);

    // sslmode is handled by the ssl option below so both pooler and direct
    // connections behave the same way.
    value.searchParams.delete('sslmode');

    return value.toString();
  } catch {
    return env.databaseUrl;
  }
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: connectionString(),
      ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (error) => {
      console.error('Unexpected database pool error', error);
    });
  }

  return pool;
}

export async function connectDB() {
  const client = await getPool().connect();

  try {
    await client.query('select current_database() as name');
  } finally {
    client.release();
  }

  return getPool();
}

export async function disconnectDB() {
  if (pool) {
    const activePool = pool;
    pool = undefined;
    await activePool.end();
  }
}

export function query(text, params, client = getPool()) {
  return client.query(text, params);
}

export async function withTransaction(handler) {
  const client = await getPool().connect();

  try {
    await client.query('begin');
    const result = await handler(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function isDatabaseHealthy() {
  try {
    await getPool().query('select 1');
    return true;
  } catch {
    return false;
  }
}
