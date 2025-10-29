import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import ClinicianSidebar from './ClinicianSidebar';
import '../PatientPages/PatientLayout.css';

const ClinicianLayout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id || user.role !== 'CLINICIAN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="patient-layout">
      <ClinicianSidebar />
      <main className="patient-main">
        <div className="patient-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClinicianLayout;

