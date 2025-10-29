import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// --- 公共页面和登录页面 ---
import Home from "./Home/Home.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Login/Register.jsx";
import ForgotPassword from "./Login/ForgotPassword.jsx";

// --- 患者 (Patient) 页面 ---
// 1. 导入新的布局组件
import PatientLayout from "./PatientPages/PatientLayout.jsx"; 
// 2. 导入所有新的患者页面
import PatientDashboard from "./PatientPages/PatientDashboard.jsx";
import PatientReminders from "./PatientPages/PatientReminders.jsx";
import PatientChat from "./PatientPages/PatientChat.jsx";
import PatientVoice from "./PatientPages/PatientVoice.jsx";
import PatientHealthRecord from "./PatientPages/PatientHealthRecord.jsx";
import PatientProfile from "./PatientPages/PatientProfile.jsx";

// --- Clinician (Doctor) 页面 ---
import ClinicianLayout from "./ClinicianPages/ClinicianLayout.jsx";
import ClinicianDashboard from "./ClinicianPages/ClinicianDashboard.jsx";

// --- Caregiver 页面 ---
import CaregiverLayout from "./CaregiverPages/CaregiverLayout.jsx";
import CaregiverDashboard from "./CaregiverPages/CaregiverDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 公共路由 --- */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        
        {/* --- 认证路由 --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} /> 

        {/* --- 新增：患者 (Patient) 嵌套路由 --- */}
        {/* 所有路径以 /patient 开头的路由，都会先加载 PatientLayout。
          PatientLayout 内部的 <Outlet /> 会根据子路径渲染对应的组件。
        */}
        <Route path="/patient" element={<PatientLayout />}>
          
          {/* 索引路由: 访问 /patient 时, 自动重定向到 /patient/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} /> 
          
          {/* 子路由 (路径会自动拼接, e.g., /patient/dashboard) */}
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="reminders" element={<PatientReminders />} />
          <Route path="chat" element={<PatientChat />} />
          <Route path="voice" element={<PatientVoice />} />
          <Route path="records" element={<PatientHealthRecord />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* --- Clinician (Doctor) Routes --- */}
        <Route path="/clinician" element={<ClinicianLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClinicianDashboard />} />
        </Route>

        {/* --- Caregiver Routes --- */}
        <Route path="/caregiver" element={<CaregiverLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CaregiverDashboard />} />
        </Route>

        {/* --- 兜底路由 --- */}
        <Route path="*" element={
          <div style={{ padding: '5rem', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
