import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { asyncHandler } from '../utils/errors';
import { prisma } from '../lib/prisma';

export const getPrediction = asyncHandler(async (req: Request, res: Response) => {
  const prediction = await AiService.getCyclePrediction(req.userId as string);
  res.status(200).json({ success: true, data: prediction });
});

export const triggerAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const insight = await AiService.triggerSymptomAnalysis(req.userId as string);
  res.status(201).json({ success: true, data: insight });
});

export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.aiInsight.findMany({
      where: { userId: req.userId as string },
      orderBy: { generatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.aiInsight.count({ where: { userId: req.userId as string } }),
  ]);

  res.status(200).json({
    success: true,
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

export const getInsightById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const insight = await prisma.aiInsight.findFirst({
    where: { id, userId: req.userId as string },
  });

  if (!insight) {
    res.status(404).json({ success: false, error: { message: 'Insight not found' } });
    return;
  }

  res.status(200).json({ success: true, data: insight });
});
