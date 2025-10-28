import React, { useState } from 'react';
import './AuthLayout.css'; // 引入布局CSS
import './AuthForms.css'; // 引入表单CSS
import agedCareBackground from '../assets/pics/slider.jpg'; // 引入背景图
import { LuEye, LuEyeOff } from 'react-icons/lu'; // +++ 修复: 导入图标

const Register = () => {
  // ... (其他 state 保持不变) ...
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- NEW: 角色选择和条件字段 ---
  const [role, setRole] = useState('Patient'); // 默认为 Patient
  const [licenseNumber, setLicenseNumber] = useState('');
  const [patientCode, setPatientCode] = useState('');
  // ------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    try {
      const { api } = await import('../lib/api.js');
      const roleMap = { 'Patient': 'PATIENT', 'Caregiver': 'CAREGIVER', 'Doctor': 'CLINICIAN' };
      
      const response = await api.post('/auth/register', { 
        email,
        password,
        role: roleMap[role],
        firstName,
        lastName,
      });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      alert('Registration successful!');
      window.location.href = '/patient';
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const handleSendCode = () => {
    console.log('Send confirmation code to:', email);
    alert('Verification code sent (frontend demo, no actual send logic).');
  };

  return (
    // --- MODIFIED: 新的页面根容器 ---
    <div className="auth-page-wrapper">
      
      {/* --- MODIFIED: 顶部白色导航栏 (同 Home 页) --- */}
      <header className="auth-navbar">
        <div className="container">
          <div className="navbar-logo">
            AgCarE.
          </div>
          <nav className="navbar-nav">
            {/* 按钮样式已在 AuthLayout.css 中更新为蓝色按钮 */}
            <a href="/login" className="nav-button">
              Login
            </a>
            <a href="/register" className="nav-button active">
              Register
            </a>
          </nav>
        </div>
      </header>

      {/* --- MODIFIED: 新的 Banner 区域 (同 Home 页) --- */}
      <div className="auth-hero-banner">
        
        {/* 背景图层 */}
        <div 
          className="auth-banner-bg"
          style={{ backgroundImage: `url(${agedCareBackground})` }}
        ></div>

        {/* 内容区域 */}
        <div className="content-area">
          <div className="hero-text">
            <p className="welcome-text">WELCOME TO AgCarE.</p>
            <h1>Caring for every journey of aging—with dignity, respect, and heart.</h1>
          </div>

          <div className="form-card">
            <div className="form-wrapper">
              <div className="form-header">
                <a href="/login" className="form-tab login">Sign In</a>
                <a href="/register" className="form-tab register active">Register</a>
              </div>
              <div className="form-content">
                <h2>Register</h2>
                <p className="welcome-back-message">Join us today and unlock all features.</p>
                
                <form onSubmit={handleSubmit}>
                  
                  {/* ... (角色, 姓名, Email 保持不变) ... */}
                  <div className="form-group">
                    <label htmlFor="role-select">I am a...</label>
                    <select 
                      id="role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Patient">Patient</option>
                      <option value="Caregiver">Caregiver</option>
                      <option value="Doctor">Doctor</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group half-width">
                      <label htmlFor="first-name">First Name</label>
                      <input
                        type="text"
                        id="first-name"
                        placeholder="Input first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group half-width">
                      <label htmlFor="last-name">Last Name</label>
                      <input
                        type="text"
                        id="last-name"
                        placeholder="Input last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input type="email" id="register-email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  {/* +++ 修复: 密码输入框 +++ */}
                  <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        id="register-password" 
                        placeholder="At least 6 characters" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      {/* 修复: 从 span 改为 button, 使用 className="password-toggle-btn", 并使用图标 */}
                      <button 
                        type="button" 
                        className="password-toggle-btn" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </button>
                    </div>
                  </div>
                  
                  {/* +++ 修复: 确认密码输入框 +++ */}
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        id="confirm-password" 
                        placeholder="At least 6 characters" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                      />
                      {/* 修复: 从 span 改为 button, 使用 className="password-toggle-btn", 并使用图标 */}
                      <button 
                        type="button" 
                        className="password-toggle-btn" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                      </button>
                    </div>
                  </div>
                  
                  {/* ... (验证码, 条件字段, Checkbox, Button 保持不变) ... */}
                  <div className="form-group">
                    <label htmlFor="confirm-code">Confirm code</label>
                    <div className="code-input-wrapper">
                      <input type="text" id="confirm-code" placeholder="Enter code" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} required />
                      <button type="button" className="send-code-button" onClick={handleSendCode}>Send Code</button>
                    </div>
                  </div>

                  {role === 'Caregiver' && (
                    <div className="form-group conditional-field">
                      <label htmlFor="patient-code">Patient Invitation Code</label>
                      <input
                        type="text"
                        id="patient-code"
                        placeholder="Enter your patient's code"
                        value={patientCode}
                        onChange={(e) => setPatientCode(e.target.value)}
                        required
                      />
                      <p className="form-helper-text">Your account must be approved by the patient.</p>
                    </div>
                  )}

                  {role === 'Doctor' && (
                    <div className="form-group conditional-field">
                      <label htmlFor="medical-license">Medical License #</label>
                      <input
                        type="text"
                        id="medical-license"
                        placeholder="Enter your professional license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                      <p className="form-helper-text">Your account will be pending admin approval.</p>
                    </div>
                  )}

                  <div className="checkbox-group">
                    <input type="checkbox" id="agree-terms-register" required />
                    <label htmlFor="agree-terms-register">By signing up, I agree with the Terms of Use & Privacy Policy</label>
                  </div>
                  <button type="submit" className="primary-button">Create an account</button>
                </form>
                <div className="form-links">
                  <p>Already have an account? <a href="/login" className="link-text">Log in</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
