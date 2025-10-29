import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';
import { generateNoteSummary } from '../ai/notesummary';

const createNoteSchema = z.object({
  content: z.string().min(1),
});

export const getNotes = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  const notes = await prisma.note.findMany({
    where: { patientId: id },
    orderBy: { createdAt: 'desc' },
  });
  
  res.json(notes);
};

export const createNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = createNoteSchema.parse(req.body);
  
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  // Generate AI summary (uses OpenAI if available, falls back to rule-based)
  const aiSummary = await generateNoteSummary(data.content);
  
  const note = await prisma.note.create({
    data: {
      patientId: id,
      authorId: req.user!.id,
      content: data.content,
      aiSummary,
    },
  });
  
  // Add to timeline
  await addTimelineEvent(
    id,
    TimelineKind.NOTE,
    'New Shared Note',
    `Note added by ${req.user!.email}: ${aiSummary}`,
    note.id
  );
  
  res.status(201).json(note);
};

