import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class CycleService {
  static async createCycle(userId: string, startDate: string, endDate?: string) {
    let cycleLength: number | null = null;
    if (endDate) {
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return prisma.cycle.create({
      data: {
        userId,
        startDate: new Date(startDate),
        ...(endDate && { endDate: new Date(endDate) }),
        cycleLength,
      },
    });
  }

  static async updateCycle(id: string, userId: string, updateData: { startDate?: string; endDate?: string }) {
    const cycle = await prisma.cycle.findUnique({ where: { id } });
    
    if (!cycle || cycle.userId !== userId) {
      throw new AppError('Cycle not found', 404, 'NOT_FOUND');
    }

    const newStartDate = updateData.startDate ? new Date(updateData.startDate) : cycle.startDate;
    const newEndDate = updateData.endDate ? new Date(updateData.endDate) : cycle.endDate;

    let cycleLength: number | null = null;
    if (newStartDate && newEndDate) {
      if (newEndDate < newStartDate) {
         throw new AppError('endDate must be strictly greater than or equal to startDate', 400, 'VALIDATION_ERROR');
      }
      const diffTime = Math.abs(newEndDate.getTime() - newStartDate.getTime());
      cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return prisma.cycle.update({
      where: { id },
      data: {
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        cycleLength,
      },
    });
  }

  static async getCycles(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { symptoms: true } } },
      }),
      prisma.cycle.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCycleById(id: string, userId: string) {
    const cycle = await prisma.cycle.findFirst({
      where: { id, userId },
      include: { symptoms: { orderBy: { date: 'desc' } } },
    });

    if (!cycle) {
      throw new AppError('Cycle not found', 404, 'NOT_FOUND');
    }

    return cycle;
  }

  static async deleteCycle(id: string, userId: string) {
    const cycle = await prisma.cycle.findFirst({ where: { id, userId } });
    if (!cycle) {
      throw new AppError('Cycle not found', 404, 'NOT_FOUND');
    }

    await prisma.cycle.delete({ where: { id } });
  }

  static async getStats(userId: string) {
    const cycles = await prisma.cycle.findMany({
      where: { userId, NOT: { endDate: null } },
      orderBy: { startDate: 'desc' },
      take: 6,
      include: { symptoms: true },
    });

    if (cycles.length === 0) {
      return {
        averageCycleLength: 0,
        averagePeriodLength: 0,
        mostCommonSymptoms: [],
        regularityScore: 100,
      };
    }

    const validCycleLengths = cycles.map(c => c.cycleLength).filter((l): l is number => l !== null);
    const averageCycleLength = validCycleLengths.length > 0 
      ? Math.round(validCycleLengths.reduce((a, b) => a + b, 0) / validCycleLengths.length)
      : 0;

    const periodLengths = cycles.map(c => {
      if (!c.endDate) return 0;
      const diff = Math.abs(c.endDate.getTime() - c.startDate.getTime());
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });
    const averagePeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);

    // Most common symptoms
    const symptomCounts: Record<string, number> = {};
    const allSymptoms = cycles.flatMap(c => c.symptoms);
    
    // This is a simple counting of non-null symptom indicators
    allSymptoms.forEach(s => {
      if (s.flowIntensity && s.flowIntensity > 2) symptomCounts['Heavy Flow'] = (symptomCounts['Heavy Flow'] || 0) + 1;
      if (s.painLevel && s.painLevel > 3) symptomCounts['High Pain'] = (symptomCounts['High Pain'] || 0) + 1;
      if (s.mood && s.mood < 3) symptomCounts['Low Mood'] = (symptomCounts['Low Mood'] || 0) + 1;
      if (s.energyLevel && s.energyLevel < 3) symptomCounts['Low Energy'] = (symptomCounts['Low Energy'] || 0) + 1;
    });

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    // Regularity score (Standard Deviation)
    let regularityScore = 100;
    if (validCycleLengths.length > 1) {
      const avg = averageCycleLength;
      const squareDiffs = validCycleLengths.map(l => Math.pow(l - avg, 2));
      const stdDev = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length);
      // 0 stdDev = 100 score, each day of stdDev subtractions 5 points (arbitrary for v1)
      regularityScore = Math.max(0, 100 - Math.round(stdDev * 5));
    }

    return {
      averageCycleLength,
      averagePeriodLength,
      mostCommonSymptoms,
      regularityScore,
    };
  }
}
