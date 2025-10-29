import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { RiskLevel } from '../common/types';

const startSessionSchema = z.object({
  patientId: z.string(),
});

const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1),
  mood: z.string().optional(),
});

const endSessionSchema = z.object({
  sessionId: z.string(),
});

/**
 * Start a new companion chat session
 */
export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = startSessionSchema.parse(req.body);
    checkPatientAccess(req.user!.id, patientId, req.user!.role);

    const conversation = await prisma.conversation.create({
      data: {
        patientId,
        startedAt: new Date(),
        risk: RiskLevel.LOW,
      },
    });

    res.status(201).json({ sessionId: conversation.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start session' });
  }
};

/**
 * Send a message in companion chat and get AI response
 * Integrates with OpenAI for intelligent, empathetic responses
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, mood } = sendMessageSchema.parse(req.body);
    const patientId = req.user!.id;

    checkPatientAccess(req.user!.id, patientId, req.user!.role);

    // Find or create active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        patientId,
        endedAt: null,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          patientId,
          startedAt: new Date(),
          risk: RiskLevel.LOW,
        },
      });
    }

    // Get AI response (with fallback to rule-based if OpenAI unavailable)
    let reply = '';
    let risk = RiskLevel.LOW;

    try {
      // Try OpenAI integration
      const { getAiChatResponse } = require('../ai/chat');
      const aiResponse = await getAiChatResponse(patientId, message, mood || 'Neutral');
      reply = aiResponse.reply;
      risk = aiResponse.risk;
    } catch (aiError) {
      console.log('[COMPANION] OpenAI unavailable, using fallback responses');
      
      // Fallback to empathetic rule-based responses
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
        reply = "I understand feeling lonely can be hard. Remember, you're not alone - I'm here to chat, and your caregiver is always available if you need support.";
        risk = RiskLevel.MEDIUM;
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
        reply = "I'm sorry you're feeling this way. It's okay to have difficult moments. Would you like to talk about what's on your mind, or perhaps try a calming activity?";
        risk = RiskLevel.MEDIUM;
      } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        reply = "I'm concerned about your discomfort. If you're experiencing pain, please let your caregiver know or use the SOS button for immediate assistance.";
        risk = RiskLevel.HIGH;
      } else if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('good')) {
        reply = "That's wonderful to hear! I'm so glad you're feeling positive today. Keep up that great energy! 😊";
        risk = RiskLevel.LOW;
      } else if (lowerMessage.includes('tired') || lowerMessage.includes('sleepy')) {
        reply = "Rest is important for your wellbeing. Perhaps it's a good time for a short nap or some quiet relaxation?";
        risk = RiskLevel.LOW;
      } else {
        reply = "Thank you for sharing that with me. I'm here to listen and support you. How else can I help you today?";
        risk = RiskLevel.LOW;
      }
    }

    // Update conversation risk level
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { risk },
    });

    res.json({ 
      reply, 
      risk,
      sessionId: conversation.id 
    });
  } catch (error: any) {
    console.error('[COMPANION] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send message',
      reply: "I'm having trouble responding right now. Please try again in a moment."
    });
  }
};

/**
 * End a companion chat session
 */
export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = endSessionSchema.parse(req.body);
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: sessionId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    checkPatientAccess(req.user!.id, conversation.patientId, req.user!.role);

    await prisma.conversation.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to end session' });
  }
};
