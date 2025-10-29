import React, { useState, useEffect, useRef } from 'react';
import './PatientPages.css';
import { LuMic, LuCheck, LuX, LuTrash2, LuMessageSquare, LuStickyNote } from 'react-icons/lu';
import { api } from '../lib/api';

/**
 * Voice AI Companion for Elderly Patients
 * Features:
 * - Conversational AI using client STT/TTS
 * - Voice note creation with confirmation
 * - Safe, empathetic responses (no medical advice)
 * - Command history with action badges
 */
const PatientVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Press the button to start');
  const [transcript, setTranscript] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pendingNote, setPendingNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

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
    
    // Check for note intent
    const noteContent = detectNoteIntent(text);
    
    if (noteContent) {
      // Note creation flow
      setPendingNote(noteContent);
      setNeedsConfirmation(true);
      setStatusText('Ready to create note');
      speak(`I can create a note for your caregiver saying: ${noteContent}. Should I proceed?`);
      addToHistory(text, 'user');
    } else {
      // Regular conversation
      await handleConversation(text);
    }
  };

  // Handle conversational AI response
  const handleConversation = async (userMessage) => {
    try {
      const response = await api.post('/companion/message', {
        message: userMessage,
      });

      // Backend returns { reply, risk, sessionId }
      const aiReply = response.data.reply || response.data.message || '';
      
      if (!aiReply) {
        throw new Error('No response from assistant');
      }
      
      addToHistory(userMessage, 'user');
      addToHistory(aiReply, 'assistant');
      
      setStatusText('Speaking...');
      speak(aiReply);
      
      console.log('✅ Assistant response:', aiReply);
    } catch (error) {
      console.error('Conversation error:', error);
      const fallback = "I'm having trouble connecting right now. But I'm here to help you feel better.";
      setStatusText('Connection issue');
      speak(fallback);
      addToHistory(userMessage, 'user');
      addToHistory(fallback, 'assistant');
    }
  };

  // Add entry to history
  const addToHistory = (text, type, badge = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      text,
      type, // 'user' | 'assistant'
      badge, // 'note' | 'reminder' | null
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
    setPendingNote(null);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
      setStatusText('Failed to start. Please try again.');
    }
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
    setPendingNote(null);
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

            {/* Note Confirmation Prompt */}
            {needsConfirmation && pendingNote && (
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
                    onClick={() => handleNoteConfirmation(false)}
                    style={{ flex: 1 }}
                  >
                    <LuX /> No, Cancel
                  </button>
                  <button 
                    className="btn-action" 
                    onClick={() => handleNoteConfirmation(true)}
                    style={{ flex: 1, backgroundColor: '#10b981' }}
                  >
                    <LuCheck /> Yes, Save Note
                  </button>
                </div>
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
                  <li>"Remember that I need help with groceries."</li>
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
                            backgroundColor: item.badge === 'note' ? '#dcfce7' : '#dbeafe',
                            color: item.badge === 'note' ? '#166534' : '#1e40af',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            {item.badge === 'note' ? <><LuStickyNote size={10} /> Note Saved</> : '✓'}
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