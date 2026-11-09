import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB, getPool } from '../config/db.js';

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

export async function migrate() {
  const schema = await fs.readFile(schemaPath, 'utf8');
  await getPool().query(schema);
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  await connectDB();
  await migrate();
  console.info('Database schema is up to date.');
  await disconnectDB();
}
