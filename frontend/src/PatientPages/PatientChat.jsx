import React, { useState, useEffect, useRef } from 'react';
import './PatientPages.css';
import { LuSend, LuSmile, LuHeart, LuMeh, LuFrown, LuWifiOff } from 'react-icons/lu';

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
  const [mood, setMood] = useState('Meh'); // UC-08 [cite: 252]
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

  // 模拟 AI 回复的函数
  const triggerAiResponse = (userMessageText) => {
    setIsAiTyping(true);
    
    setTimeout(() => {
      let aiText = `You mentioned: "${userMessageText}". That's interesting!`;

      // UC-08: 检查情绪以提供同理心回复 
      if (mood === 'Sad' && userMessageText.toLowerCase().includes('feeling sad')) {
        aiText = "I'm really sorry to hear you're feeling sad. Please know that I'm here to listen. Would you like to talk about what's on your mind?";
      }

      const aiResponse = {
        id: Date.now(),
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setIsAiTyping(false);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500); // 模拟 AI 思考
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

  // UI 增强: 点击情绪图标发送消息
  const handleMoodSelect = (newMood, moodText) => {
    setMood(newMood);
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