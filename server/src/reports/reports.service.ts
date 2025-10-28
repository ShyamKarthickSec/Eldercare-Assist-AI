import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { prisma } from '../prisma';

export const generateReport = async (patientId: string): Promise<{ uri: string; checksum: string }> => {
  // Get patient data
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
  });
  
  const reminders = await prisma.reminder.findMany({
    where: { patientId, active: true },
  });
  
  const adherenceEvents = await prisma.adherenceEvent.findMany({
    where: { patientId },
  });
  
  const notes = await prisma.note.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  // Calculate adherence stats
  const totalEvents = adherenceEvents.length;
  const takenEvents = adherenceEvents.filter(ae => ae.status === 'TAKEN').length;
  const adherenceRate = totalEvents > 0 ? ((takenEvents / totalEvents) * 100).toFixed(1) : '0.0';
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Daily Health Report - ${profile?.displayName || 'Patient'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #0d6efd; }
    .section { margin: 20px 0; }
    .stat { display: inline-block; margin: 10px 20px 10px 0; }
    .stat-label { font-weight: bold; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #0d6efd; color: white; }
  </style>
</head>
<body>
  <h1>Daily Health Report</h1>
  <p><strong>Patient:</strong> ${profile?.displayName || 'Unknown'}</p>
  <p><strong>Report Date:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="section">
    <h2>Medication Adherence</h2>
    <div class="stat">
      <span class="stat-label">Adherence Rate:</span> ${adherenceRate}%
    </div>
    <div class="stat">
      <span class="stat-label">Total Events:</span> ${totalEvents}
    </div>
    <div class="stat">
      <span class="stat-label">Taken:</span> ${takenEvents}
    </div>
  </div>
  
  <div class="section">
    <h2>Active Reminders</h2>
    <table>
      <tr><th>Type</th><th>Title</th><th>Due At</th></tr>
      ${reminders.slice(0, 10).map(r => `
        <tr>
          <td>${r.type}</td>
          <td>${r.title}</td>
          <td>${new Date(r.dueAt).toLocaleString()}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <div class="section">
    <h2>Recent Notes</h2>
    <table>
      <tr><th>Date</th><th>Summary</th></tr>
      ${notes.map(n => `
        <tr>
          <td>${new Date(n.createdAt).toLocaleString()}</td>
          <td>${n.aiSummary || 'No summary'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>
  `;
  
  // Save report
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `report_${patientId}_${Date.now()}.html`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, html, 'utf-8');
  
  // Calculate checksum
  const checksum = crypto.createHash('md5').update(html).digest('hex');
  
  return {
    uri: `/reports/${filename}`,
    checksum,
  };
};
