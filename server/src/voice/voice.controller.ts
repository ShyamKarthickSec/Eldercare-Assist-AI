import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { detectIntent } from './intent';
import { NotFoundError } from '../common/errors';

const parseVoiceSchema = z.object({
  patientId: z.string(),
  text: z.string().min(1),
});

const confirmVoiceSchema = z.object({
  confirmed: z.boolean(),
});

export const parseVoice = async (req: AuthRequest, res: Response) => {
  const data = parseVoiceSchema.parse(req.body);
  
  checkPatientAccess(req.user!.id, data.patientId, req.user!.role);
  
  // Detect intent
  const intentResult = detectIntent(data.text);
  
  // Create voice command record
  const voiceCommand = await prisma.voiceCommand.create({
    data: {
      patientId: data.patientId,
      rawText: data.text,
      intent: intentResult.intent,
      highRisk: intentResult.highRisk,
      confirmed: false,
    },
  });
  
  res.json({
    voiceCommandId: voiceCommand.id,
    intent: intentResult.intent,
    highRisk: intentResult.highRisk,
    confirmationPrompt: intentResult.confirmationPrompt,
  });
};

export const confirmVoice = async (req: AuthRequest, res: Response) => {
  const { voiceCommandId } = req.params;
  const data = confirmVoiceSchema.parse(req.body);
  
  const voiceCommand = await prisma.voiceCommand.findUnique({
    where: { id: voiceCommandId },
  });
  if (!voiceCommand) {
    throw new NotFoundError('Voice command not found');
  }
  
  checkPatientAccess(req.user!.id, voiceCommand.patientId, req.user!.role);
  
  await prisma.voiceCommand.update({
    where: { id: voiceCommandId },
    data: { confirmed: data.confirmed },
  });
  
  let result: any = { success: false };
  
  if (data.confirmed) {
    // Execute the intent
    switch (voiceCommand.intent) {
      case 'cancel_all_reminders':
        const updated = await prisma.reminder.updateMany({
          where: { patientId: voiceCommand.patientId, active: true },
          data: { active: false },
        });
        result = { success: true, message: `Canceled ${updated.count} reminders` };
        break;
        
      case 'cancel_reminder':
        // Find the next active reminder
        const nextReminder = await prisma.reminder.findFirst({
          where: { patientId: voiceCommand.patientId, active: true },
          orderBy: { dueAt: 'asc' },
        });
        if (nextReminder) {
          await prisma.reminder.update({
            where: { id: nextReminder.id },
            data: { active: false },
          });
          result = { success: true, message: `Canceled reminder: ${nextReminder.title}` };
        } else {
          result = { success: false, message: 'No active reminders found' };
        }
        break;
        
      default:
        result = { success: true, message: 'Command executed' };
    }
  } else {
    result = { success: false, message: 'Command canceled by user' };
  }
  
  res.json(result);
};
