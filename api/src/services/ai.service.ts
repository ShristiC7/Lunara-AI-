import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';
import { aiQueue } from '../queues/ai.queue';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AiService {
  static async getCyclePrediction(userId: string) {
    const cycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    });

    if (cycles.length === 0) {
      // Return a basic default if no data, or handle in FastAPI
    }

    try {
      const response = await fetch(`${AI_SERVICE_URL}/predict/cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cycles }),
      });

      if (!response.ok) {
        throw new AppError('AI Service unavailable', 503, 'SERVICE_UNAVAILABLE');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to connect to AI service', 503, 'SERVICE_UNAVAILABLE');
    }
  }

  static async triggerSymptomAnalysis(userId: string) {
    // Check rate limit (10 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkCount = await prisma.aiInsight.count({
      where: {
        userId,
        generatedAt: { gte: today },
      },
    });

    if (checkCount >= 10) {
      throw new AppError('Daily AI insight limit reached (10/day)', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const symptomsCount = await prisma.symptom.count({ where: { userId } });
    if (symptomsCount === 0) {
      throw new AppError('No symptoms logged yet to analyze', 400, 'BAD_REQUEST');
    }

    // Add job to queue
    const job = await aiQueue.add('analyze-symptoms', { userId });
    
    return { jobId: job.id };
  }
}
