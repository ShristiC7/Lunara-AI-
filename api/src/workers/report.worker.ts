import { reportQueue } from '../queues/report.queue';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { PdfGenerator } from '../utils/pdf';
import { StorageService } from '../utils/s3';
import { AiService } from '../services/ai.service';
import { CycleService } from '../services/cycle.service';
import { emailQueue } from '../queues/email.queue';

export const startReportWorker = () => {
  reportQueue.process('generate-pdf', async (job) => {
    const { userId, dateRange = '3mo' } = job.data;
    logger.info(`Starting real report generation for user ${userId}`, { jobId: job.id });

    try {
      // 1. Gather Data
      await job.progress(10);
      const [cycles, symptoms, latestInsightRaw, prediction] = await Promise.all([
        prisma.cycle.findMany({ where: { userId }, orderBy: { startDate: 'desc' }, take: 10 }),
        prisma.symptom.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
        prisma.aiInsight.findFirst({ where: { userId }, orderBy: { generatedAt: 'desc' } }),
        AiService.getCyclePrediction(userId).catch(() => ({ predictedDate: 'N/A', confidence: 'UNKNOWN' }))
      ]);

      const cycleStats = await CycleService.getStats(userId);

      // 2. Formulate Report Data
      await job.progress(30);
      const reportData = {
        userId,
        generatedAt: new Date().toLocaleDateString(),
        avgCycleLength: cycleStats.averageCycleLength.toFixed(1),
        avgPeriodLength: cycleStats.averagePeriodLength.toFixed(1),
        cycles: cycles.map(c => ({
          startDate: c.startDate.toLocaleDateString(),
          endDate: c.endDate?.toLocaleDateString() || 'Ongoing',
          cycleLength: c.cycleLength || 'N/A'
        })),
        commonSymptoms: Array.from(new Set(symptoms.map(s => s.notes).filter(Boolean))).slice(0, 5),
        latestInsight: latestInsightRaw ? (latestInsightRaw.content as any).pattern_summary : 'No insights generated yet.',
        nextPredictedDate: prediction.predictedDate,
        confidence: prediction.confidence
      };

      // 3. Generate PDF
      await job.progress(50);
      const pdfBuffer = await PdfGenerator.generate(reportData);

      // 4. Upload to S3
      await job.progress(80);
      const filename = `reports/${userId}/health-report-${Date.now()}.pdf`;
      const s3Key = await StorageService.upload(filename, pdfBuffer);

      // 5. Store in DB
      const report = await prisma.report.create({
        data: {
          userId,
          fileUrl: s3Key,
          status: 'completed',
        }
      });

      await job.progress(100);
      logger.info(`Report generation complete for user ${userId}`, { reportId: report.id });
      
      // 6. Queue Email Delivery
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await emailQueue.add({
          type: 'REPORT_DELIVERY',
          userId,
          to: user.email,
          subject: `Your Health Report - ${reportData.generatedAt}`,
          templateName: 'email-report',
          context: { dateRange: '3 months' },
          reportId: report.id,
          attachments: [
            {
              filename: `Lunara-Health-Report-${Date.now()}.pdf`,
              content: pdfBuffer,
            }
          ]
        });
      }

      return { reportId: report.id };
    } catch (error: any) {
      logger.error(`Report worker failed for user ${userId}`, { error: error.message });
      throw error;
    }
  });

  reportQueue.on('failed', (job, err) => {
    if (job) {
      logger.error(`Report Job ${job.id} persistent failure`, { error: err.message });
    }
  });
};
