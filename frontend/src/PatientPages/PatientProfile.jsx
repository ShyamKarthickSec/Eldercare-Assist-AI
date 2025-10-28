import React, { useState, useEffect, useRef } from 'react'; // +++ Import useRef
import './PatientPages.css';
import { 
  LuUser, LuShieldCheck, LuSave, LuUpload, 
  LuEye, LuEyeOff, 
  LuCheck, 
  LuX      
} from 'react-icons/lu';

/**
 * 个人资料/设置页面 (通用)
 * ...
 * 修复: 实现 "Upload New Photo" 按钮功能
 */
const PatientProfile = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // +++ State for avatar URL +++
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/150x150/0d6efd/white?text=JD");
  // +++ Ref for hidden file input +++
  const fileInputRef = useRef(null);

  // UI 增强: Toast 通知 (保持不变)
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // 表单提交处理 (保持不变)
  const handleSubmitInfo = (e) => {
    e.preventDefault();
    showToast('Profile information saved!');
    // Add logic to save info
  };
  
  const handleSubmitPassword = (e) => {
    e.preventDefault();
    const oldPass = e.target.elements['old-password'].value;
    const newPass = e.target.elements['new-password'].value;
    const confirmPass = e.target.elements['confirm-new-password'].value;

    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPass.length < 8) {
        showToast('Password must be at least 8 characters.', 'error');
        return;
    }

    showToast('Password updated successfully!');
    e.target.reset();
  };

  // +++ Function to trigger file input click +++
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // +++ Function to handle file selection +++
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update the state with the Base64 data URL
        setAvatarUrl(reader.result); 
        // In a real app, you would upload the 'file' object here
        showToast('Avatar preview updated!'); 
      };
      reader.onerror = () => {
        showToast('Failed to read image file.', 'error');
      };
      reader.readAsDataURL(file); // Read the file as Data URL
    }
    // Reset file input value to allow selecting the same file again
    event.target.value = null;
  };

  // Toast 组件 (保持不变)
  const ToastNotification = () => (
    <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
      {toast.type === 'success' ? <LuCheck /> : <LuX />}
      {toast.message}
    </div>
  );

  return (
    <div className="profile-page">
      <h1 className="page-header">My Profile</h1>
      
      <div className="profile-grid">
        
        {/* 左侧: 头像卡片 */}
        <div className="page-card avatar-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <div className="page-card-body">
            <img 
              src={avatarUrl} // +++ Use state variable for src +++
              alt="User Avatar" 
              className="profile-avatar-large" 
            />
            <h3>John Doe</h3>
            <p>Role: Patient</p>
            {/* +++ Add onClick handler to the button +++ */}
            <button className="avatar-upload-btn" onClick={handleAvatarClick}>
              <LuUpload size={14} /> Upload New Photo
            </button>
            {/* +++ Hidden file input +++ */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*" // Accept only image files
              style={{ display: 'none' }} // Hide the input visually
            />
          </div>
        </div>

        {/* 右侧: 表单卡片 (保持不变) */}
        <div className="page-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          {/* --- 编辑个人信息 --- */}
          <div className="page-card-header">
            <h2>Account Information</h2>
          </div>
          <div className="page-card-body">
            <form onSubmit={handleSubmitInfo} className="profile-form-grid">
              
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input type="text" id="first-name" defaultValue="John" />
              </div>
              
              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input type="text" id="last-name" defaultValue="Doe" />
              </div>

              <div className="form-group-full">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" defaultValue="john.doe@example.com" readOnly />
                <small>Email cannot be changed.</small>
              </div>

              <div className="form-group-full" style={{textAlign: 'right', marginTop: '1rem'}}>
                <button type="submit" className="profile-save-btn">
                  <LuSave size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* --- 更改密码 --- */}
          <div className="page-card-header" style={{borderTop: '1px solid #e9ecef'}}>
            <h2>Change Password</h2>
          </div>
          <div className="page-card-body">
            <form onSubmit={handleSubmitPassword} className="profile-form-grid">
              
              {/* Old Password */}
              <div className="form-group">
                <label htmlFor="old-password">Old Password</label>
                <div className="password-input-wrapper">
                  <input type={showOldPass ? 'text' : 'password'} id="old-password" placeholder="••••••••" required/>
                  <button type="button" className="password-toggle-btn" onClick={() => setShowOldPass(!showOldPass)}>
                    {showOldPass ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </div>
              
              {/* New Password */}
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="password-input-wrapper">
                  <input type={showNewPass ? 'text' : 'password'} id="new-password" placeholder="••••••••" required/>
                  <button type="button" className="password-toggle-btn" onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password (UC-05) */}
              <div className="form-group">
                <label htmlFor="confirm-new-password">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input type={showConfirmPass ? 'text' : 'password'} id="confirm-new-password" placeholder="••••••••" required/>
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </div>

              <div className="form-group-full" style={{textAlign: 'right', marginTop: '1rem'}}>
                <button type="submit" className="profile-save-btn">
                  <LuShieldCheck size={16} /> Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
      
      {/* UI 增强: Toast 通知容器 */}
      <ToastNotification />
    </div>
  );
};

export default PatientProfile;
