import OpenAI from 'openai';
import { ENV } from '../env';

// Initialize OpenAI client (will be null if no API key)
export const openaiClient = ENV.NODE_ENV !== 'test' && process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Safety filter keywords
const medicalDiagnosisKeywords = [
  'diagnose', 'diagnosis', 'prescribe', 'prescription', 'treatment plan',
  'you have', 'you might have', 'you could have', 'disease', 'condition is'
];

export const containsMedicalAdvice = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return medicalDiagnosisKeywords.some(keyword => lowerText.includes(keyword));
};

export const isAIAvailable = (): boolean => {
  return openaiClient !== null;
};

