import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { RiskLevel, TimelineKind } from '../common/types';
import { analyzeMood } from './mood';
import { checkMedicalQuery, getSafetyResponse } from './safety';
import { addTimelineEvent } from '../timeline/timeline.service';
import { NotFoundError } from '../common/errors';

const startSessionSchema = z.object({
  patientId: z.string(),
});

const messageSchema = z.object({
  text: z.string().min(1),
});

// Generate empathetic responses (rule-based for MVP)
const generateResponse = (text: string, risk: RiskLevel): string => {
  // Check for medical queries first
  if (checkMedicalQuery(text)) {
    return getSafetyResponse();
  }
  
  const lowerText = text.toLowerCase();
  
  // Empathetic responses based on keywords
  if (lowerText.includes('sad') || lowerText.includes('lonely')) {
    return "I'm really sorry to hear you're feeling this way. Please know that I'm here to listen. " +
           "Would you like to talk about what's on your mind?";
  }
  
  if (lowerText.includes('worried') || lowerText.includes('anxious')) {
    return "It sounds like you're going through a challenging time. Remember, it's okay to feel worried. " +
           "Taking deep breaths can help. Is there anything specific bothering you?";
  }
  
  if (lowerText.includes('happy') || lowerText.includes('good')) {
    return "That's wonderful to hear! I'm so glad you're feeling good. What made your day special?";
  }
  
  // Default empathetic response
  return `I hear you. Thank you for sharing that with me. I'm here if you'd like to talk more about it.`;
};

export const startSession = async (req: AuthRequest, res: Response) => {
  const data = startSessionSchema.parse(req.body);
  
  checkPatientAccess(req.user!.id, data.patientId, req.user!.role);
  
  const conversation = await prisma.conversation.create({
    data: {
      patientId: data.patientId,
      risk: 'LOW',
    },
  });
  
  res.json({ sessionId: conversation.id });
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const data = messageSchema.parse(req.body);
  
  const conversation = await prisma.conversation.findUnique({
    where: { id: sessionId },
  });
  if (!conversation) {
    throw new NotFoundError('Session not found');
  }
  
  if (conversation.endedAt) {
    throw new NotFoundError('Session has ended');
  }
  
  checkPatientAccess(req.user!.id, conversation.patientId, req.user!.role);
  
  // Analyze mood and determine risk
  const risk = analyzeMood(data.text);
  
  // Update conversation risk if higher
  if (risk === RiskLevel.HIGH || (risk === RiskLevel.MEDIUM && conversation.risk === 'LOW')) {
    await prisma.conversation.update({
      where: { id: sessionId },
      data: { risk },
    });
  }
  
  // Generate response
  const reply = generateResponse(data.text, risk);
  
  res.json({ reply, risk });
};

export const stopSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  
  const conversation = await prisma.conversation.findUnique({
    where: { id: sessionId },
  });
  if (!conversation) {
    throw new NotFoundError('Session not found');
  }
  
  checkPatientAccess(req.user!.id, conversation.patientId, req.user!.role);
  
  // End the conversation
  const summary = `Companionship session ended. Risk level: ${conversation.risk}`;
  const updated = await prisma.conversation.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      summary,
    },
  });
  
  // Add to timeline if medium or high risk
  if (updated.risk !== 'LOW') {
    await addTimelineEvent(
      conversation.patientId,
      TimelineKind.CONVERSATION,
      `Companionship Session - ${updated.risk} Risk`,
      summary,
      conversation.id
    );
  }
  
  res.json({ summary, risk: updated.risk });
};
