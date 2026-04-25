import winston from 'winston';

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: isTest,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'lunara-api' },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), simple()),
    }),
  ],
});

export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info('request', {
        requestId: req.requestId,
        userId: req.userId ?? null,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
    });
    next();
  };
};
