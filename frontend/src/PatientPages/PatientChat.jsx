import React, { useState, useEffect, useRef } from 'react';
import './PatientPages.css';
import { LuSend, LuSmile, LuHeart, LuMeh, LuFrown, LuWifiOff } from 'react-icons/lu';
import { normalizeMood, getMoodText } from '../lib/moodUtils';

/**
 * 陪伴聊天页面 (UC-08)
 * 优化: 实现同理心回复 , "End Session" 按钮 , 离线横幅 [cite: 255]
 * UI 增强: AI 打字指示器, 情绪图标可直接发送消息
 */
const PatientChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! How are you feeling today?', time: '09:30 AM' }, // UC-08 [cite: 248]
    { id: 2, sender: 'user', text: 'I\'m feeling a bit tired.', time: '09:31 AM' },
    { id: 3, sender: 'ai', text: "I'm sorry to hear that. Remember to get some rest. Is there anything I can help you with?", time: '09:31 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [mood, setMood] = useState('Neutral'); // Changed from 'Meh' to 'Neutral' (canonical)
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // UC-08 [cite: 255]
  const [isAiTyping, setIsAiTyping] = useState(false); // UI 增强
  
  const chatHistoryRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]); // 依赖中添加 isAiTyping

  // UC-08: 离线检测 [cite: 255]
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // AI Response with Backend Integration
  const triggerAiResponse = async (userMessageText) => {
    setIsAiTyping(true);
    
    try {
      // Get user data to find patient ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('User not found');
      }

      // Import api dynamically
      const { api } = await import('../lib/api.js');
      
      // Call backend AI companion endpoint with normalized mood
      const normalizedMood = normalizeMood(mood);
      const response = await api.post('/companion/message', {
        message: userMessageText,
        mood: normalizedMood
      });

      const aiResponse = {
        id: Date.now(),
        sender: 'ai',
        text: response.data.reply || "I'm here to listen. How can I help?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setIsAiTyping(false);
      setMessages(prev => [...prev, aiResponse]);
      
      console.log('✅ AI response received from backend');
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback to empathetic local response if API fails
      let fallbackText = `Thank you for sharing that with me. I'm here to support you.`;
      
      if (mood === 'Sad' || userMessageText.toLowerCase().includes('sad')) {
        fallbackText = "I'm sorry you're feeling this way. Remember, I'm here to listen and your caregiver is always available if you need support.";
      } else if (userMessageText.toLowerCase().includes('happy') || userMessageText.toLowerCase().includes('good')) {
        fallbackText = "That's wonderful to hear! I'm so glad you're feeling positive today! 😊";
      }
      
      const fallbackResponse = {
        id: Date.now(),
        sender: 'ai',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setIsAiTyping(false);
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  const handleSend = (e) => { // UC-08 [cite: 250]
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newUserMessage]);
    triggerAiResponse(inputText); // 触发 AI 回复
    setInputText('');
  };

  // UI 增强: 点击情绪图标发送消息 + persist to backend
  const handleMoodSelect = async (newMood, moodText) => {
    const normalizedMood = normalizeMood(newMood);
    setMood(normalizedMood);
    
    // Persist mood to backend (same as PatientDashboard)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const { api } = await import('../lib/api.js');
        await api.post(`/patients/${user.id}/mood`, {
          mood: normalizedMood,
          note: `Selected via companion chat: ${moodText}`
        });
        console.log(`✅ Mood "${normalizedMood}" recorded from chat!`);
      }
    } catch (error) {
      console.error('Failed to record mood from chat:', error);
    }
    
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: `I'm ${moodText}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newUserMessage]);
    triggerAiResponse(newUserMessage.text); // 触发 AI 回复
  };

  // UI 增强: AI 打字指示器
  const AiTypingIndicator = () => (
    <div className="message-container ai">
      <div className="message-avatar">AI</div>
      <div className="message-bubble ai typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  );

  return (
    <div className="page-card chat-page-layout animate-fadeInUp">
      <div className="page-card-header chat-header">
        <h2>Companion Chat</h2>
        {/* UC-08 情绪指示器 [cite: 252] */}
        <div className="mood-widget-body" style={{ padding: 0 }}>
          <span className={`mood-selector ${mood === 'Happy' ? 'selected' : ''}`} title="Happy" onClick={() => handleMoodSelect('Happy', 'feeling happy!')}><LuSmile /></span>
          <span className={`mood-selector ${mood === 'Meh' ? 'selected' : ''}`} title="Neutral" onClick={() => handleMoodSelect('Meh', 'feeling neutral.')}><LuMeh /></span>
          <span className={`mood-selector ${mood === 'Sad' ? 'selected' : ''}`} title="Sad" onClick={() => handleMoodSelect('Sad', 'feeling sad.')}><LuFrown /></span>
          <span className={`mood-selector ${mood === 'Loved' ? 'selected' : ''}`} title="Loved" onClick={() => handleMoodSelect('Loved', 'feeling loved!')}><LuHeart /></span>
        </div>
      </div>

      <div className="chat-window">
        {/* UC-08 离线横幅 [cite: 255] */}
        {isOffline && (
          <div className="offline-banner">
            <LuWifiOff size={14} /> Messages will send once reconnected (UC-08)
          </div>
        )}

        {/* 聊天历史 (UC-08) [cite: 248] */}
        <div className="chat-history" ref={chatHistoryRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`message-container ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'ai' ? 'AI' : 'JD'}
              </div>
              {/* UC-08 聊天气泡 [cite: 251] */}
              <div className={`message-bubble ${msg.sender}`}>
                <div>{msg.text}</div>
                <div className="message-timestamp">{msg.time}</div>
              </div>
            </div>
          ))}
          {/* UI 增强: 显示打字指示器 */}
          {isAiTyping && <AiTypingIndicator />}
        </div>
        
        {/* 输入区域 (UC-08) [cite: 249] */}
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isOffline}
          />
          <button type="submit" className="chat-send-btn" disabled={isOffline}>
            <LuSend />
          </button>
        </form>
      </div>
      {/* UC-08 结束会话  */}
      <button className="end-session-btn">End Session</button>
    </div>
  );
};

export default PatientChat;