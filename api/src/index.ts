import { app } from './app';
import { prisma } from './lib/prisma';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const server = app.listen(PORT, () => {
  logger.info(`🌙 Lunara API running`, {
    port: PORT,
    env: process.env.NODE_ENV ?? 'development',
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

const gracefulShutdown = (signal: string) => async () => {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed. Graceful shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: (err as Error).message });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Graceful shutdown timeout — forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
