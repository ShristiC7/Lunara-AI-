import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class AuthService {
  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  }

  private static getRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET || 'dev-super-secret-refresh-key-change-in-production-64-chars';
  }

  static async register(email: string, passwordHash: string) {
    const lowerEmail = email.toLowerCase();
    
    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const user = await prisma.user.create({
      data: {
        email: lowerEmail,
        passwordHash,
      },
    });

    return this.generateTokens(user.id);
  }

  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    return this.generateTokens(user.id);
  }

  static async refresh(refreshToken: string) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, this.getRefreshSecret()) as { userId: string };
    } catch (err) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await prisma.refreshToken.findFirst({
      where: { userId: decoded.userId, tokenHash }
    });

    if (!storedToken) {
      // Token reuse detected - invalidate all tokens for user
      await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } });
      throw new AppError('Token stolen/reused. Please login again.', 401, 'TOKEN_REUSED');
    }

    if (storedToken.used) {
      await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } });
      throw new AppError('Token stolen/reused. Please login again.', 401, 'TOKEN_REUSED');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED');
    }

    // Mark used
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { used: true },
    });

    return this.generateTokens(decoded.userId);
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.deleteMany({
        where: { userId, tokenHash },
      });
    } else {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  private static async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, this.getJwtSecret(), { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any });
    const refreshToken = jwt.sign({ userId }, this.getRefreshSecret(), { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // roughly 30d

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
