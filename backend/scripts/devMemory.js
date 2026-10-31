import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV ||= 'development';
process.env.MONGOMS_VERSION ||= '7.0.14';
process.env.JWT_SECRET ||= randomBytes(48).toString('hex');
process.env.CLIENT_URL ||= 'http://localhost:5173';
process.env.DEMO_ADMIN_EMAIL ||= 'demo@beautyoilmarket.com';
process.env.DEMO_ADMIN_PASSWORD ||= 'DemoPass123';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongoose = (await import('mongoose')).default;
const { User } = await import('../src/models/user.model.js');

const mongod = await MongoMemoryServer.create({
  binary: { version: process.env.MONGOMS_VERSION },
  instance: { dbName: 'beauty-oil-market' },
});

process.env.MONGODB_URI = mongod.getUri('beauty-oil-market');

await mongoose.connect(process.env.MONGODB_URI);

const demoEmail = process.env.DEMO_ADMIN_EMAIL.toLowerCase();
const existingDemoUser = await User.findOne({ email: demoEmail });

if (!existingDemoUser) {
  await User.create({
    name: 'Demo Admin',
    email: demoEmail,
    password: process.env.DEMO_ADMIN_PASSWORD,
    role: 'admin',
    phone: '+250 788 000 000',
    isActive: true,
  });
}

await mongoose.disconnect();

console.info('');
console.info('Demo database ready. Data resets whenever this process stops.');
console.info(`Demo login: ${demoEmail} / ${process.env.DEMO_ADMIN_PASSWORD}`);
console.info('');

const server = spawn(process.execPath, ['src/server.js'], {
  cwd: backendRoot,
  env: process.env,
  stdio: 'inherit',
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.info(`\n${signal} received. Stopping the demo environment...`);

  if (!server.killed) {
    server.kill(signal === 'SIGINT' ? 'SIGINT' : 'SIGTERM');
  }

  await mongod.stop();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.on('exit', async (code) => {
  if (!shuttingDown) {
    shuttingDown = true;
    await mongod.stop();
    process.exit(code ?? 0);
  }
});
