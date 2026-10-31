import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

let server;

async function startServer() {
  await connectDB();

  server = app.listen(env.port, () => {
    console.info(`Beauty Oil Market API listening on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    console.info(`${signal} received. Shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      console.error('Graceful shutdown timed out');
      process.exit(1);
    }, 10000);
    forceExit.unref();

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    await disconnectDB();
    clearTimeout(forceExit);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Failed to start the API', error);
  process.exit(1);
});
