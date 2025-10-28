import React, { useState } from 'react';
import './AuthLayout.css'; // 引入布局CSS
import './AuthForms.css'; // 引入表单CSS
import agedCareBackground from '../assets/pics/slider.jpg'; // 引入背景图
import { LuEye, LuEyeOff } from 'react-icons/lu'; 
import { useNavigate } from 'react-router-dom'; // +++ 1. 导入 useNavigate

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // +++ 2. 初始化 navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { api } = await import('../lib/api.js');
      const response = await api.post('/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on role
      navigate('/patient');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      
      <header className="auth-navbar">
        <div className="container">
          <div className="navbar-logo">
            AgCarE.
          </div>
          <nav className="navbar-nav">
            <a href="/login" className="nav-button active">
              Login
            </a>
            <a href="/register" className="nav-button">
              Register
            </a>
          </nav>
        </div>
      </header>

      <div className="auth-hero-banner">
        
        <div 
          className="auth-banner-bg"
          style={{ backgroundImage: `url(${agedCareBackground})` }}
        ></div>

        <div className="content-area">
          <div className="hero-text">
            <p className="welcome-text">WELCOME TO AgCarE.</p>
            <h1>Caring for every journey of aging—with dignity, respect, and heart.</h1>
          </div>

          <div className="form-card">
            <div className="form-wrapper">
              <div className="form-header">
                <a href="/login" className="form-tab login active">Sign In</a>
                <a href="/register" className="form-tab register">Register</a>
              </div>
              <div className="form-content">
                <h2>Sign In</h2>
                <p className="welcome-back-message">Welcome back. Please sign in to continue.</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="login-email">Account</label>
                    <input type="email" id="login-email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        id="login-password" 
                        placeholder="At least 6 characters" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
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
                  
                  <div className="checkbox-group">
                    <input type="checkbox" id="save-account" />
                    <label htmlFor="save-account">Save the account for next time log in</label>
                  </div>
                  <div className="checkbox-group">
                    <input type="checkbox" id="agree-terms" required />
                    <label htmlFor="agree-terms">By signing up, I agree with the Terms of Use & Privacy Policy</label>
                  </div>
                  
                  {/* +++ 4. 修复: 将 <a> 改回 <button type="submit"> +++ */}
                  <button type="submit" className="primary-button">Get Started</button> 
                  
                </form>
                <div className="form-links">
                  <a href="/forgotpassword">Forgot Password?</a>
                  <p>Don't have an account? <a href="/register" className="link-text">Go register</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
