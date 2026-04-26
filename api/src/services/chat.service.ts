import axios from 'axios';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';
import { subDays } from 'date-fns';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const chatService = {
  async getResponse(userId: string, userPrompt: string, history: any[]) {
    // 1. Gather Health Context
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const [latestCycle, recentSymptoms] = await Promise.all([
      prisma.cycle.findFirst({
        where: { userId },
        orderBy: { startDate: 'desc' },
      }),
      prisma.symptom.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    // Format context for AI
    const healthContext = {
      currentCycle: latestCycle ? {
        startDate: latestCycle.startDate,
        dayOfCycle: Math.floor((now.getTime() - latestCycle.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      } : 'No active cycle found',
      recentSymptoms: recentSymptoms.map(s => ({
        date: s.date,
        mood: s.mood,
        energy: s.energyLevel,
        pain: s.painLevel,
        notes: s.notes,
      })),
    };

    // 2. Call AI Service
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/chat/completions`, {
        user_prompt: userPrompt,
        health_context: healthContext,
        history: history,
      });

      return response.data;
    } catch (err) {
      console.error('AI Service Error:', err);
      throw new AppError('AI assistant is currently unavailable', 503);
    }
  },
};
