import { aiQueue } from '../queues/ai.queue';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const startAiWorker = () => {
  aiQueue.process('analyze-symptoms', async (job) => {
    const { userId } = job.data;
    
    logger.info(`Processing symptom analysis for user ${userId}`, { jobId: job.id });
    
    try {
      // 1. Fetch symptoms
      const symptoms = await prisma.symptom.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        take: 30,
      });

      if (symptoms.length === 0) {
        throw new Error('No symptoms found to analyze');
      }

      // 2. Call FastAPI
      const response = await fetch(`${AI_SERVICE_URL}/analyze/symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symptoms }),
      });

      if (!response.ok) {
        throw new Error(`AI Service analysis failed with status ${response.status}`);
      }

      const analysis = await response.json();

      // 3. Store insight
      const insight = await prisma.aiInsight.create({
        data: {
          userId,
          insightType: 'SYMPTOM_ANALYSIS',
          content: analysis as any,
          status: 'completed',
        },
      });

      return { insightId: insight.id };
    } catch (error: any) {
      logger.error(`AI Analysis worker failed for user ${userId}`, { 
        jobId: job.id, 
        error: error.message 
      });
      throw error; // Rethrow for Bull retry
    }
  });

  aiQueue.on('failed', async (job, err) => {
    if (job) {
      logger.error(`AI Job ${job.id} failed after ${job.attemptsMade} attempts`, {
        error: err.message,
      });
      
      // Optionally create an AuditLog for persistent failure
      await prisma.auditLog.create({
        data: {
          userId: job.data.userId,
          action: 'AI_ANALYSIS_FAILED',
          resource: 'AiInsight',
          metadata: { status: 'failure', errorMessage: err.message, jobId: job.id } as any,
        },
      });
    }
  });

  aiQueue.on('completed', (job, result) => {
    logger.info(`AI Job ${job.id} completed successfully`, { result });
  });
};
