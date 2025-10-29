import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { generateHealthSummary } from './summary';
import { NotFoundError } from '../common/errors';

/**
 * Generate AI-powered health summary for a patient
 * Used by clinicians to get quick insights
 */
export const getPatientAISummary = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params;
  
  checkPatientAccess(req.user!.id, patientId, req.user!.role);
  
  // Gather patient data
  const [adherenceEvents, reminders, conversations, notes] = await Promise.all([
    prisma.adherenceEvent.findMany({
      where: { patientId },
      orderBy: { at: 'desc' },
      take: 50,
    }),
    prisma.reminder.findMany({
      where: { patientId, active: true },
    }),
    prisma.conversation.findMany({
      where: { patientId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    }),
    prisma.note.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);
  
  // Calculate adherence rate
  const totalEvents = adherenceEvents.length;
  const takenEvents = adherenceEvents.filter(e => e.status === 'TAKEN').length;
  const adherenceRate = totalEvents > 0 ? Math.round((takenEvents / totalEvents) * 100) : 0;
  
  // Count missed meds in last 48h
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const missedMeds = adherenceEvents.filter(
    e => e.status === 'MISSED' && e.at >= twoDaysAgo
  ).length;
  
  // Get recent mood
  const lastConversation = conversations[0];
  const recentMood = lastConversation?.risk || 'UNKNOWN';
  
  // Count SOS events (mock for now - would come from actual SOS tracking)
  const sosEvents = 0;
  
  // Generate AI summary
  const summary = await generateHealthSummary({
    adherenceRate,
    missedMeds,
    recentMood,
    sosEvents,
    notes: notes.map(n => n.content),
  });
  
  res.json({
    patientId,
    summary,
    metrics: {
      adherenceRate,
      missedMeds,
      recentMood,
      sosEvents,
      totalReminders: reminders.length,
    },
    generatedAt: new Date().toISOString(),
  });
};

