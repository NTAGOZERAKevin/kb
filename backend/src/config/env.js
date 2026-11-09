import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT || 5000);
const trustProxy = Number(process.env.TRUST_PROXY || 0);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number');
}

function resolveDatabaseSsl(connectionString) {
  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }

  if (process.env.DATABASE_SSL === 'true') {
    return true;
  }

  try {
    const { hostname } = new URL(connectionString);
    return !['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return true;
  }
}

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port,
  trustProxy,
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: resolveDatabaseSsl(process.env.DATABASE_URL),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  cookieName: process.env.COOKIE_NAME || 'bom_token',
  cookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  adminName: process.env.ADMIN_NAME || 'Beauty Oil Market Admin',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(backendRoot, 'uploads')),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.ADMIN_EMAIL,
  },
  notificationWebhookUrl: process.env.NOTIFICATION_WEBHOOK_URL,
  paymentMode: process.env.PAYMENT_MODE || 'mock',
});
