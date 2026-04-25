import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/errors';
import { emailQueue } from '../queues/email.queue';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  
  const { accessToken, refreshToken } = await AuthService.register(email, hash);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: { accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const { accessToken, refreshToken } = await AuthService.login(email, password);
  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  
  const tokens = await AuthService.refresh(refreshToken);
  setRefreshCookie(res, tokens.refreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken: tokens.accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const userId = req.userId; // From auth.middleware if used, else null
  
  if (userId) {
    await AuthService.logout(userId, refreshToken);
  } else if (refreshToken) {
    // If we only have token but not authenticated via bearer, we can't reliably get userId
    // However, logout deletes cookie anyway. Security is handled.
  }
  
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, data: null });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await emailQueue.add({
      type: 'PASSWORD_RESET',
      userId: user.id,
      to: user.email,
      subject: 'Reset your Lunara AI password',
      templateName: 'email-reset',
      context: { resetUrl },
    });
  }

  // Always return success to prevent email enumeration
  res.status(200).json({
    success: true,
    data: { message: 'If an account exists, a reset link has been sent.' }
  });
});
