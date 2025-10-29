import { openaiClient, isAIAvailable, containsMedicalAdvice } from './openai';

/**
 * Generate empathetic companion chat response
 * Enhanced version with optional AI
 */
export const generateChatResponse = async (
  userMessage: string,
  context?: { mood?: string; recentTopics?: string[] }
): Promise<string> => {
  // Check for medical queries first
  const medicalKeywords = [
    'diagnose', 'diagnosis', 'prescribe', 'medication', 'medicine',
    'drug', 'symptom', 'disease', 'illness', 'cure', 'therapy'
  ];
  
  const lowerMessage = userMessage.toLowerCase();
  if (medicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "I'm here to listen and provide companionship, but I'm not qualified to give medical advice. " +
           "For health concerns, please contact your doctor or healthcare provider. " +
           "Is there anything else you'd like to talk about?";
  }

  // If AI available, use it for more natural responses
  if (isAIAvailable()) {
    try {
      const systemPrompt = `You are a compassionate AI companion for elderly care. Your role is to:
- Listen empathetically
- Provide emotional support
- Never give medical advice or diagnosis
- Keep responses brief (2-3 sentences)
- Be warm and friendly

If asked about medical issues, redirect to healthcare providers.`;

      const response = await openaiClient!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const reply = response.choices[0]?.message?.content?.trim() || '';
      
      // Safety check
      if (containsMedicalAdvice(reply)) {
        return getRuleBasedResponse(userMessage);
      }
      
      return reply;
    } catch (error) {
      console.error('[AI] Error generating chat response:', error);
      return getRuleBasedResponse(userMessage);
    }
  }

  // Fallback to rule-based responses
  return getRuleBasedResponse(userMessage);
};

/**
 * Rule-based empathetic responses
 */
const getRuleBasedResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('lonely')) {
    return "I'm really sorry to hear you're feeling this way. Please know that I'm here to listen. " +
           "Would you like to talk about what's on your mind?";
  }
  
  if (lowerMessage.includes('worried') || lowerMessage.includes('anxious')) {
    return "It sounds like you're going through a challenging time. Remember, it's okay to feel worried. " +
           "Taking deep breaths can help. Is there anything specific bothering you?";
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
    return "That's wonderful to hear! I'm so glad you're feeling good. What made your day special?";
  }
  
  return "I hear you. Thank you for sharing that with me. I'm here if you'd like to talk more about it.";
};

/**
 * Get AI chat response with risk assessment for companion chat
 * Used by companion.controller.ts
 */
export const getAiChatResponse = async (
  patientId: string,
  message: string,
  mood: string = 'Neutral'
): Promise<{ reply: string; risk: 'LOW' | 'MEDIUM' | 'HIGH' }> => {
  // Generate the chat response
  const reply = await generateChatResponse(message, { mood });
  
  // Assess risk based on message content
  let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const lowerMessage = message.toLowerCase();
  const lowerReply = reply.toLowerCase();
  
  // High risk indicators
  if (
    lowerMessage.includes('hurt myself') ||
    lowerMessage.includes('suicide') ||
    lowerMessage.includes('want to die') ||
    lowerMessage.includes('end it all') ||
    lowerMessage.includes('severe pain') ||
    lowerMessage.includes('emergency')
  ) {
    risk = 'HIGH';
  }
  // Medium risk indicators
  else if (
    lowerMessage.includes('lonely') ||
    lowerMessage.includes('sad') ||
    lowerMessage.includes('depressed') ||
    lowerMessage.includes('anxious') ||
    lowerMessage.includes('pain') ||
    lowerMessage.includes('worried') ||
    mood.toLowerCase().includes('sad')
  ) {
    risk = 'MEDIUM';
  }
  
  return { reply, risk };
};

