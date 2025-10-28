import React, { useState, useMemo } from 'react';
import './PatientPages.css';
import { LuFileText, LuPill, LuHeartPulse, LuBeaker, LuLink, LuSearch, LuCalendarDays } from 'react-icons/lu';

/**
 * 我的健康档案 (MHR) 页面 (UC-04)
 * 优化: 补全 'Visits' 卡片 , 实现搜索功能 
 */
const PatientHealthRecord = () => {
  const [isConnected, setIsConnected] = useState(false); // UC-04 [cite: 44]
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // UI 增强 

  // 模拟数据
  const mhrData = {
    medications: [
      { id: 1, name: 'Lisinopril', dosage: '10mg', date: 'Oct 20, 2025' },
      { id: 2, name: 'Metformin', dosage: '500mg', date: 'Oct 20, 2025' },
    ],
    diagnoses: [
      { id: 1, condition: 'Hypertension', date: 'Sep 15, 2025' },
      { id: 2, condition: 'Type 2 Diabetes', date: 'Sep 15, 2025' },
    ],
    labResults: [
      { id: 1, test: 'Blood Panel', result: 'Normal', date: 'Oct 22, 2025' },
      { id: 2, test: 'A1C', result: '6.8%', date: 'Sep 15, 2025' },
    ],
    // UC-04: 缺失的 'Visits' 卡片 
    visits: [
        { id: 1, type: 'Annual Check-up', doctor: 'Dr. Smith', date: 'Oct 28, 2025' },
        { id: 2, type: 'Dental Cleaning', doctor: 'Dr. White', date: 'Oct 22, 2025' },
    ]
  };

  const handleConnect = () => { // UC-04 [cite: 45]
    setIsLoading(true);
    // 模拟认证流程
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 2000);
  };

  // UI 增强: 实时搜索过滤 
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return mhrData;
    return {
      medications: mhrData.medications.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.dosage.toLowerCase().includes(query)
      ),
      diagnoses: mhrData.diagnoses.filter(item => 
        item.condition.toLowerCase().includes(query)
      ),
      labResults: mhrData.labResults.filter(item => 
        item.test.toLowerCase().includes(query) || 
        item.result.toLowerCase().includes(query)
      ),
      visits: mhrData.visits.filter(item => 
        item.type.toLowerCase().includes(query) || 
        item.doctor.toLowerCase().includes(query)
      ),
    };
  }, [searchQuery, mhrData]);
  
  // UI 增强: 空结果提示
  const EmptyResult = () => (
    <div className="record-item-empty">
      <p>No records found matching your search.</p>
    </div>
  );

  return (
    <div className="mhr-page">
      <h1 className="page-header">My Health Record</h1>

      {!isConnected ? (
        // UC-04: "Connect" 状态 [cite: 44]
        <div className="page-card mhr-connect-box animate-fadeInUp">
          <LuFileText size={60} color="#0d6efd" />
          <h2>Connect Your Health Record</h2>
          <p>Connect to My Health Record to view your complete health summary, medications, and lab results all in one place.</p>
          <button className="mhr-connect-btn" onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Connecting...' : <><LuLink size={18} /> Connect to MHR</>}
          </button>
          <p className="mhr-status-text">Health Record not connected.</p> 
        </div>
      ) : (
        // UC-04: 已连接状态 [cite: 46]
        <div className="animate-fadeInUp">
          <div className="mhr-header">
            {/* UC-04 搜索栏  */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <LuSearch style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
              <input 
                type="search" 
                placeholder="Search records..." 
                style={{ paddingLeft: '45px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* UC-04 更新时间 [cite: 53] */}
            <p>Data last updated: Oct 25, 2025</p> 
          </div>

          {/* UC-04 卡片网格 [cite: 46] */}
          <div className="summary-card-grid">
            
            {/* 药物卡片 [cite: 47] */}
            <div className="page-card summary-card">
              <div className="summary-card-header">
                <LuPill size={20} /> Medications
              </div>
              <div className="summary-card-body">
                {filteredData.medications.length > 0 ? filteredData.medications.map(item => (
                  <div key={item.id} className="record-item">
                    <strong>{item.name}</strong> ({item.dosage})
                    <span className="record-source">Source: MHR, {item.date}</span> 
                  </div>
                )) : <EmptyResult />}
              </div>
            </div>

            {/* 诊断卡片 [cite: 48] */}
            <div className="page-card summary-card">
              <div className="summary-card-header">
                <LuHeartPulse size={20} /> Diagnoses / Conditions
              </div>
              <div className="summary-card-body">
                {filteredData.diagnoses.length > 0 ? filteredData.diagnoses.map(item => (
                  <div key={item.id} className="record-item">
                    <strong>{item.condition}</strong>
                    <span className="record-source">Source: MHR, {item.date}</span> 
                  </div>
                )) : <EmptyResult />}
              </div>
            </div>

            {/* 化验结果卡片 [cite: 49] */}
            <div className="page-card summary-card">
              <div className="summary-card-header">
                <LuBeaker size={20} /> Recent Lab Results
              </div>
              <div className="summary-card-body">
                {filteredData.labResults.length > 0 ? filteredData.labResults.map(item => (
                  <div key={item.id} className="record-item">
                    <strong>{item.test}:</strong> {item.result}
                    <span className="record-source">Source: MHR, {item.date}</span> 
                  </div>
                )) : <EmptyResult />}
              </div>
            </div>

            {/* 访问/预约卡片  */}
            <div className="page-card summary-card">
              <div className="summary-card-header">
                <LuCalendarDays size={20} /> Visits / Encounters
              </div>
              <div className="summary-card-body">
                {filteredData.visits.length > 0 ? filteredData.visits.map(item => (
                  <div key={item.id} className="record-item">
                    <strong>{item.type}</strong> (with {item.doctor})
                    <span className="record-source">Source: MHR, {item.date}</span> 
                  </div>
                )) : <EmptyResult />}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHealthRecord;