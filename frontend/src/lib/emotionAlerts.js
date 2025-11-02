/**
 * Emotion Alert System for Caregivers
 * 
 * Monitors patient emotions and sends alerts to caregivers
 * when concerning emotional states are detected.
 * 
 * Privacy: Emotion % is ONLY sent to caregivers, not shown to patients
 */

import { api } from './api';

// Emotion thresholds for caregiver alerts
export const EMOTION_ALERT_CONFIG = {
  // Enable/disable emotion alerting
  ENABLED: true,
  
  // Minimum confidence to trigger alert (0-1)
  MIN_CONFIDENCE: 0.60,
  
  // Thresholds for each emotion type
  THRESHOLDS: {
    SAD: {
      enabled: true,
      severity: 'MEDIUM',
      message: 'Patient is expressing sadness',
    },
    STRESSED: {
      enabled: true,
      severity: 'HIGH',
      message: 'Patient is experiencing stress or anxiety',
    },
    HAPPY: {
      enabled: false, // Don't alert on positive emotions
    },
    NEUTRAL: {
      enabled: false, // Don't alert on neutral emotions
    },
  },
  
  // Special handling for critical mental health situations
  CRITICAL_KEYWORDS: ['suicidal', 'suicide', 'kill myself', 'want to die', 'end my life', 'hurt myself', 'harm myself'],
  
  // Cooldown period to prevent alert spam (milliseconds)
  // Only one alert per emotion type within this period
  COOLDOWN_MS: 5 * 60 * 1000, // 5 minutes
};

// Track recent alerts to implement cooldown
const recentAlerts = new Map();

/**
 * Check if an emotion alert should be sent to caregivers
 * 
 * @param {string} emotionLabel - Emotion label (Happy/Sad/Stressed/Neutral)
 * @param {number} confidence - Confidence level (0-1)
 * @param {string} transcript - What the patient said
 * @returns {boolean} - True if alert should be sent
 */
export const shouldSendEmotionAlert = (emotionLabel, confidence, transcript) => {
  if (!EMOTION_ALERT_CONFIG.ENABLED) {
    return false;
  }

  const emotionKey = emotionLabel.toUpperCase();
  const config = EMOTION_ALERT_CONFIG.THRESHOLDS[emotionKey];

  // Check if alerts are enabled for this emotion type
  if (!config || !config.enabled) {
    return false;
  }

  // Check confidence threshold
  if (confidence < EMOTION_ALERT_CONFIG.MIN_CONFIDENCE) {
    console.log('[EmotionAlerts] Confidence too low for alert:', confidence);
    return false;
  }

  // Check cooldown
  const now = Date.now();
  const lastAlert = recentAlerts.get(emotionKey);
  
  if (lastAlert && (now - lastAlert) < EMOTION_ALERT_CONFIG.COOLDOWN_MS) {
    const remainingMs = EMOTION_ALERT_CONFIG.COOLDOWN_MS - (now - lastAlert);
    const remainingMin = Math.ceil(remainingMs / 60000);
    console.log(`[EmotionAlerts] Cooldown active for ${emotionKey}, ${remainingMin}min remaining`);
    return false;
  }

  return true;
};

/**
 * Send emotion alert to caregivers
 * 
 * @param {string} patientId - Patient user ID
 * @param {string} emotionLabel - Emotion label (Happy/Sad/Stressed/Neutral)
 * @param {number} confidence - Confidence level (0-1)
 * @param {string} transcript - What the patient said (for context)
 * @returns {Promise<boolean>} - True if alert sent successfully
 */
export const sendEmotionAlertToCaregivers = async (patientId, emotionLabel, confidence, transcript) => {
  if (!shouldSendEmotionAlert(emotionLabel, confidence, transcript)) {
    return false;
  }

  const emotionKey = emotionLabel.toUpperCase();
  const config = EMOTION_ALERT_CONFIG.THRESHOLDS[emotionKey];
  
  // Check for critical mental health keywords (suicidal ideation)
  const lowerTranscript = transcript.toLowerCase();
  const hasCriticalKeyword = EMOTION_ALERT_CONFIG.CRITICAL_KEYWORDS.some(keyword => 
    lowerTranscript.includes(keyword)
  );
  
  // Upgrade severity to CRITICAL if suicidal ideation detected
  let severity = config.severity;
  let alertType = 'EMOTIONAL_CONCERN';
  let description = `${config.message} (${Math.round(confidence * 100)}% confidence). Voice assistant detected concerning emotional state.`;
  
  if (hasCriticalKeyword) {
    severity = 'CRITICAL';
    alertType = 'MENTAL_HEALTH_CRISIS';
    description = `🚨 CRITICAL: Patient expressing suicidal ideation (${Math.round(confidence * 100)}% confidence). IMMEDIATE ATTENTION REQUIRED. Voice assistant detected severe mental health crisis.`;
  }

  try {
    console.log('[EmotionAlerts] Sending alert to caregivers:', {
      emotion: emotionLabel,
      confidence: Math.round(confidence * 100) + '%',
      severity: severity,
      critical: hasCriticalKeyword,
    });

    // Create alert for caregivers
    await api.post(`/patients/${patientId}/alerts/create`, {
      type: alertType,
      severity: severity,
      title: hasCriticalKeyword ? `🚨 CRITICAL: Suicidal Ideation Detected` : `Emotional Alert: ${emotionLabel}`,
      description: description,
      metadata: {
        emotion: emotionLabel,
        confidence: confidence,
        transcriptPreview: transcript.substring(0, 100), // First 100 chars for context
        source: 'voice_assistant',
        timestamp: new Date().toISOString(),
        critical: hasCriticalKeyword,
        suicidalIdeation: hasCriticalKeyword,
      },
      status: 'ACTIVE',
    });

    // Update cooldown
    recentAlerts.set(emotionKey, Date.now());

    console.log(`[EmotionAlerts] ✅ Alert sent successfully to caregivers${hasCriticalKeyword ? ' (CRITICAL - SUICIDAL IDEATION)' : ''}`);
    return true;
  } catch (error) {
    console.error('[EmotionAlerts] Failed to send alert:', error);
    return false;
  }
};

/**
 * Process emotion detection result and send alerts if needed
 * This is called from PatientVoice.jsx after emotion detection
 * 
 * @param {object} emotionResult - Result from detectEmotion()
 * @param {string} transcript - What the patient said
 */
export const processEmotionForAlerts = async (emotionResult, transcript) => {
  if (!emotionResult) {
    return;
  }

  const { label, confidence } = emotionResult;

  // Get patient ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) {
    console.warn('[EmotionAlerts] No patient ID found in localStorage');
    return;
  }

  // Check if we should send an alert
  await sendEmotionAlertToCaregivers(user.id, label, confidence, transcript);
};

/**
 * Clear cooldown for an emotion type (for testing)
 * 
 * @param {string} emotionLabel - Emotion label to clear cooldown for
 */
export const clearEmotionAlertCooldown = (emotionLabel) => {
  const emotionKey = emotionLabel.toUpperCase();
  recentAlerts.delete(emotionKey);
  console.log(`[EmotionAlerts] Cooldown cleared for ${emotionKey}`);
};

/**
 * Get cooldown status for all emotions (for debugging)
 * 
 * @returns {object} - Cooldown status for each emotion
 */
export const getEmotionAlertStatus = () => {
  const now = Date.now();
  const status = {};

  Object.keys(EMOTION_ALERT_CONFIG.THRESHOLDS).forEach((emotion) => {
    const lastAlert = recentAlerts.get(emotion);
    
    if (lastAlert) {
      const elapsed = now - lastAlert;
      const remaining = EMOTION_ALERT_CONFIG.COOLDOWN_MS - elapsed;
      
      status[emotion] = {
        lastAlert: new Date(lastAlert).toISOString(),
        cooldownActive: remaining > 0,
        remainingMs: Math.max(0, remaining),
        remainingMinutes: Math.ceil(Math.max(0, remaining) / 60000),
      };
    } else {
      status[emotion] = {
        lastAlert: null,
        cooldownActive: false,
        remainingMs: 0,
        remainingMinutes: 0,
      };
    }
  });

  return status;
};

