import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { UserRole } from '../common/types';
import { checkRole } from '../common/policy';

/**
 * Get list of all patients (for doctor/caregiver dropdown)
 */
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  // Only clinicians and caregivers can list patients
  checkRole(req.user!.role, [UserRole.CLINICIAN, UserRole.CAREGIVER]);
  
  const patients = await prisma.patientProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      displayName: 'asc',
    },
  });
  
  const formattedPatients = patients.map(p => ({
    id: p.userId,
    name: p.displayName,
    dateOfBirth: p.dateOfBirth,
    email: p.user.email,
    caregiverId: p.caregiverId,
    createdAt: p.user.createdAt,
  }));
  
  res.json(formattedPatients);
};

/**
 * Get patient location (mock for now)
 */
export const getPatientLocation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  checkRole(req.user!.role, [UserRole.CAREGIVER, UserRole.CLINICIAN]);
  
  // Mock location data (in real app, this would come from mobile app)
  const location = {
    patientId: id,
    latitude: -33.8688,  // Sydney coordinates
    longitude: 151.2093,
    timestamp: new Date().toISOString(),
    accuracy: 10,
    inSafeZone: true,
    safeZone: {
      center: { latitude: -33.8688, longitude: 151.2093 },
      radius: 500, // meters
    },
  };
  
  res.json(location);
};

/**
 * Get patient alerts
 * Includes: SOS alerts, missed medications, high-risk conversations
 */
export const getPatientAlerts = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type } = req.query;
  
  checkRole(req.user!.role, [UserRole.CAREGIVER, UserRole.CLINICIAN]);
  
  // Get SOS and alert-type timeline events (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sosAlerts = await prisma.timelineEvent.findMany({
    where: {
      patientId: id,
      at: { gte: sevenDaysAgo },
      OR: [
        { title: { contains: '🚨' } }, // SOS alerts
        { title: { contains: 'SOS' } },
        { title: { contains: 'Emergency' } },
        { title: { contains: 'Alert' } },
      ],
    },
    orderBy: { at: 'desc' },
  });
  
  // Get missed medications
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const missedMeds = await prisma.adherenceEvent.findMany({
    where: {
      patientId: id,
      status: 'MISSED',
      at: { gte: twoDaysAgo },
    },
    include: {
      reminder: true,
    },
    orderBy: { at: 'desc' },
  });
  
  // Get high-risk conversations
  const riskConversations = await prisma.conversation.findMany({
    where: {
      patientId: id,
      risk: { in: ['MEDIUM', 'HIGH'] },
    },
    orderBy: { startedAt: 'desc' },
    take: 5,
  });
  
  // Format alerts
  const alerts = [
    // SOS and emergency alerts from timeline
    ...sosAlerts.map(s => ({
      id: `sos-${s.id}`,
      type: s.title.includes('SOS') || s.title.includes('Emergency') ? 'SOS' : 'ALERT',
      severity: 'HIGH',
      title: s.title.replace('🚨 ', ''),
      description: s.detail,
      timestamp: s.at.toISOString(),
      status: 'ACTIVE',
    })),
    // Missed medications
    ...missedMeds.map(m => ({
      id: `med-${m.id}`,
      type: 'MISSED_MEDICATION',
      severity: m.reminder ? 'MEDIUM' : 'LOW',
      title: `Missed: ${m.reminder?.title || 'Medication'}`,
      description: `Medication was not taken at scheduled time`,
      timestamp: m.at.toISOString(),
      status: 'UNRESOLVED',
    })),
    // High-risk conversations
    ...riskConversations.map(c => ({
      id: `conv-${c.id}`,
      type: 'MOOD_ALERT',
      severity: c.risk,
      title: `${c.risk} Risk Conversation`,
      description: c.summary || 'Concerning conversation detected',
      timestamp: c.startedAt.toISOString(),
      status: c.endedAt ? 'RESOLVED' : 'ACTIVE',
    })),
  ];
  
  // Filter by type if specified
  const filtered = type 
    ? alerts.filter(a => a.type === type)
    : alerts;
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  console.log(`[ALERTS] Fetched ${filtered.length} alerts for patient ${id} (${sosAlerts.length} SOS, ${missedMeds.length} missed meds, ${riskConversations.length} mood alerts)`);
  
  res.json(filtered);
};

