import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/errors';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await UserService.getProfile(req.userId);
  res.status(200).json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await UserService.updateProfile(req.userId, req.body);
  res.status(200).json({ success: true, data: profile });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await UserService.deleteAccount(req.userId);
  res.status(200).json({ success: true, data: null });
});
