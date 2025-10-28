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
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  // Generate report
  const reportResult = await generateReport(id);
  
  // Create report record
  const report = await prisma.report.create({
    data: {
      patientId: id,
      uri: reportResult.uri,
      checksum: reportResult.checksum,
    },
  });
  
  // Add to timeline
  await addTimelineEvent(
    id,
    TimelineKind.SUMMARY,
    'Daily Report Generated',
    `Automated daily health report created`,
    report.id
  );
  
  res.status(201).json(report);
};

