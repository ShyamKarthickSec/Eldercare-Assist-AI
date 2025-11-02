import React, { useState, useEffect, useRef } from 'react';
import './PatientPages.css';
import { LuMic, LuCheck, LuX, LuTrash2, LuMessageSquare, LuStickyNote, LuSiren } from 'react-icons/lu';
import { api } from '../lib/api';
import {
  VOICE_EMOTION_ENABLED,
  initEmotionDetection,
  detectEmotion,
  getEmotionColor,
  getEmotionIcon,
  cleanupEmotionDetection
} from '../lib/emotionDetection';
import { processEmotionForAlerts } from '../lib/emotionAlerts';

/**
 * Voice AI Companion for Elderly Patients
 * Features:
 * - Conversational AI using client STT/TTS
 * - Voice note creation with confirmation
 * - Voice SOS trigger with confirmation
 * - Safe, empathetic responses (no medical advice)
 * - Command history with action badges
 */
const PatientVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Press the button to start');
  const [transcript, setTranscript] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null); // 'note' | 'sos'
  const [pendingNote, setPendingNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [sosSuccessBanner, setSosSuccessBanner] = useState(false);
  const [sosCooldownUntil, setSosCooldownUntil] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const audioContextRef = useRef(null);
  const audioChunksRef = useRef([]);
  const emotionModelReadyRef = useRef(false); // Use ref instead of state to persist across re-renders
  
  // Feature flag for voice SOS (default: enabled)
  const VOICE_SOS_ENABLED = true;

  // Initialize Web Speech API on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      setStatusText('Voice features are not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatusText('I heard: "' + text + '"');
      processUserSpeech(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setStatusText('Sorry, I didn\'t catch that. Try again?');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  // Initialize emotion detection (lazy load)
  useEffect(() => {
    if (VOICE_EMOTION_ENABLED) {
      initEmotionDetection()
        .then(() => {
          emotionModelReadyRef.current = true;
          console.log('[Voice] Emotion detection ready - model ref set to true');
        })
        .catch((error) => {
          console.log('[Voice] Emotion detection unavailable:', error.message);
          emotionModelReadyRef.current = false;
        });
    }

    return () => {
      if (VOICE_EMOTION_ENABLED) {
        console.log('[Voice] Cleaning up emotion detection');
        cleanupEmotionDetection();
        emotionModelReadyRef.current = false;
      }
    };
  }, []);

  // Stop TTS on unmount or when starting to listen
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  // Speak text using TTS
  const speak = (text) => {
    stopSpeaking(); // Barge-in support
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for elderly users
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Detect SOS intent
  const detectSOSIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // CRITICAL: Suicidal ideation patterns (highest priority)
    const criticalPatterns = [
      /\b(suicidal|suicide|kill\s+myself|end\s+(?:my\s+)?life|don'?t\s+want\s+to\s+live)\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bhurt\s+myself\b/i,
    ];
    
    // Standard SOS trigger patterns
    const sosPatterns = [
      /\b(help|emergency|urgent)\b/i,
      /\bi\s+need\s+help\b/i,
      /\bsend\s+(?:an?\s+)?(?:sos|alert|emergency)\b/i,
      /\bcall\s+(?:for\s+)?help\b/i,
      /\balert\s+(?:my\s+)?(?:caregiver|nurse)\b/i,
      /\bpanic\b/i,
      /\bsos\b/i,
    ];
    
    // Check critical patterns first
    const isCritical = criticalPatterns.some(pattern => pattern.test(lowerText));
    if (isCritical) {
      console.warn('[Voice] ⚠️ CRITICAL: Suicidal ideation detected');
      return true;
    }

    return sosPatterns.some(pattern => pattern.test(lowerText));
  };

  // Detect note creation intent
  const detectNoteIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Patterns for note creation
    const notePatterns = [
      /(?:create|add|leave|make|write)\s+(?:a\s+)?note/i,
      /note\s+(?:to|for)\s+(?:my\s+)?(?:caregiver|doctor|nurse)/i,
      /(?:tell|inform|let)\s+(?:my\s+)?(?:caregiver|doctor)/i,
      /remember\s+(?:that|to)/i,
    ];

    for (const pattern of notePatterns) {
      if (pattern.test(text)) {
        // Extract note content
        let content = text;
        
        // Remove the command prefix
        content = content.replace(/^(?:create|add|leave|make|write)\s+(?:a\s+)?note\s+(?:to|for|that|saying)?\s*/i, '');
        content = content.replace(/^(?:tell|inform|let)\s+(?:my\s+)?(?:caregiver|doctor|nurse)\s+(?:that|about)?\s*/i, '');
        content = content.replace(/^remember\s+(?:that|to)\s*/i, '');
        content = content.replace(/^note\s+(?:to|for)\s+(?:my\s+)?(?:caregiver|doctor|nurse)\s+(?:that|about)?\s*/i, '');
        
        return content.trim() || text;
      }
    }
    
    return null;
  };


  // Process user speech
  const processUserSpeech = async (text) => {
    setStatusText('Thinking...');
    
    // Detect emotion from the transcript (audio buffer not available in this implementation)
    // In production, you would capture audio buffer during STT and pass it here
    let detectedEmotion = null;
    const modelReady = emotionModelReadyRef.current;
    console.log('[Voice] Starting emotion detection...', { 
      enabled: VOICE_EMOTION_ENABLED, 
      modelReady: modelReady,
      text: text 
    });
    
    if (VOICE_EMOTION_ENABLED && modelReady) {
      try {
        detectedEmotion = await detectEmotion(text, null); // null = no audio buffer, use text fallback
        console.log('[Voice] Emotion detected:', detectedEmotion);
        
        // Send alert to caregivers if emotion is concerning (Sad/Stressed)
        // This does NOT show the % to patients - alerts only go to caregivers
        if (detectedEmotion) {
          await processEmotionForAlerts(detectedEmotion, text);
        }
      } catch (error) {
        console.warn('[Voice] Emotion detection failed:', error);
      }
    } else {
      console.warn('[Voice] Emotion detection skipped:', { 
        enabled: VOICE_EMOTION_ENABLED, 
        modelReady: modelReady 
      });
    }
    
    // Check for SOS intent first (highest priority)
    const isSOSRequest = detectSOSIntent(text);
    
    if (isSOSRequest) {
      // Check if voice SOS is enabled
      if (!VOICE_SOS_ENABLED) {
        const disabledMsg = "Voice SOS is disabled. Please use the red Emergency SOS button.";
        speak(disabledMsg);
        addToHistory(text, 'user', null, detectedEmotion);
        addToHistory(disabledMsg, 'assistant');
        setStatusText('Voice SOS disabled');
        return;
      }
      
      // Check cooldown
      if (sosCooldownUntil && Date.now() < sosCooldownUntil) {
        const remainingSeconds = Math.ceil((sosCooldownUntil - Date.now()) / 1000);
        const cooldownMsg = `An SOS was recently sent. Please wait ${remainingSeconds} seconds before sending another, or use the red Emergency SOS button.`;
        speak(cooldownMsg);
        addToHistory(text, 'user', null, detectedEmotion);
        addToHistory(cooldownMsg, 'assistant');
        setStatusText('SOS cooldown active');
        return;
      }
      
      // SOS confirmation flow
      setNeedsConfirmation(true);
      setConfirmationType('sos');
      setStatusText('SOS confirmation needed');
      speak("It sounds like you need help. Should I send an emergency SOS alert now?");
      addToHistory(text, 'user', null, detectedEmotion);
      
      // Log breadcrumb (non-PII)
      console.log('[Voice] voice_sos_intent');
      return;
    }
    
    // Check for note intent
    const noteContent = detectNoteIntent(text);
    
    if (noteContent) {
      // Note creation flow
      setPendingNote(noteContent);
      setNeedsConfirmation(true);
      setConfirmationType('note');
      setStatusText('Ready to create note');
      speak(`I can create a note for your caregiver saying: ${noteContent}. Should I proceed?`);
      addToHistory(text, 'user', null, detectedEmotion);
    } else {
      // Regular conversation
      await handleConversation(text, detectedEmotion);
    }
  };

  // Handle conversational AI response
  const handleConversation = async (userMessage, detectedEmotion = null) => {
    try {
      const response = await api.post('/companion/message', {
        message: userMessage,
      });

      // Backend returns { reply, risk, sessionId }
      const aiReply = response.data.reply || response.data.message || '';
      
      if (!aiReply) {
        throw new Error('No response from assistant');
      }
      
      addToHistory(userMessage, 'user', null, detectedEmotion);
      addToHistory(aiReply, 'assistant');
      
      setStatusText('Speaking...');
      speak(aiReply);
      
      console.log('✅ Assistant response:', aiReply);
    } catch (error) {
      console.error('Conversation error:', error);
      const fallback = "I'm having trouble connecting right now. But I'm here to help you feel better.";
      setStatusText('Connection issue');
      speak(fallback);
      addToHistory(userMessage, 'user', null, detectedEmotion);
      addToHistory(fallback, 'assistant');
    }
  };

  // Add entry to history
  const addToHistory = (text, type, badge = null, emotion = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      text,
      type, // 'user' | 'assistant'
      badge, // 'note' | 'sos' | null
      emotion, // { label, confidence, source } | null
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => [entry, ...prev]);
  };

  // Handle mic button click
  const handleMicClick = () => {
    if (!isBrowserSupported) {
      alert('Voice features require a modern browser like Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      stopSpeaking();
      return;
    }

    stopSpeaking(); // Stop any ongoing speech
    setIsListening(true);
    setStatusText('Listening...');
    setTranscript('');
    setNeedsConfirmation(false);
    setConfirmationType(null);
    setPendingNote(null);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
      setStatusText('Failed to start. Please try again.');
    }
  };

  // Handle SOS confirmation
  const handleSOSConfirmation = async (proceed) => {
    if (proceed) {
      setStatusText('Sending SOS...');
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Reuse the exact same SOS creation flow as the button
        await api.post(`/patients/${user.id}/alerts/create`, {
          type: 'SOS',
          severity: 'HIGH',
          title: 'SOS Emergency Alert (Voice)',
          description: 'Patient triggered emergency SOS via voice command - immediate attention required',
          status: 'ACTIVE'
        });
        
        console.log('✅ Voice SOS alert sent to caregiver!');
        
        const successMsg = "SOS sent. Help is on the way.";
        speak(successMsg);
        addToHistory(successMsg, 'assistant', 'sos');
        setStatusText('SOS sent successfully!');
        
        // Show success banner for 10 seconds
        setSosSuccessBanner(true);
        setTimeout(() => setSosSuccessBanner(false), 10000);
        
        // Set cooldown for 120 seconds (2 minutes)
        setSosCooldownUntil(Date.now() + 120000);
        
        // Log breadcrumb (non-PII)
        console.log('[Voice] voice_sos_confirmed');
      } catch (error) {
        console.error('Failed to send voice SOS:', error);
        const errorMsg = "I couldn't send the SOS right now. Please press the red Emergency SOS button.";
        speak(errorMsg);
        addToHistory(errorMsg, 'assistant');
        setStatusText('Failed to send SOS');
        
        // Log breadcrumb
        console.log('[Voice] voice_sos_failed');
      }
    } else {
      const cancelMsg = "Okay, I won't send an SOS alert.";
      speak(cancelMsg);
      addToHistory(cancelMsg, 'assistant');
      setStatusText('SOS cancelled');
    }

    setNeedsConfirmation(false);
    setConfirmationType(null);
  };

  // Handle note confirmation
  const handleNoteConfirmation = async (proceed) => {
    if (proceed && pendingNote) {
      setStatusText('Creating note...');
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await api.post(`/patients/${user.id}/notes`, {
          content: pendingNote,
        });

        const successMsg = "Okay, I've added that note for your caregiver.";
        speak(successMsg);
        addToHistory(successMsg, 'assistant', 'note');
        setStatusText('Note created successfully!');
      } catch (error) {
        console.error('Failed to create note:', error);
        const errorMsg = "Sorry, I couldn't save that note right now.";
        speak(errorMsg);
        addToHistory(errorMsg, 'assistant');
        setStatusText('Failed to create note');
      }
    } else {
      const cancelMsg = "Okay, I won't create that note.";
      speak(cancelMsg);
      addToHistory(cancelMsg, 'assistant');
      setStatusText('Action cancelled');
    }

    setNeedsConfirmation(false);
    setConfirmationType(null);
    setPendingNote(null);
  };

  // Unified confirmation handler
  const handleConfirmation = (proceed) => {
    if (confirmationType === 'sos') {
      handleSOSConfirmation(proceed);
    } else if (confirmationType === 'note') {
      handleNoteConfirmation(proceed);
    }
  };

  return (
    <div className="voice-page">
      <h1 className="page-header">Voice AI Companion</h1>
      <div className="voice-page-layout">

        {/* Left: Voice Control Panel */}
        <div className="page-card voice-control-panel animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <div className="page-card-header">
            <h2>🎙️ Voice Control</h2>
          </div>
          <div className="page-card-body">
            {/* Mic Button with Visual Feedback */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className={`mic-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleMicClick}
                disabled={!isBrowserSupported || needsConfirmation}
                style={{
                  position: 'relative',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                <LuMic />
              </button>
              {isSpeaking && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  width: '120%',
                  height: '120%',
                  border: '3px solid #10b981',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite',
                }}></div>
              )}
            </div>

            {/* Status Text */}
            <p className="status-text" style={{
              fontSize: '1.1rem',
              marginTop: '1.5rem',
              color: isListening ? '#3b82f6' : isSpeaking ? '#10b981' : '#64748b',
              fontWeight: isListening || isSpeaking ? '600' : '400',
            }}>
              {statusText}
            </p>

            {/* Transcript Display */}
            {transcript && !needsConfirmation && (
              <div className="command-display" style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6',
              }}>
                <small style={{ color: '#64748b', fontSize: '0.85rem' }}>You said:</small>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#1e293b' }}>"{transcript}"</p>
              </div>
            )}

            {/* SOS Confirmation Prompt */}
            {needsConfirmation && confirmationType === 'sos' && (
              <div className="confirmation-prompt" style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '3px solid #dc2626',
              }}>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <LuSiren size={48} style={{ color: '#dc2626', marginBottom: '0.5rem' }} />
                  <strong style={{ color: '#dc2626', fontSize: '1.2rem', display: 'block' }}>Emergency SOS</strong>
                </div>
                <p style={{ marginBottom: '1rem', fontWeight: '600', color: '#1e293b', textAlign: 'center', fontSize: '1.05rem' }}>
                  It sounds like you need help. Should I send an emergency SOS alert now?
                </p>
                <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                  Your caregiver will be notified immediately.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button 
                    className="btn-action-secondary" 
                    onClick={() => handleConfirmation(false)}
                    style={{ flex: 1 }}
                  >
                    <LuX /> No, Cancel
                  </button>
                  <button 
                    className="btn-action" 
                    onClick={() => handleConfirmation(true)}
                    style={{ flex: 1, backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  >
                    <LuCheck /> Yes, Send SOS
                  </button>
                </div>
              </div>
            )}

            {/* Note Confirmation Prompt */}
            {needsConfirmation && confirmationType === 'note' && pendingNote && (
              <div className="confirmation-prompt" style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                border: '2px solid #fb923c',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#ea580c', fontSize: '1rem' }}>📝 Create Note</strong>
                </div>
                <p style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>Note content:</p>
                <p style={{ 
                  padding: '0.75rem', 
                  backgroundColor: 'white', 
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  color: '#1e293b',
                }}>
                  "{pendingNote}"
                </p>
                <p style={{ marginBottom: '1rem', fontWeight: '600', color: '#1e293b' }}>Should I save this note for your caregiver?</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button 
                    className="btn-action-secondary" 
                    onClick={() => handleConfirmation(false)}
                    style={{ flex: 1 }}
                  >
                    <LuX /> No, Cancel
                  </button>
                  <button 
                    className="btn-action" 
                    onClick={() => handleConfirmation(true)}
                    style={{ flex: 1, backgroundColor: '#10b981' }}
                  >
                    <LuCheck /> Yes, Save Note
                  </button>
                </div>
              </div>
            )}

            {/* SOS Success Banner */}
            {sosSuccessBanner && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                border: '2px solid #16a34a',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-in',
              }}>
                <LuSiren size={24} style={{ color: '#16a34a', marginBottom: '0.5rem' }} />
                <strong style={{ color: '#166534', display: 'block', fontSize: '1rem' }}>Emergency alert sent!</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#15803d', fontSize: '0.9rem' }}>Your caregiver has been notified.</p>
              </div>
            )}
            
            {/* Suggested Commands */}
            {!needsConfirmation && (
              <div className="suggested-commands" style={{ marginTop: '2rem' }}>
                <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>💡 Try saying:</strong>
                <ul style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                  <li>"How are you today?"</li>
                  <li>"Tell me something nice."</li>
                  <li>"Create a note that I'm feeling dizzy."</li>
                  <li>"Leave a note for my caregiver that I missed my walk."</li>
                  <li style={{ color: '#dc2626', fontWeight: '600' }}>"Help" or "Emergency" (for SOS alert)</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Conversation History */}
        <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="page-card-header history-header">
            <h2>💬 Conversation History</h2>
            <button 
              className="btn-action-secondary" 
              onClick={() => setHistory([])}
              disabled={history.length === 0}
            >
              <LuTrash2 size={14} /> Clear
            </button>
          </div>
          <div className="page-card-body">
            <ul className="history-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {history.length > 0 ? history.map((item) => (
                <li 
                  key={item.id} 
                  className="history-item"
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: item.type === 'user' ? '#f0f9ff' : '#f8fafc',
                    borderLeft: item.type === 'user' ? '4px solid #3b82f6' : '4px solid #10b981',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ 
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}>
                      {item.type === 'user' ? '👤' : '🤖'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#64748b',
                        marginBottom: '0.25rem',
                        fontWeight: '600',
                      }}>
                        {item.type === 'user' ? 'You' : 'Assistant'}
                        {item.badge && (
                          <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.15rem 0.5rem',
                            backgroundColor: item.badge === 'sos' ? '#fecaca' : item.badge === 'note' ? '#dcfce7' : '#dbeafe',
                            color: item.badge === 'sos' ? '#991b1b' : item.badge === 'note' ? '#166534' : '#1e40af',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            {item.badge === 'sos' ? <><LuSiren size={10} /> SOS Sent</> : 
                             item.badge === 'note' ? <><LuStickyNote size={10} /> Note Saved</> : '✓'}
                          </span>
                        )}
                        {item.emotion && VOICE_EMOTION_ENABLED && (
                          <span 
                            style={{
                              marginLeft: '0.5rem',
                              padding: '0.2rem 0.6rem',
                              backgroundColor: `${getEmotionColor(item.emotion.label)}15`,
                              color: getEmotionColor(item.emotion.label),
                              border: `1px solid ${getEmotionColor(item.emotion.label)}40`,
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            aria-label={`Emotion detected: ${item.emotion.label} (${Math.round(item.emotion.confidence * 100)}% confidence)`}
                            title={`Detected from ${item.emotion.source === 'audio' ? 'voice' : 'text'} locally. No audio sent.`}
                          >
                            <span>{getEmotionIcon(item.emotion.label)}</span>
                            <span>{item.emotion.label}</span>
                            <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>
                              {Math.round(item.emotion.confidence * 100)}%
                            </span>
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>{item.text}</p>
                      <small style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                        {item.time}
                      </small>
                    </div>
                  </div>
                </li>
              )) : (
                <div className="empty-state" style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}>
                  <LuMessageSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1rem', margin: 0 }}>No conversation yet.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Press the mic to start talking!</p>
                </div>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientVoice;