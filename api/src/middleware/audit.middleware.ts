import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

export const auditLog = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We only log when the request finishes successfully or with intended failure,
    // but typically mutating means recording state after processing.
    res.on('finish', async () => {
      // Avoid logging safe GET requests natively, usually used on POST/PATCH/DELETE
      if (req.method !== 'GET') {
        try {
          // Fire and forget db interaction
          await prisma.auditLog.create({
            data: {
              userId: req.userId || null,
              action,
              resource,
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ip: req.ip,
                requestId: req.requestId,
              },
            },
          });
        } catch (error) {
          logger.error('Failed to write audit log', {
            error: (error as Error).message,
            action,
            resource,
          });
        }
      }
    });

    next();
  };
};
