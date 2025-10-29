/**
 * Mood Normalization Utility
 * Provides consistent mood mapping across Patient Dashboard, Companion Chat, and Backend
 */

/**
 * Normalize mood input to canonical enum values
 * @param {string} input - Raw mood input (emoji, text, or existing enum)
 * @returns {string} - Normalized mood: 'Happy' | 'Neutral' | 'Sad' | 'Loved'
 */
export function normalizeMood(input) {
  if (!input) return 'Neutral';
  
  const normalized = input.toLowerCase().trim();
  
  // Map all variations to canonical values
  if (
    normalized.includes('happy') ||
    normalized.includes('good') ||
    normalized.includes('great') ||
    normalized.includes('wonderful') ||
    normalized.includes('excellent') ||
    normalized.includes('joy') ||
    normalized.includes('😊') ||
    normalized.includes('🙂') ||
    normalized.includes('😄')
  ) {
    return 'Happy';
  }
  
  if (
    normalized.includes('sad') ||
    normalized.includes('down') ||
    normalized.includes('unhappy') ||
    normalized.includes('depressed') ||
    normalized.includes('lonely') ||
    normalized.includes('😢') ||
    normalized.includes('☹️') ||
    normalized.includes('😞')
  ) {
    return 'Sad';
  }
  
  if (
    normalized.includes('loved') ||
    normalized.includes('love') ||
    normalized.includes('caring') ||
    normalized.includes('❤️') ||
    normalized.includes('💕') ||
    normalized.includes('💖')
  ) {
    return 'Loved';
  }
  
  // Default to Neutral for: meh, ok, neutral, fine, etc.
  return 'Neutral';
}

/**
 * Get emoji for a mood
 * @param {string} mood - Canonical mood value
 * @returns {string} - Emoji representation
 */
export function getMoodEmoji(mood) {
  const emojiMap = {
    'Happy': '😊',
    'Neutral': '😐',
    'Sad': '😢',
    'Loved': '❤️'
  };
  return emojiMap[mood] || '😐';
}

/**
 * Get color for a mood
 * @param {string} mood - Canonical mood value
 * @returns {string} - CSS color value
 */
export function getMoodColor(mood) {
  const colorMap = {
    'Happy': '#28a745',    // Green
    'Neutral': '#0d6efd',  // Blue
    'Sad': '#dc3545',      // Red
    'Loved': '#e83e8c'     // Pink
  };
  return colorMap[mood] || '#6c757d'; // Gray fallback
}

/**
 * Get friendly text for a mood
 * @param {string} mood - Canonical mood value
 * @returns {string} - Human-readable text
 */
export function getMoodText(mood) {
  const textMap = {
    'Happy': 'feeling happy',
    'Neutral': 'feeling okay',
    'Sad': 'feeling sad',
    'Loved': 'feeling loved'
  };
  return textMap[mood] || 'no mood selected';
}

