// Safety checks - refuse medical advice

const medicalKeywords = [
  'diagnose', 'diagnosis', 'treatment', 'prescribe', 'medication', 'medicine',
  'drug', 'symptom', 'disease', 'illness', 'cure', 'therapy', 'surgery'
];

export const checkMedicalQuery = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  
  return medicalKeywords.some(keyword => lowerText.includes(keyword));
};

export const getSafetyResponse = (): string => {
  return "I'm here to listen and provide companionship, but I'm not qualified to give medical advice. " +
         "For health concerns, please contact your doctor or healthcare provider. " +
         "Is there anything else you'd like to talk about?";
};

