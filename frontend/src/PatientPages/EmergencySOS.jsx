import React, { useState, useEffect } from 'react';
import './PatientLayout.css'; // 共享布局样式 (用于 .sos-button 和 .modal)
import { LuSiren } from 'react-icons/lu'; // --- MODIFIED: Replaced LuAlertTriangle with LuSiren ---

/**
 * 紧急 SOS 按钮和确认流程 (UC-10)
 */
const EmergencySOS = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let timer;
    if (isSending && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSending && countdown === 0) {
      setIsSending(false);
      setStatusMessage('Alert sent to caregiver'); // UC-10
      // 3秒后关闭模态框
      setTimeout(() => resetModal(), 3000);
    }
    return () => clearTimeout(timer);
  }, [isSending, countdown]);

  const handleSOSClick = () => {
    resetModal();
    setModalOpen(true); // UC-10
  };

  const handleConfirm = () => {
    setIsSending(true);
    setStatusMessage('Sending alert ...'); // UC-10
  };

  const handleCancel = () => {
    // 只能在5秒内取消 (UC-10)
    if (isSending && countdown > 5) {
      resetModal();
    } else if (!isSending) {
      resetModal();
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setIsSending(false);
    setCountdown(10);
    setStatusMessage('');
  };

  const canCancel = !isSending || (isSending && countdown > 5); // UC-10

  return (
    <>
      <button className="sos-button" onClick={handleSOSClick}>
        <LuSiren /> {/* --- MODIFIED: Replaced icon --- */}
        <span>EMERGENCY SOS</span>
      </button>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{statusMessage || 'Send Emergency Alert now?'}</h3> {/* UC-10 */}
            
            {isSending ? (
              <div className="sos-countdown">
                <p>Sending alert in... {countdown}</p>
                {/* 倒计时条 (UC-10) */}
                <div className="countdown-bar-wrapper">
                  <div 
                    className="countdown-bar" 
                    style={{ width: `${(10 - countdown) * 10}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p>Your caregiver will be notified immediately.</p>
            )}

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={!canCancel} 
              >
                {isSending ? 'Cancel SOS' : 'Cancel'} {/* UC-10 */}
              </button>
              <button 
                className="btn-danger" 
                onClick={handleConfirm}
                disabled={isSending}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencySOS;
