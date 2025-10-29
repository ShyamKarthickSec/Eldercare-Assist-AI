import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { generateReport } from './reports.service';
import { TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';

export const getReports = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  const reports = await prisma.report.findMany({
    where: { patientId: id },
    orderBy: { createdAt: 'desc' },
  });
  
  res.json(reports);
};

export const createReport = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, periodStart, periodEnd } = req.body || {};
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  // Generate report with options
  const reportResult = await generateReport(id, {
    title,
    periodStart: periodStart ? new Date(periodStart) : undefined,
    periodEnd: periodEnd ? new Date(periodEnd) : undefined
  });
  
  // Create report record with all new fields
  const report = await prisma.report.create({
    data: {
      patientId: id,
      title: reportResult.title,
      periodStart: reportResult.periodStart,
      periodEnd: reportResult.periodEnd,
      uri: reportResult.uri,
      checksum: reportResult.checksum,
      generatedBy: 'AI'
    },
  });
  
  // Add to timeline
  await addTimelineEvent(
    id,
    TimelineKind.SUMMARY,
    'AI Health Report Generated',
    `AI-generated comprehensive health report: ${reportResult.title}`,
    report.id
  );
  
  res.status(201).json(report);
};

