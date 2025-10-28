import React from 'react';
import { Outlet } from 'react-router-dom';
import PatientSidebar from './PatientSidebar';
import './PatientLayout.css';

/**
 * 主布局组件，包含固定的垂直侧边栏和动态的内容区域。
 */
const PatientLayout = () => {
  return (
    <div className="patient-layout">
      {/* 侧边栏是固定的 */}
      <PatientSidebar />
      
      {/* 主内容区域，用于渲染子路由 (Dashboard, Reminders 等) */}
      <main className="patient-content-area">
        {/* <Outlet> 是 React Router V6 的一个组件，
            用于在其父路由元素中呈现子路由元素。 */}
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;