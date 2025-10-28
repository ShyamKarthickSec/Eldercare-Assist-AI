import cron from 'node-cron';
import { prisma } from '../prisma';
import { generateReport } from './reports.service';
import { addTimelineEvent } from '../timeline/timeline.service';
import { TimelineKind } from '../common/types';

// Daily report generation at 06:00
export const startReportCron = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('[CRON] Generating daily reports...');
    
    // Get all patients
    const patients = await prisma.patientProfile.findMany();
    
    for (const patient of patients) {
      try {
        const reportResult = await generateReport(patient.userId);
        
        const report = await prisma.report.create({
          data: {
            patientId: patient.userId,
            uri: reportResult.uri,
            checksum: reportResult.checksum,
          },
        });
        
        await addTimelineEvent(
          patient.userId,
          TimelineKind.SUMMARY,
          'Daily Report Generated',
          'Automated daily health report created',
          report.id
        );
        
        console.log(`[CRON] Report generated for patient ${patient.displayName}`);
      } catch (error) {
        console.error(`[CRON] Failed to generate report for patient ${patient.displayName}:`, error);
      }
    }
  });
  
  console.log('[CRON] Daily report job scheduled at 06:00');
};

