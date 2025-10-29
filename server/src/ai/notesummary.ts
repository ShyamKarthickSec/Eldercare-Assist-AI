import { openaiClient, isAIAvailable, containsMedicalAdvice } from './openai';

/**
 * Generate AI summary for a note (1-2 lines)
 * Used when caregiver/clinician adds a note
 */
export const generateNoteSummary = async (content: string): Promise<string> => {
  // Fallback to simple truncation if AI not available
  if (!isAIAvailable()) {
    return generateSimpleSummary(content);
  }

  try {
    const prompt = `Summarize the following patient note in ONE concise, empathetic sentence (max 15 words). No diagnosis, no medical claims:\n\n${content}`;

    const response = await openaiClient!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim() || '';
    
    // Safety check
    if (containsMedicalAdvice(summary)) {
      return generateSimpleSummary(content);
    }
    
    return summary;
  } catch (error) {
    console.error('[AI] Error generating note summary:', error);
    return generateSimpleSummary(content);
  }
};

/**
 * Simple rule-based summary (fallback)
 */
const generateSimpleSummary = (content: string): string => {
  const words = content.split(' ');
  const wordCount = words.length;
  
  // Take first 15 words or less
  const summary = words.slice(0, 15).join(' ');
  
  if (wordCount > 15) {
    return summary + '...';
  }
  
  return summary;
};

