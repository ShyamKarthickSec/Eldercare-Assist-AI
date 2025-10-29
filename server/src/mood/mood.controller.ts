import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';

/**
 * Normalize mood input to canonical values
 * Handles variations from frontend, emojis, and free text
 */
function normalizeMood(input: string): 'Happy' | 'Neutral' | 'Sad' | 'Loved' {
  if (!input) return 'Neutral';
  
  const normalized = input.toLowerCase().trim();
  
  // Map all variations to canonical values
  if (
    normalized.includes('happy') ||
    normalized.includes('good') ||
    normalized.includes('great') ||
    normalized.includes('wonderful') ||
    normalized.includes('joy')
  ) {
    return 'Happy';
  }
  
  if (
    normalized.includes('sad') ||
    normalized.includes('down') ||
    normalized.includes('unhappy') ||
    normalized.includes('lonely')
  ) {
    return 'Sad';
  }
  
  if (
    normalized.includes('loved') ||
    normalized.includes('love') ||
    normalized.includes('caring')
  ) {
    return 'Loved';
  }
  
  // Default to Neutral for: neutral, meh, ok, fine, etc.
  return 'Neutral';
}

const recordMoodSchema = z.object({
  mood: z.string(), // Accept any string, normalize server-side
  note: z.string().optional(),
});

const getMoodHistorySchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
});

/**
 * Record patient mood and update timeline
 * This makes mood visible to caregivers instantly
 * Now with server-side mood normalization
 */
export const recordMood = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = recordMoodSchema.parse(req.body);

    checkPatientAccess(req.user!.id, id, req.user!.role);

    // Normalize mood to canonical value (defensive programming)
    const normalizedMood = normalizeMood(data.mood);

    // Create mood-specific message
    const moodMessages: Record<string, string> = {
      Happy: 'Patient reported feeling happy.',
      Neutral: 'Patient reported feeling neutral.',
      Sad: 'Patient reported feeling sad.',
      Loved: 'Patient reported feeling loved.',
    };

    const detail = data.note
      ? `${moodMessages[normalizedMood]} ${data.note}`
      : moodMessages[normalizedMood];

    // Add to timeline (visible to caregiver)
    const timelineEvent = await addTimelineEvent(
      id,
      TimelineKind.CONVERSATION,
      `Mood Update - ${normalizedMood}`,
      detail
    );

    console.log(`[MOOD] Recorded ${normalizedMood} for patient ${id} (original input: "${data.mood}")`);

    res.status(201).json({
      success: true,
      mood: normalizedMood,
      timelineEvent,
      message: 'Mood recorded successfully and visible to your caregiver',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid mood data', details: error.errors });
    } else {
      res.status(500).json({ error: error.message || 'Failed to record mood' });
    }
  }
};

/**
 * Get patient mood history
 */
export const getMoodHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { limit } = getMoodHistorySchema.parse(req.query);

    checkPatientAccess(req.user!.id, id, req.user!.role);

    // Get mood timeline events
    const moodEvents = await prisma.timelineEvent.findMany({
      where: {
        patientId: id,
        kind: TimelineKind.CONVERSATION,
        title: {
          contains: 'Mood Update',
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // Extract mood from title
    const moodHistory = moodEvents.map((event) => {
      const moodMatch = event.title.match(/Mood Update - (\w+)/);
      return {
        mood: moodMatch ? moodMatch[1] : 'Unknown',
        timestamp: event.timestamp,
        detail: event.detail,
        id: event.id,
      };
    });

    res.json(moodHistory);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch mood history' });
  }
};

