import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import CaregiverSidebar from './CaregiverSidebar';
import '../PatientPages/PatientLayout.css';

const CaregiverLayout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id || user.role !== 'CAREGIVER') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="patient-layout">
      <CaregiverSidebar />
      <main className="patient-main">
        <div className="patient-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CaregiverLayout;

