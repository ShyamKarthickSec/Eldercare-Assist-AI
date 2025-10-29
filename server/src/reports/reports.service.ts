import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { prisma } from '../prisma';
import { generatePDFReport } from './pdf.generator';

export interface GenerateReportOptions {
  title?: string;
  periodStart?: Date;
  periodEnd?: Date;
}

export const generateReport = async (
  patientId: string, 
  options: GenerateReportOptions = {}
): Promise<{ uri: string; checksum: string; title: string; periodStart: Date; periodEnd: Date }> => {
  // Get patient data
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
  });
  
  if (!profile) {
    throw new Error('Patient profile not found');
  }
  
  // Set default period (last 7 days if not specified)
  const periodEnd = options.periodEnd || new Date();
  const periodStart = options.periodStart || new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
  const title = options.title || `Health Report - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`;
  
  // Generate PDF using the comprehensive generator
  const pdfBuffer = await generatePDFReport({
    patientId,
    patientName: profile.displayName,
    periodStart,
    periodEnd,
    title
  });
  
  // Save PDF
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const patientDir = path.join(reportsDir, patientId);
  if (!fs.existsSync(patientDir)) {
    fs.mkdirSync(patientDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const filename = `report_${timestamp}.pdf`;
  const filepath = path.join(patientDir, filename);
  
  fs.writeFileSync(filepath, pdfBuffer);
  
  // Calculate checksum
  const checksum = crypto.createHash('md5').update(pdfBuffer).digest('hex');
  
  return {
    uri: `/reports/${patientId}/${filename}`,
    checksum,
    title,
    periodStart,
    periodEnd
  };
};
