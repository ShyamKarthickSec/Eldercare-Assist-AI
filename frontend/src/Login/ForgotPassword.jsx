import React, { useState } from 'react';
import './AuthLayout.css'; // 复用布局CSS
import './AuthForms.css'; // 复用表单CSS
import agedCareBackground from '../assets/pics/slider.jpg'; // 共享背景图
import { LuEye, LuEyeOff } from 'react-icons/lu'; // +++ 导入图标

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  
  // +++ 假设存在新密码字段 +++
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // +++ 结束假设 +++

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // +++ 假设存在密码验证 +++
    if (newPassword && (newPassword !== confirmPassword)) {
        alert("Passwords don't match!");
        return;
    }
    // +++ 结束假设 +++

    console.log('Password reset requested for:', email);
    alert('Password reset link sent (frontend demo, no actual send logic).');
    // 在这里添加发送重置邮件的逻辑
  };

  return (
    // 根容器 (同 Login/Register)
    <div className="auth-page-wrapper">
      
      {/* 顶部白色导航栏 (同 Login/Register) */}
      <header className="auth-navbar">
        <div className="container">
          <div className="navbar-logo">
            AgCarE.
          </div>
          <nav className="navbar-nav">
            {/* --- MODIFIED: 两个按钮均不 'active' --- */}
            <a href="/login" className="nav-button">
              Login
            </a>
            <a href="/register" className="nav-button">
              Register
            </a>
          </nav>
        </div>
      </header>

      {/* Banner 区域 (同 Login/Register) */}
      <div className="auth-hero-banner">
        
        {/* 背景图层 */}
        <div 
          className="auth-banner-bg"
          style={{ backgroundImage: `url(${agedCareBackground})` }}
        ></div>

        {/* 内容区域 */}
        <div className="content-area">
          
          {/* 左侧文字 (同 Login/Register) */}
          <div className="hero-text">
            <p className="welcome-text">WELCOME TO CARE</p>
            <h1>Caring for every journey of aging—with dignity, respect, and heart.</h1>
          </div>

          {/* 右侧表单卡片 (新内容) */}
          <div className="form-card">
            <div className="form-wrapper">
              
              {/* --- MODIFIED: 此页面没有 .form-header 标签页 --- */}
              
              <div className="form-content">
                <h2>Reset Password</h2>
                <p className="welcome-back-message">
                  Enter your account's email and we'll send a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="reset-email">Email</label>
                    <input
                      type="email"
                      id="reset-email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* +++ 假设：添加新密码字段 +++ */}
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        id="new-password" 
                        placeholder="At least 6 characters" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className={showPassword ? 'with-toggle' : ''}
                        // required // 也许是第二步才 required
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-new-password">Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        id="confirm-new-password" 
                        placeholder="At least 6 characters" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className={showConfirmPassword ? 'with-toggle' : ''}
                        // required
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                      </button>
                    </div>
                  </div>
                  {/* +++ 结束假设 +++ */}


                  <button type="submit" className="primary-button">Send Reset Link</button>
                </form>
                
                <div className="form-links">
                  <p>Remember your password? <a href="/login" className="link-text">Sign In</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;