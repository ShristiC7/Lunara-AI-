import { Request, Response } from 'express';
import { CycleService } from '../services/cycle.service';
import { asyncHandler } from '../utils/errors';

export const createCycle = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;
  const cycle = await CycleService.createCycle(req.userId, startDate, endDate);
  res.status(201).json({ success: true, data: cycle });
});

export const updateCycle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.updateCycle(id, req.userId, req.body);
  res.status(200).json({ success: true, data: cycle });
});

export const getCycles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const result = await CycleService.getCycles(req.userId as string, page, limit);
  res.status(200).json({ success: true, ...result });
});

export const getCycleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.getCycleById(id, req.userId as string);
  res.status(200).json({ success: true, data: cycle });
});

export const deleteCycle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CycleService.deleteCycle(id, req.userId as string);
  res.status(200).json({ success: true, data: null });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await CycleService.getStats(req.userId as string);
  res.status(200).json({ success: true, data: stats });
});
