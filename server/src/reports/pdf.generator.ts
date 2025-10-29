import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../prisma';

const htmlPdf = require('html-pdf-node');

export interface ReportData {
  patientId: string;
  patientName: string;
  periodStart: Date;
  periodEnd: Date;
  title: string;
}

export interface ReportMetrics {
  adherenceRate: number;
  missedDoses: number;
  totalDoses: number;
  moodTrend: 'UP' | 'FLAT' | 'DOWN';
  sosCount: number;
  averageMood: string;
}

export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  // Fetch comprehensive patient data
  const metrics = await fetchReportMetrics(data.patientId, data.periodStart, data.periodEnd);
  const medications = await fetchMedications(data.patientId, data.periodStart, data.periodEnd);
  const encounters = await fetchEncounters(data.patientId, data.periodStart, data.periodEnd);
  const notes = await fetchNotesWithSummaries(data.patientId, data.periodStart, data.periodEnd);
  const timeline = await fetchTimelineHighlights(data.patientId, data.periodStart, data.periodEnd);
  const aiSummary = await generateAINarrative(data.patientId, metrics);
  
  // Generate HTML
  const html = generateReportHTML(data, metrics, medications, encounters, notes, timeline, aiSummary);
  
  // Convert to PDF
  const file = { content: html };
  const options = { 
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
  };
  
  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
}

async function fetchReportMetrics(patientId: string, start: Date, end: Date): Promise<ReportMetrics> {
  // Fetch adherence events in period
  const adherenceEvents = await prisma.adherenceEvent.findMany({
    where: {
      patientId,
      at: { gte: start, lte: end }
    }
  });
  
  const totalDoses = adherenceEvents.length;
  const takenDoses = adherenceEvents.filter(e => e.status === 'TAKEN').length;
  const missedDoses = adherenceEvents.filter(e => e.status === 'MISSED').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  
  // Fetch mood events
  const moodEvents = await prisma.timelineEvent.findMany({
    where: {
      patientId,
      kind: 'CONVERSATION',
      at: { gte: start, lte: end },
      title: { contains: 'Mood' }
    },
    orderBy: { at: 'asc' }
  });
  
  let moodTrend: 'UP' | 'FLAT' | 'DOWN' = 'FLAT';
  let averageMood = 'Neutral';
  
  if (moodEvents.length >= 2) {
    const firstMood = moodEvents[0].detail;
    const lastMood = moodEvents[moodEvents.length - 1].detail;
    if (lastMood.includes('Happy') && !firstMood.includes('Happy')) moodTrend = 'UP';
    else if (lastMood.includes('Sad') && !firstMood.includes('Sad')) moodTrend = 'DOWN';
    
    // Calculate average mood
    const happyCount = moodEvents.filter(e => e.detail.includes('Happy')).length;
    const sadCount = moodEvents.filter(e => e.detail.includes('Sad')).length;
    if (happyCount > sadCount) averageMood = 'Positive';
    else if (sadCount > happyCount) averageMood = 'Needs Support';
  }
  
  // Fetch SOS alerts
  const sosEvents = await prisma.timelineEvent.findMany({
    where: {
      patientId,
      kind: 'SUMMARY',
      title: { contains: 'SOS' },
      at: { gte: start, lte: end }
    }
  });
  
  return {
    adherenceRate,
    missedDoses,
    totalDoses,
    moodTrend,
    sosCount: sosEvents.length,
    averageMood
  };
}

async function fetchMedications(patientId: string, start: Date, end: Date) {
  const reminders = await prisma.reminder.findMany({
    where: { patientId, type: 'MEDICATION', active: true },
    include: {
      adherenceEvents: {
        where: { at: { gte: start, lte: end } }
      }
    }
  });
  
  return reminders.map(r => {
    const taken = r.adherenceEvents.filter(e => e.status === 'TAKEN').length;
    const missed = r.adherenceEvents.filter(e => e.status === 'MISSED').length;
    return {
      name: r.title,
      schedule: r.recurrence || 'As needed',
      taken,
      missed
    };
  });
}

async function fetchEncounters(patientId: string, start: Date, end: Date) {
  const encounters = await prisma.timelineEvent.findMany({
    where: {
      patientId,
      kind: 'CLINIC',
      at: { gte: start, lte: end }
    },
    orderBy: { at: 'desc' }
  });
  
  return encounters.map(e => ({
    date: e.at,
    type: e.title,
    detail: e.detail
  }));
}

async function fetchNotesWithSummaries(patientId: string, start: Date, end: Date) {
  const notes = await prisma.note.findMany({
    where: {
      patientId,
      createdAt: { gte: start, lte: end }
    },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  return notes.map(n => ({
    date: n.createdAt,
    author: n.author.role === 'CAREGIVER' ? 'Caregiver' : 'System',
    summary: n.aiSummary || 'No AI summary available',
    content: n.content.substring(0, 150) + (n.content.length > 150 ? '...' : '')
  }));
}

async function fetchTimelineHighlights(patientId: string, start: Date, end: Date) {
  const events = await prisma.timelineEvent.findMany({
    where: {
      patientId,
      at: { gte: start, lte: end }
    },
    orderBy: { at: 'desc' },
    take: 15
  });
  
  return events.map(e => ({
    date: e.at,
    type: e.kind,
    title: e.title,
    detail: e.detail.substring(0, 100) + (e.detail.length > 100 ? '...' : '')
  }));
}

async function generateAINarrative(patientId: string, metrics: ReportMetrics): Promise<string> {
  try {
    const { generateAISummary } = require('../ai/summary');
    const summaryData = `
      Patient health metrics:
      - Medication adherence: ${metrics.adherenceRate}%
      - Missed doses: ${metrics.missedDoses}
      - Mood trend: ${metrics.moodTrend}
      - Average mood: ${metrics.averageMood}
      - Emergency alerts: ${metrics.sosCount}
    `;
    const aiNarrative = await generateAISummary(summaryData);
    return aiNarrative || generateFallbackNarrative(metrics);
  } catch (error) {
    return generateFallbackNarrative(metrics);
  }
}

function generateFallbackNarrative(metrics: ReportMetrics): string {
  let narrative = `During this reporting period, the patient demonstrated `;
  
  if (metrics.adherenceRate >= 90) {
    narrative += `excellent medication adherence at ${metrics.adherenceRate}%. `;
  } else if (metrics.adherenceRate >= 70) {
    narrative += `good medication adherence at ${metrics.adherenceRate}%, with room for improvement. `;
  } else {
    narrative += `concerning medication adherence at ${metrics.adherenceRate}%, requiring caregiver intervention. `;
  }
  
  if (metrics.moodTrend === 'UP') {
    narrative += `Mood trends show positive improvement, indicating better emotional wellbeing. `;
  } else if (metrics.moodTrend === 'DOWN') {
    narrative += `Mood trends show decline, suggesting the need for additional support. `;
  } else {
    narrative += `Mood remains stable with average outlook reported as ${metrics.averageMood}. `;
  }
  
  if (metrics.sosCount > 0) {
    narrative += `⚠️ ${metrics.sosCount} emergency alert(s) were triggered during this period, requiring immediate attention.`;
  } else {
    narrative += `No emergency alerts were triggered, indicating stable health status.`;
  }
  
  return narrative;
}

function generateReportHTML(
  data: ReportData,
  metrics: ReportMetrics,
  medications: any[],
  encounters: any[],
  notes: any[],
  timeline: any[],
  aiSummary: string
): string {
  const periodStr = `${data.periodStart.toLocaleDateString()} - ${data.periodEnd.toLocaleDateString()}`;
  const reportDate = new Date().toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 11pt; 
      line-height: 1.6; 
      color: #2d3748;
      background: #ffffff;
    }
    .container { max-width: 100%; }
    
    /* Header */
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      color: white; 
      padding: 30px; 
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .header h1 { font-size: 28pt; margin-bottom: 10px; }
    .ai-badge { 
      display: inline-block; 
      background: rgba(255,255,255,0.2); 
      padding: 6px 16px; 
      border-radius: 20px; 
      font-size: 10pt; 
      font-weight: 600;
      border: 2px solid rgba(255,255,255,0.4);
    }
    .patient-info { margin-top: 15px; font-size: 11pt; }
    .patient-info strong { font-weight: 600; }
    
    /* KPIs */
    .kpi-section { 
      display: flex; 
      justify-content: space-between; 
      margin: 20px 0; 
      gap: 15px;
    }
    .kpi-card { 
      flex: 1; 
      background: #f7fafc; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 4px solid #10b981;
      text-align: center;
    }
    .kpi-card.warning { border-left-color: #f59e0b; }
    .kpi-card.danger { border-left-color: #ef4444; }
    .kpi-value { 
      font-size: 32pt; 
      font-weight: 700; 
      color: #10b981; 
      margin: 10px 0;
    }
    .kpi-value.warning { color: #f59e0b; }
    .kpi-value.danger { color: #ef4444; }
    .kpi-label { 
      font-size: 10pt; 
      color: #64748b; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Sections */
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .section-title { 
      font-size: 16pt; 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 15px; 
      padding-bottom: 8px; 
      border-bottom: 3px solid #10b981;
    }
    
    /* Tables */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0; 
      background: white;
    }
    th { 
      background: #10b981; 
      color: white; 
      padding: 12px; 
      text-align: left; 
      font-weight: 600;
      font-size: 10pt;
    }
    td { 
      border: 1px solid #e2e8f0; 
      padding: 10px; 
      font-size: 10pt;
    }
    tr:nth-child(even) { background: #f8fafc; }
    
    /* AI Summary Box */
    .ai-summary-box { 
      background: #eff6ff; 
      border-left: 4px solid #3b82f6; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0;
    }
    .ai-summary-box h3 { 
      color: #1e40af; 
      font-size: 12pt; 
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ai-summary-box p { 
      color: #1e293b; 
      line-height: 1.8;
    }
    
    /* Footer */
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 2px solid #e2e8f0; 
      text-align: center; 
      color: #64748b; 
      font-size: 9pt;
    }
    
    /* Mood Trend */
    .trend-up { color: #10b981; font-weight: 700; }
    .trend-down { color: #ef4444; font-weight: 700; }
    .trend-flat { color: #6b7280; font-weight: 700; }
    
    /* Badges */
    .badge { 
      display: inline-block; 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-size: 9pt; 
      font-weight: 600;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fed7aa; color: #92400e; }
    .badge-danger { background: #fecaca; color: #991b1b; }
    
    @media print {
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🏥 ${data.title}</h1>
      <span class="ai-badge">🤖 AI-Generated Report</span>
      <div class="patient-info">
        <strong>Patient:</strong> ${data.patientName} &nbsp;&nbsp;
        <strong>Period:</strong> ${periodStr} &nbsp;&nbsp;
        <strong>Generated:</strong> ${reportDate}
      </div>
    </div>
    
    <!-- KPI Section -->
    <div class="kpi-section">
      <div class="kpi-card ${metrics.adherenceRate < 70 ? 'danger' : metrics.adherenceRate < 90 ? 'warning' : ''}">
        <div class="kpi-label">Adherence Rate</div>
        <div class="kpi-value ${metrics.adherenceRate < 70 ? 'danger' : metrics.adherenceRate < 90 ? 'warning' : ''}">${metrics.adherenceRate}%</div>
      </div>
      <div class="kpi-card ${metrics.missedDoses > 5 ? 'warning' : ''}">
        <div class="kpi-label">Missed Doses</div>
        <div class="kpi-value ${metrics.missedDoses > 5 ? 'warning' : ''}">${metrics.missedDoses}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Mood Trend</div>
        <div class="kpi-value trend-${metrics.moodTrend.toLowerCase()}">${metrics.moodTrend === 'UP' ? '📈' : metrics.moodTrend === 'DOWN' ? '📉' : '➡️'} ${metrics.moodTrend}</div>
      </div>
      <div class="kpi-card ${metrics.sosCount > 0 ? 'danger' : ''}">
        <div class="kpi-label">SOS Alerts</div>
        <div class="kpi-value ${metrics.sosCount > 0 ? 'danger' : ''}">${metrics.sosCount}</div>
      </div>
    </div>
    
    <!-- AI Summary -->
    <div class="ai-summary-box">
      <h3>🤖 AI-Generated Health Summary</h3>
      <p>${aiSummary}</p>
    </div>
    
    <!-- Medications & Adherence -->
    <div class="section">
      <h2 class="section-title">💊 Medications & Adherence</h2>
      ${medications.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Medication</th>
              <th>Schedule</th>
              <th>Taken</th>
              <th>Missed</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${medications.map(m => {
              const rate = m.taken + m.missed > 0 ? Math.round((m.taken / (m.taken + m.missed)) * 100) : 0;
              return `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.schedule}</td>
                  <td><span class="badge badge-success">${m.taken}</span></td>
                  <td><span class="badge ${m.missed > 0 ? 'badge-warning' : 'badge-success'}">${m.missed}</span></td>
                  <td><strong>${rate}%</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b;">No medication data available for this period.</p>'}
    </div>
    
    <!-- Appointments/Encounters -->
    <div class="section">
      <h2 class="section-title">📅 Appointments & Encounters</h2>
      ${encounters.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${encounters.map(e => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td><strong>${e.type}</strong></td>
                <td>${e.detail}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b;">No appointments or encounters recorded for this period.</p>'}
    </div>
    
    <!-- Notes with AI Summaries -->
    <div class="section">
      <h2 class="section-title">📝 Caregiver Notes & AI Summaries</h2>
      ${notes.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Author</th>
              <th>AI Summary</th>
            </tr>
          </thead>
          <tbody>
            ${notes.map(n => `
              <tr>
                <td>${new Date(n.date).toLocaleDateString()}</td>
                <td>${n.author}</td>
                <td>${n.summary}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b;">No caregiver notes recorded for this period.</p>'}
    </div>
    
    <!-- Timeline Highlights -->
    <div class="section">
      <h2 class="section-title">📊 Timeline Highlights</h2>
      ${timeline.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            ${timeline.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td><span class="badge badge-success">${t.type}</span></td>
                <td><strong>${t.title}</strong> - ${t.detail}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #64748b;">No timeline events recorded for this period.</p>'}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Generated automatically by ElderCare Assist AI</strong></p>
      <p>This report is AI-generated and should be reviewed by qualified healthcare professionals.</p>
      <p>© ${new Date().getFullYear()} ElderCare Assist. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

