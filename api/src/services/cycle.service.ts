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
}
