import { Request, Response } from 'express';
import { aiQueue } from '../queues/ai.queue';
import { reportQueue } from '../queues/report.queue';
import { asyncHandler } from '../utils/errors';
import { AppError } from '../utils/errors';

export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Try to find job in AI queue first
  let job = await aiQueue.getJob(id);
  let queueName = 'ai-inference';

  if (!job) {
    // Then check report queue
    job = await reportQueue.getJob(id);
    queueName = 'pdf-generation';
  }

  if (!job) {
    throw new AppError('Job not found', 404, 'NOT_FOUND');
  }

  const state = await job.getState();
  const progress = job.progress();
  
  res.status(200).json({
    success: true,
    data: {
      jobId: job.id,
      queue: queueName,
      state,
      progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
    },
  });
});
