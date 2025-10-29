import { openaiClient, isAIAvailable, containsMedicalAdvice } from './openai';

/**
 * Generate AI-powered patient health summary
 * Used by doctors to get quick insights
 */
export const generateHealthSummary = async (data: {
  adherenceRate: number;
  missedMeds: number;
  recentMood: string;
  sosEvents: number;
  notes: string[];
}): Promise<string> => {
  // Fallback to rule-based summary if AI not available
  if (!isAIAvailable()) {
    return generateRuleBasedSummary(data);
  }

  try {
    const prompt = `You are a healthcare assistant. Provide a brief, empathetic 2-3 sentence summary of this patient's health status. DO NOT diagnose. DO NOT prescribe. Just summarize observations.

Patient Data:
- Medication Adherence: ${data.adherenceRate}%
- Missed Medications: ${data.missedMeds}
- Recent Mood: ${data.recentMood}
- SOS Events: ${data.sosEvents}
- Recent Notes: ${data.notes.slice(0, 3).join('; ')}

Summary (2-3 sentences, empathetic, no diagnosis):`;

    const response = await openaiClient!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim() || '';
    
    // Safety check
    if (containsMedicalAdvice(summary)) {
      return "Patient data reviewed. Please consult full timeline and reports for detailed assessment.";
    }
    
    return summary;
  } catch (error) {
    console.error('[AI] Error generating health summary:', error);
    return generateRuleBasedSummary(data);
  }
};

/**
 * Rule-based fallback summary (no AI required)
 */
const generateRuleBasedSummary = (data: {
  adherenceRate: number;
  missedMeds: number;
  recentMood: string;
  sosEvents: number;
}): string => {
  const adherenceText = data.adherenceRate >= 80 
    ? 'Patient shows good medication adherence'
    : data.adherenceRate >= 60
    ? 'Patient has moderate medication adherence'
    : 'Patient requires attention for medication adherence';

  const moodText = data.recentMood === 'LOW' || data.recentMood === 'sad'
    ? 'Recent mood indicators suggest monitoring may be needed.'
    : 'Recent mood indicators are stable.';

  const sosText = data.sosEvents > 0
    ? ` ${data.sosEvents} emergency alert(s) recorded.`
    : ' No recent emergency alerts.';

  return `${adherenceText} this week. ${moodText}${sosText}`;
};

