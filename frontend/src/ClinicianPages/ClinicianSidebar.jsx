import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuClipboardList, LuFileText, LuLogOut, LuUser, LuStethoscope } from 'react-icons/lu';
import { api } from '../lib/api';
import '../PatientPages/PatientLayout.css';

const ClinicianSidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    fetchUserName();
    
    // Track active section on scroll
    const handleScroll = () => {
      const sections = ['overview', 'patient-info', 'medical-history', 'reports'];
      const scrollPosition = window.scrollY + 100; // Offset for header
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await api.get('/auth/me');
      const email = response.data.user.email;
      setUserName(email.split('@')[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  const navItems = [
    { id: 'overview', icon: LuLayoutDashboard, label: 'Dashboard' },
    { id: 'patient-info', icon: LuClipboardList, label: 'Patient Info' },
    { id: 'medical-history', icon: LuStethoscope, label: 'Medical History' },
    { id: 'reports', icon: LuFileText, label: 'Reports' },
  ];

  return (
    <aside className="patient-sidebar" style={{
      background: 'linear-gradient(to bottom, #f8fafc, #eef1f5)',
      borderRight: '1px solid #e5e7eb'
    }}>
      <div className="sidebar-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h2 className="sidebar-logo" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>ElderCare Assist AI</h2>
        <p className="sidebar-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Doctor Portal</p>
        {userName && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#475569', 
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <LuUser size={14} color="#10b981" />
            <span style={{ fontWeight: '500' }}>Dr. {userName}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="sidebar-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeSection === id ? '#10b981' : 'transparent',
              color: activeSection === id ? 'white' : '#1e293b',
              fontWeight: activeSection === id ? '600' : '500',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%',
              transform: activeSection === id ? 'translateX(4px)' : 'translateX(0)',
              boxShadow: activeSection === id ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== id) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateX(2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <button 
          onClick={handleLogout} 
          className="sidebar-link logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#dc2626',
            fontWeight: '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
            e.currentTarget.style.transform = 'translateX(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <LuLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ClinicianSidebar;

