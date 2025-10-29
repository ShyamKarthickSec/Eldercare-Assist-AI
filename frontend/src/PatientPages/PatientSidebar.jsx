import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LuLayoutDashboard, LuHeartPulse, LuMessageSquare, LuMic, 
  LuFileText, LuUser, LuLogOut, 
  LuSiren // --- MODIFIED: Replaced LuAlertTriangle with LuSiren ---
} from 'react-icons/lu'; 
import EmergencySOS from './EmergencySOS';
import { api } from '../lib/api';
import './PatientLayout.css'; // 共享布局样式

/**
 * 垂直侧边栏组件
 * 包含导航、SOS 按钮 (UC-10) 和个人资料区 (UC-01)
 */
const PatientSidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Patient');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      setUserEmail(user.email);
      
      // Use profile displayName if available, otherwise use email prefix
      if (user.profile && user.profile.displayName) {
        setUserName(user.profile.displayName);
      } else {
        setUserName(user.email.split('@')[0]);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="patient-sidebar">
      {/* 顶部 Logo */}
      <div className="sidebar-logo">
        ElderCare Assist AI
      </div>

      {/* 中部导航链接 */}
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/patient/dashboard">
            <LuLayoutDashboard />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/reminders">
            <LuHeartPulse />
            <span>Reminders</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/chat">
            <LuMessageSquare />
            <span>Companion Chat</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/voice">
            <LuMic />
            <span>Voice Assistant</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/records">
            <LuFileText />
            <span>My Health Record</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/patient/profile">
            <LuUser />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>

      {/* 底部 SOS 和 个人资料区 */}
      <div className="sidebar-footer">
        
        {/* 紧急 SOS 按钮 (UC-10) */}
        <EmergencySOS />

        {/* 个人资料区 (UC-01) */}
        <div className="profile-section">
          <img 
            src={`https://placehold.co/40x40/0d6efd/white?text=${userName.substring(0, 2).toUpperCase()}`}
            alt="User Avatar" 
            className="profile-avatar" 
          />
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">Patient</span>
          </div>
          <button onClick={handleLogout} className="logout-button" title="Logout">
            <LuLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PatientSidebar;
