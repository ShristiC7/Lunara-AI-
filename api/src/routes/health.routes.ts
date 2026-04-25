import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

export default router;
