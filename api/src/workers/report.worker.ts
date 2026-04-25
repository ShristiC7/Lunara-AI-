import { reportQueue } from '../queues/report.queue';
import { logger } from '../utils/logger';

export const startReportWorker = () => {
  reportQueue.process('generate-pdf', async (job) => {
    const { userId } = job.data;
    logger.info(`Starting report generation for user ${userId}`, { jobId: job.id });

    // Mock progress
    await job.progress(10);
    await new Promise(r => setTimeout(r, 1000));
    
    await job.progress(50);
    await new Promise(r => setTimeout(r, 1000));
    
    await job.progress(100);
    
    logger.info(`Report generation stub complete for user ${userId}`);
    return { success: true, message: "PDF generation complete (stub)" };
  });

  reportQueue.on('failed', (job, err) => {
    if (job) {
      logger.error(`Report Job ${job.id} failed`, { error: err.message });
    }
  });

  reportQueue.on('completed', (job) => {
    logger.info(`Report Job ${job.id} finished`);
  });
};
