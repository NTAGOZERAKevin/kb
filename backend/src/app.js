import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { sanitizeRequest } from './middleware/security.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

app.disable('x-powered-by');

app.use('/uploads', express.static(env.uploadDir, { maxAge: '7d', index: false }));

if (env.trustProxy > 0) {
  app.set('trust proxy', env.trustProxy);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, 'This origin is not allowed to access the API'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(hpp());

if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'Beauty Oil Market API',
    version: 'v1',
    documentation: '/api/v1/health',
  });
});

app.use('/api', apiLimiter);
app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
