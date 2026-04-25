import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';
import sanitizeHtml from 'sanitize-html';

export class SymptomService {
  static sanitize(text?: string | null): string | undefined | null {
    if (text === undefined) return undefined;
    if (text === null) return null;
    return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
  }

  static async createSymptom(userId: string, data: any) {
    const { date, cycleId, mood, energyLevel, flowIntensity, painLevel, notes } = data;
    
    // Optional boundary check: ensure cycle belongs to user if cycleId provided
    if (cycleId) {
      const cycle = await prisma.cycle.findFirst({ where: { id: cycleId, userId } });
      if (!cycle) throw new AppError('Cycle restricted or not found', 403, 'FORBIDDEN');
    }

    return prisma.symptom.create({
      data: {
        userId,
        date: new Date(date),
        cycleId,
        mood,
        energyLevel,
        flowIntensity,
        painLevel,
        notes: this.sanitize(notes),
      },
    });
  }

  static async updateSymptom(id: string, userId: string, updateData: any) {
    const symptom = await prisma.symptom.findFirst({ where: { id, userId } });
    
    if (!symptom) {
      throw new AppError('Symptom not found', 404, 'NOT_FOUND');
    }

    if (updateData.cycleId) {
      const cycle = await prisma.cycle.findFirst({ where: { id: updateData.cycleId, userId } });
      if (!cycle) throw new AppError('Cycle restricted or not found', 403, 'FORBIDDEN');
    }

    return prisma.symptom.update({
      where: { id },
      data: {
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.cycleId !== undefined && { cycleId: updateData.cycleId }),
        ...(updateData.mood !== undefined && { mood: updateData.mood }),
        ...(updateData.energyLevel !== undefined && { energyLevel: updateData.energyLevel }),
        ...(updateData.flowIntensity !== undefined && { flowIntensity: updateData.flowIntensity }),
        ...(updateData.painLevel !== undefined && { painLevel: updateData.painLevel }),
        ...(updateData.notes !== undefined && { notes: this.sanitize(updateData.notes) }),
      },
    });
  }

  static async getSymptomsByCycle(cycleId: string, userId: string) {
    return prisma.symptom.findMany({
      where: { cycleId, userId },
      orderBy: { date: 'desc' },
    });
  }

  static async getSymptomById(id: string, userId: string) {
    const symptom = await prisma.symptom.findFirst({
      where: { id, userId },
    });

    if (!symptom) {
      throw new AppError('Symptom not found', 404, 'NOT_FOUND');
    }

    return symptom;
  }

  static async deleteSymptom(id: string, userId: string) {
    const symptom = await prisma.symptom.findFirst({ where: { id, userId } });
    if (!symptom) {
      throw new AppError('Symptom not found', 404, 'NOT_FOUND');
    }

    await prisma.symptom.delete({ where: { id } });
  }
}
