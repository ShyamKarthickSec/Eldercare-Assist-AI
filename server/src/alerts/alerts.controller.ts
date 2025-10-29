import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';

const createAlertSchema = z.object({
  type: z.enum(['SOS', 'MISSED_MEDICATION', 'MOOD_ALERT', 'GEOFENCE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  description: z.string(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'UNRESOLVED']).default('ACTIVE'),
});

/**
 * Create an alert (SOS, missed medication, geofence, etc.)
 * Creates a timeline event that appears in Caregiver dashboard
 */
export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = createAlertSchema.parse(req.body);
    
    checkPatientAccess(req.user!.id, id, req.user!.role);

    // Create a timeline event for the alert
    const alert = await addTimelineEvent(
      id,
      TimelineKind.NOTE,
      `🚨 ${data.title}`,
      `[${data.severity}] ${data.description}`
    );

    console.log(`[ALERT] ${data.type} alert created for patient ${id}`);

    res.status(201).json({
      success: true,
      alert: {
        id: alert.id,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        status: data.status,
        timestamp: alert.at
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid alert data', details: error.errors });
    } else {
      res.status(500).json({ error: error.message || 'Failed to create alert' });
    }
  }
};

