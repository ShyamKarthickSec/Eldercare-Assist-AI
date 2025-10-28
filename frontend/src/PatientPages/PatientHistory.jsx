import React from 'react';
import './PatientPages.css';
import { 
  LuCircleCheck, // <-- 最终修复: 'LuCheckCircle2' -> 'LuCircleCheck'
  LuCircleX,     // <-- 这个是正确的
  LuChevronLeft, 
  LuInbox 
} from 'react-icons/lu';

/**
 * 新组件: 用药历史页面 (UC-03 的扩展)
 * @param {Object} props
 * @param {Array} props.meds - 来自 PatientReminders 的完整药物列表
 * @param {Function} props.onBack - 返回提醒页面的回调函数
 */
const PatientHistory = ({ meds, onBack }) => {

  // 筛选出已完成或错过的记录
  const historyItems = meds.filter(med => 
    med.status === 'Completed' || med.status === 'Missed'
  );

  // 按时间倒序 (模拟)
  historyItems.reverse();

  return (
    <div className="patient-history-page animate-fadeInUp">
      
      {/* 1. 页面标题和返回按钮 */}
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Medication History</h1>
        <button className="btn-action-secondary" onClick={onBack}>
          <LuChevronLeft size={16} /> Back to Reminders
        </button>
      </div>
      <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '1.5rem' }}>
        Showing all completed and missed medication doses.
      </p>

      {/* 2. 历史记录卡片 (重用 .page-card 样式) */}
      <div className="page-card">
        <div className="page-card-body">
          {historyItems.length === 0 ? (
            // 重用 .empty-state 样式
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <LuInbox size={40} />
              <h3>No History Yet</h3>
              <p>Your completed or missed doses will appear here.</p>
            </div>
          ) : (
            // 重用 .widget-list 样式
            <ul className="widget-list">
              {historyItems.map(item => (
                <li key={item.id} className="widget-list-item">
                  
                  {/* 根据状态显示不同图标 (重用 .widget-list-item-icon) */}
                  <span 
                    className={`widget-list-item-icon ${item.status === 'Completed' ? 'appt' : 'sos'}`}
                  >
                    {/* <-- 最终修复: 使用 'LuCircleCheck' --> */}
                    {item.status === 'Completed' ? <LuCircleCheck /> : <LuCircleX />}
                  </span>
                  
                  <div className="widget-list-item-info">
                    <span>{item.name} <small>({item.details})</small></span>
                    <small>Taken at: {item.time}</small>
                  </div>
                  
                  <span 
                    className={`timeline-status ${item.status === 'Completed' ? 'status-completed' : 'status-missed'}`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;