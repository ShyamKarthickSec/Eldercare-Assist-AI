import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { ReminderType, AdherenceStatus, TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';
import { NotFoundError } from '../common/errors';

const createReminderSchema = z.object({
  type: z.enum(['MEDICATION', 'APPOINTMENT']),
  title: z.string(),
  notes: z.string().optional(),
  dueAt: z.string(),
  recurrence: z.string().optional(),
});

const ackReminderSchema = z.object({
  status: z.enum(['TAKEN', 'SNOOZED', 'SKIPPED']),
});

export const getReminders = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  const reminders = await prisma.reminder.findMany({
    where: { patientId: id, active: true },
    orderBy: { dueAt: 'asc' },
  });
  
  res.json(reminders);
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = createReminderSchema.parse(req.body);
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  const reminder = await prisma.reminder.create({
    data: {
      patientId: id,
      type: data.type,
      title: data.title,
      notes: data.notes,
      dueAt: new Date(data.dueAt),
      recurrence: data.recurrence,
      createdById: req.user!.id,
      active: true,
    },
  });
  
  res.status(201).json(reminder);
};

export const acknowledgeReminder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = ackReminderSchema.parse(req.body);
  
  const reminder = await prisma.reminder.findUnique({
    where: { id },
  });
  if (!reminder) {
    throw new NotFoundError('Reminder not found');
  }
  
  checkPatientAccess(req.user!.id, reminder.patientId, req.user!.role);
  
  // Create adherence event
  const adherenceEvent = await prisma.adherenceEvent.create({
    data: {
      reminderId: reminder.id,
      patientId: reminder.patientId,
      status: data.status,
    },
  });
  
  // Add to timeline
  const statusText = data.status === 'TAKEN' ? 'Taken' : 
                     data.status === 'SNOOZED' ? 'Snoozed' : 'Skipped';
  await addTimelineEvent(
    reminder.patientId,
    TimelineKind.ADHERENCE,
    `${reminder.title} - ${statusText}`,
    `Medication reminder acknowledged as ${statusText}`,
    reminder.id
  );
  
  res.json({ success: true, adherenceEvent });
};

