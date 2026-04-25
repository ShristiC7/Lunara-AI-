import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { reportQueue } from '../queues/report.queue';
import { StorageService } from '../utils/s3';
import { asyncHandler, AppError } from '../utils/errors';

export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const { dateRange = '3mo' } = req.body;
  
  const job = await reportQueue.add('generate-pdf', { 
    userId: req.userId as string,
    dateRange 
  });

  res.status(202).json({
    success: true,
    data: { jobId: job.id, message: 'Report generation started' }
  });
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await prisma.report.findMany({
    where: { userId: req.userId as string },
    orderBy: { generatedAt: 'desc' }
  });

  // Attach fresh pre-signed URLs to each report
  const reportsWithUrls = await Promise.all(reports.map(async (r) => ({
    ...r,
    downloadUrl: await StorageService.getDownloadUrl(r.fileUrl)
  })));

  res.status(200).json({
    success: true,
    data: reportsWithUrls
  });
});

export const getReportDownload = asyncHandler(async (req: Request, res: Response) => {
  const reportId = req.params.id as string;
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId: req.userId as string }
  });

  if (!report) {
    throw new AppError('Report not found', 404, 'NOT_FOUND');
  }

  const downloadUrl = await StorageService.getDownloadUrl(report.fileUrl);
  res.status(200).json({ success: true, data: { downloadUrl } });
});
