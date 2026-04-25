import { Request, Response } from 'express';
import { SymptomService } from '../services/symptom.service';
import { asyncHandler } from '../utils/errors';

export const createSymptom = asyncHandler(async (req: Request, res: Response) => {
  const symptom = await SymptomService.createSymptom(req.userId as string, req.body);
  res.status(201).json({ success: true, data: symptom });
});

export const updateSymptom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const symptom = await SymptomService.updateSymptom(id, req.userId as string, req.body);
  res.status(200).json({ success: true, data: symptom });
});

export const getSymptomsByCycle = asyncHandler(async (req: Request, res: Response) => {
  const { cycleId } = req.params;
  const symptoms = await SymptomService.getSymptomsByCycle(cycleId, req.userId as string);
  res.status(200).json({ success: true, data: symptoms });
});

export const getSymptomById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const symptom = await SymptomService.getSymptomById(id, req.userId as string);
  res.status(200).json({ success: true, data: symptom });
});

export const deleteSymptom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SymptomService.deleteSymptom(id, req.userId as string);
  res.status(200).json({ success: true, data: null });
});
