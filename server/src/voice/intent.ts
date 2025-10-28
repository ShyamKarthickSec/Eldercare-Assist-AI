// Intent detection for voice commands

export interface IntentResult {
  intent: string;
  highRisk: boolean;
  confirmationPrompt?: string;
  entities?: Record<string, any>;
}

const highRiskIntents = [
  'cancel_reminder',
  'cancel_all_reminders',
  'cancel_appointment',
  'delete_note',
];

export const detectIntent = (text: string): IntentResult => {
  const lowerText = text.toLowerCase();
  
  // Cancel reminders
  if (lowerText.includes('cancel') && (lowerText.includes('reminder') || lowerText.includes('medication'))) {
    if (lowerText.includes('all')) {
      return {
        intent: 'cancel_all_reminders',
        highRisk: true,
        confirmationPrompt: 'This will cancel ALL your medication reminders. Are you sure you want to proceed?',
      };
    }
    return {
      intent: 'cancel_reminder',
      highRisk: true,
      confirmationPrompt: 'This will cancel your medication reminder. Are you sure?',
    };
  }
  
  // Cancel appointment
  if (lowerText.includes('cancel') && lowerText.includes('appointment')) {
    return {
      intent: 'cancel_appointment',
      highRisk: true,
      confirmationPrompt: 'This will cancel your appointment. Are you sure you want to proceed?',
    };
  }
  
  // List appointments
  if (lowerText.includes('next') && lowerText.includes('appointment')) {
    return {
      intent: 'list_appointments',
      highRisk: false,
    };
  }
  
  // Set reminder
  if ((lowerText.includes('set') || lowerText.includes('add') || lowerText.includes('create')) && 
      lowerText.includes('reminder')) {
    return {
      intent: 'set_reminder',
      highRisk: false,
    };
  }
  
  // Call caregiver
  if (lowerText.includes('call') && lowerText.includes('caregiver')) {
    return {
      intent: 'call_caregiver',
      highRisk: false,
    };
  }
  
  // Unknown intent
  return {
    intent: 'unknown',
    highRisk: false,
  };
};

