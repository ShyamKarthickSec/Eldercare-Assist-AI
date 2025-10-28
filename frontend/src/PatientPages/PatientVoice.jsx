import React, { useState } from 'react';
import './PatientPages.css';
import { LuMic, LuCheck, LuX, LuTrash2, LuSave } from 'react-icons/lu';

/**
 * 语音助手页面 (UC-09)
 * 优化: 完整实现 UC-09 流程
 * UI 增强: 添加建议命令, 识别的命令可点击编辑
 */
const PatientVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Press the button to start');
  const [command, setCommand] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false); // UC-09 [cite: 265]
  const [history, setHistory] = useState([ // UC-09 [cite: 270]
    { id: 1, text: 'Set reminder for 10 AM', time: '09:15 AM' },
    { id: 2, text: 'What is my next appointment?', time: '09:14 AM' },
  ]);
  
  // UI 增强: 编辑状态
  const [isEditingCommand, setIsEditingCommand] = useState(false);
  const [editedCommand, setEditedCommand] = useState('');

  const handleMicClick = () => { // UC-09 [cite: 263]
    if (isListening) return;

    setIsListening(true);
    setStatusText('Listening...'); // UC-09
    setCommand('');
    setEditedCommand('');
    setNeedsConfirmation(false);
    setIsEditingCommand(false);

    // 模拟语音识别
    setTimeout(() => {
      setIsListening(false);
      setStatusText('Processing...');
      
      setTimeout(() => {
        const recognizedCmd = 'Cancel all medication reminders';
        setCommand(recognizedCmd); // UC-09 [cite: 264]
        setEditedCommand(recognizedCmd); // UI 增强
        setStatusText('Recognised Command:');
        
        // UC-09: 检查是否需要确认 [cite: 265]
        if (recognizedCmd.includes('cancel')) {
          setNeedsConfirmation(true); 
        } else {
          executeCommand(recognizedCmd);
        }
      }, 1500);

    }, 3000);
  };

  const executeCommand = (cmd) => {
    setStatusText('Command executed successfully!'); // UC-09 [cite: 269]
    setHistory([{ id: Date.now(), text: cmd, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...history]);
    setNeedsConfirmation(false);
    setCommand('');
    setEditedCommand('');
    setIsEditingCommand(false);
  };

  const handleConfirmation = (proceed) => { // UC-09 [cite: 267]
    if (proceed) {
      executeCommand(command); // 使用 (可能) 已编辑的 "command" state
    } else {
      setStatusText('Action cancelled.'); // UC-09 [cite: 268]
      setNeedsConfirmation(false);
      setCommand('');
      setEditedCommand('');
      setIsEditingCommand(false);
    }
  };

  // UI 增强: 保存编辑
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setCommand(editedCommand);
    setIsEditingCommand(false);
  };

  return (
    <div className="voice-page">
      <h1 className="page-header">Voice Assistant</h1>
      <div className="voice-page-layout">

        {/* 左侧: 控制面板 */}
        <div className="page-card voice-control-panel animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <div className="page-card-header">
            <h2>Voice Control</h2>
          </div>
          <div className="page-card-body">
            {/* UC-09 麦克风按钮 [cite: 263] */}
            <button 
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={handleMicClick}
              disabled={isListening || needsConfirmation}
            >
              <LuMic />
            </button>
            <p className="status-text">{statusText}</p>
            
            {/* UC-09 命令显示 [cite: 264] / UI 增强: 可编辑 */}
            {command && !needsConfirmation && !isEditingCommand && (
              <div className="command-display editable" onClick={() => {
                setIsEditingCommand(true);
                setStatusText('Editing command...');
              }}>
                "{command}" <small>(Click to edit)</small>
              </div>
            )}
            
            {/* UI 增强: 编辑视图 */}
            {isEditingCommand && (
              <form className="command-edit-form" onSubmit={handleSaveEdit}>
                <input 
                  type="text" 
                  value={editedCommand}
                  onChange={(e) => setEditedCommand(e.target.value)}
                />
                <button type="submit" className="btn-action">
                  <LuSave size={14} /> Save
                </button>
              </form>
            )}

            {/* UC-09 确认框 [cite: 266, 267] */}
            {needsConfirmation && (
              <div className="confirmation-prompt">
                <p>"{command}"</p>
                <p><strong>Should I proceed?</strong></p>
                <div>
                  <button className="btn-action-secondary" onClick={() => handleConfirmation(false)}>
                    <LuX /> No, Cancel
                  </button>
                  <button className="btn-action" onClick={() => handleConfirmation(true)}>
                    <LuCheck /> Yes, Proceed
                  </button>
                </div>
              </div>
            )}
            
            {/* UI 增强: 建议命令 */}
            <div className="suggested-commands">
              <strong>Things you can say:</strong>
              <ul>
                <li>"What is my next appointment?"</li>
                <li>"Set a reminder for my medicine at 1 PM."</li>
                <li>"Call my caregiver."</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右侧: 历史记录 [cite: 270] */}
        <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="page-card-header history-header">
            <h2>Command History</h2>
            {/* UC-09 清除历史 [cite: 271] */}
            <button className="btn-action-secondary" onClick={() => setHistory([])}>
              <LuTrash2 size={14} /> Clear History
            </button>
          </div>
          <div className="page-card-body">
            <ul className="history-list">
              {history.length > 0 ? history.map((item) => (
                <li key={item.id} className="history-item">
                  <span>{item.text}</span>
                  <small>{item.time}</small>
                </li>
              )) : (
                <div className="empty-state" style={{padding: '1rem 0'}}>
                  <LuInbox size={40} />
                  <p>No commands yet.</p>
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