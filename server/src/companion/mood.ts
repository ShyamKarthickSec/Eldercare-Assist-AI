import { RiskLevel } from '../common/types';

// Simple keyword-based mood/sentiment detection
const sadKeywords = ['sad', 'unhappy', 'depressed', 'lonely', 'upset', 'crying', 'hurt', 'pain', 'worse', 'terrible'];
const anxiousKeywords = ['worried', 'anxious', 'scared', 'afraid', 'nervous', 'stress', 'panic'];
const happyKeywords = ['happy', 'good', 'great', 'wonderful', 'excited', 'joy', 'better', 'well'];

export const analyzeMood = (text: string): RiskLevel => {
  const lowerText = text.toLowerCase();
  
  let sadScore = 0;
  let anxiousScore = 0;
  let happyScore = 0;
  
  sadKeywords.forEach(word => {
    if (lowerText.includes(word)) sadScore++;
  });
  
  anxiousKeywords.forEach(word => {
    if (lowerText.includes(word)) anxiousScore++;
  });
  
  happyKeywords.forEach(word => {
    if (lowerText.includes(word)) happyScore++;
  });
  
  // High risk if multiple negative indicators
  if (sadScore + anxiousScore >= 3) {
    return RiskLevel.HIGH;
  }
  
  // Medium risk if some negative indicators
  if (sadScore + anxiousScore >= 1) {
    return RiskLevel.MEDIUM;
  }
  
  return RiskLevel.LOW;
};

