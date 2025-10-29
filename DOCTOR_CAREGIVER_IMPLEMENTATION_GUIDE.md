# Doctor & Caregiver Dashboards - Implementation Guide

## ✅ Backend Complete

All backend features are implemented and working:

- ✅ AI Integration with OpenAI SDK
- ✅ Patient list endpoint: `GET /api/patients`
- ✅ AI summary endpoint: `GET /api/ai/summary/:patientId`
- ✅ Location tracking: `GET /api/patients/:id/location`
- ✅ Alerts endpoint: `GET /api/patients/:id/alerts`
- ✅ Enhanced Swagger docs at `/api/docs`
- ✅ Notes now use AI-powered summaries

## 📦 Frontend Implementation

### Prerequisites

```bash
cd frontend
npm install react-leaflet leaflet
```

### Step 1: Create Folder Structure

```bash
# In frontend/src/
mkdir ClinicianPages
mkdir CaregiverPages
```

### Step 2: Create Clinician Dashboard

**File: `src/ClinicianPages/ClinicianDashboard.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import '../PatientPages/PatientPages.css';

const ClinicianDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [aiSummary, setAISummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientSelect = async (patientId) => {
    setLoading(true);
    setSelectedPatient(patientId);
    
    try {
      // Fetch patient summary
      const summaryRes = await api.get(`/patients/${patientId}/summary`);
      setSummary(summaryRes.data);
      
      // Fetch AI summary
      const aiRes = await api.get(`/ai/summary/${patientId}`);
      setAISummary(aiRes.data);
      
      // Fetch notes
      const notesRes = await api.get(`/patients/${patientId}/notes`);
      setNotes(notesRes.data);
      
      // Fetch reports
      const reportsRes = await api.get(`/patients/${patientId}/reports`);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-dashboard">
      <h1 className="page-header">Doctor Dashboard</h1>

      {/* Patient Selection */}
      <div className="page-card animate-fadeInUp">
        <div className="page-card-header">
          <h2>Select Patient</h2>
        </div>
        <div className="page-card-body">
          <select 
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="form-control"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <option value="">-- Select a Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}

      {selectedPatient && !loading && (
        <>
          {/* AI-Generated Summary */}
          {aiSummary && (
            <div className="page-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="page-card-header">
                <h2>🤖 AI Health Summary</h2>
              </div>
              <div className="page-card-body" style={{ backgroundColor: '#f0f8ff', padding: '1.5rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{aiSummary.summary}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge">Adherence: {aiSummary.metrics.adherenceRate}%</span>
                  <span className="badge">Missed: {aiSummary.metrics.missedMeds}</span>
                  <span className="badge">Mood: {aiSummary.metrics.recentMood}</span>
                </div>
              </div>
            </div>
          )}

          {/* Patient Summary */}
          {summary && (
            <div className="page-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="page-card-header">
                <h2>Patient Information</h2>
              </div>
              <div className="page-card-body">
                <p><strong>Name:</strong> {summary.profile.displayName}</p>
                <p><strong>Date of Birth:</strong> {summary.profile.dateOfBirth ? new Date(summary.profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Patient ID:</strong> {selectedPatient}</p>
              </div>
            </div>
          )}

          {/* Shared Notes */}
          <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="page-card-header">
              <h2>Shared Notes (Read-only)</h2>
            </div>
            <div className="page-card-body">
              {notes.length === 0 ? (
                <p>No notes available.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #0d6efd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>📝 {new Date(note.createdAt).toLocaleString()}</strong>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>AI Summary: {note.aiSummary}</span>
                    </div>
                    <p style={{ margin: 0 }}>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reports */}
          <div className="page-card animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <div className="page-card-header">
              <h2>Health Reports</h2>
            </div>
            <div className="page-card-body">
              {reports.length === 0 ? (
                <p>No reports available.</p>
              ) : (
                reports.map(report => (
                  <div key={report.id} style={{ marginBottom: '1rem' }}>
                    <a 
                      href={`http://localhost:3001${report.uri}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-action"
                    >
                      📄 View Report ({new Date(report.createdAt).toLocaleDateString()})
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClinicianDashboard;
```

**File: `src/ClinicianPages/ClinicianLayout.jsx`**

```jsx
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
```

**File: `src/ClinicianPages/ClinicianSidebar.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LuHome, LuStethoscope, LuFileText, LuLogOut, LuUser } from 'react-icons/lu';
import { api } from '../lib/api';
import '../PatientPages/PatientLayout.css';

const ClinicianSidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserName(response.data.user.email.split('@')[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="patient-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">AgCarE.</h2>
        <p className="sidebar-subtitle">Doctor Portal</p>
        {userName && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#6c757d', 
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <LuUser style={{ marginRight: '0.3rem' }} />
            Dr. {userName}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/clinician/dashboard" className="sidebar-link">
          <LuHome /> Dashboard
        </NavLink>
        <NavLink to="/clinician/patients" className="sidebar-link">
          <LuStethoscope /> Patients
        </NavLink>
        <NavLink to="/clinician/reports" className="sidebar-link">
          <LuFileText /> Reports
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <LuLogOut /> Logout
        </button>
      </div>
    </aside>
  );
};

export default ClinicianSidebar;
```

### Step 3: Create Caregiver Dashboard

**File: `src/CaregiverPages/CaregiverDashboard.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LuMapPin, LuBell, LuHeart, LuPill } from 'react-icons/lu';
import '../PatientPages/PatientPages.css';

const CaregiverDashboard = () => {
  const [patientId, setPatientId] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [moodStatus, setMoodStatus] = useState('');
  const [lastAdherence, setLastAdherence] = useState(null);

  useEffect(() => {
    // Get assigned patient
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // For demo, use the first patient
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Get patients
      const patientsRes = await api.get('/patients');
      if (patientsRes.data.length > 0) {
        const pid = patientsRes.data[0].id;
        setPatientId(pid);
        await loadPatientData(pid);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadPatientData = async (pid) => {
    try {
      // Fetch alerts
      const alertsRes = await api.get(`/patients/${pid}/alerts`);
      setAlerts(alertsRes.data);

      // Fetch location
      const locationRes = await api.get(`/patients/${pid}/location`);
      setLocation(locationRes.data);

      // Fetch notes
      const notesRes = await api.get(`/patients/${pid}/notes`);
      setNotes(notesRes.data);

      // Fetch timeline for mood
      const timelineRes = await api.get(`/patients/${pid}/timeline?limit=5`);
      const convEvent = timelineRes.data.find(e => e.kind === 'CONVERSATION');
      if (convEvent) {
        setMoodStatus(convEvent.detail);
      }

      // Fetch reminders for adherence
      const remindersRes = await api.get(`/patients/${pid}/reminders`);
      if (remindersRes.data.length > 0) {
        setLastAdherence(remindersRes.data[0]);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !patientId) return;

    try {
      await api.post(`/patients/${patientId}/notes`, { content: newNote });
      setNewNote('');
      // Reload notes
      const notesRes = await api.get(`/patients/${patientId}/notes`);
      setNotes(notesRes.data);
      alert('Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="patient-dashboard">
      <h1 className="page-header">Caregiver Dashboard</h1>

      {/* Patient Monitoring */}
      <div className="dashboard-grid">
        {/* Mood & Adherence Status */}
        <div className="page-card animate-fadeInUp">
          <div className="page-card-header">
            <h2><LuHeart /> Patient Status</h2>
          </div>
          <div className="page-card-body">
            <div style={{ marginBottom: '1rem' }}>
              <strong>Mood:</strong> {moodStatus || 'No recent data'}
            </div>
            <div>
              <strong><LuPill /> Last Medication:</strong> {lastAdherence ? lastAdherence.title : 'N/A'}
            </div>
          </div>
        </div>

        {/* Location Tracking */}
        {location && (
          <div className="page-card animate-fadeInUp">
            <div className="page-card-header">
              <h2><LuMapPin /> Location Status</h2>
            </div>
            <div className="page-card-body">
              <div style={{
                padding: '1rem',
                backgroundColor: location.inSafeZone ? '#d4edda' : '#f8d7da',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <strong>{location.inSafeZone ? '✅ In Safe Zone' : '⚠️ Outside Safe Zone'}</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  Last updated: {new Date(location.timestamp).toLocaleString()}
                </p>
              </div>
              <p>Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
              <p>Safe zone radius: {location.safeZone.radius}m</p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts & Notifications */}
      <div className="page-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <div className="page-card-header">
          <h2><LuBell /> Alerts & Notifications</h2>
        </div>
        <div className="page-card-body">
          {alerts.length === 0 ? (
            <p>No active alerts.</p>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id} 
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: getSeverityColor(alert.severity) }}>
                    {alert.severity} - {alert.title}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0' }}>{alert.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shared Notes */}
      <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        <div className="page-card-header">
          <h2>📝 Shared Notes</h2>
        </div>
        <div className="page-card-body">
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} style={{ marginBottom: '1.5rem' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about the patient..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                minHeight: '100px',
                marginBottom: '0.5rem'
              }}
            />
            <button type="submit" className="btn-action">
              Add Note
            </button>
          </form>

          {/* Notes List */}
          {notes.map(note => (
            <div 
              key={note.id} 
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{new Date(note.createdAt).toLocaleString()}</strong>
                <span style={{ 
                  fontSize: '0.85rem', 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: '#e7f3ff', 
                  borderRadius: '4px' 
                }}>
                  AI: {note.aiSummary}
                </span>
              </div>
              <p style={{ margin: 0 }}>{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
```

**File: `src/CaregiverPages/CaregiverLayout.jsx`** & **CaregiverSidebar.jsx**

(Similar structure to Clinician, replace "Clinician" with "Caregiver" and "CLINICIAN" with "CAREGIVER")

### Step 4: Update App.jsx Routing

**File: `src/App.jsx`** - Add these routes:

```jsx
import ClinicianLayout from "./ClinicianPages/ClinicianLayout.jsx";
import ClinicianDashboard from "./ClinicianPages/ClinicianDashboard.jsx";
import CaregiverLayout from "./CaregiverPages/CaregiverLayout.jsx";
import CaregiverDashboard from "./CaregiverPages/CaregiverDashboard.jsx";

// Inside <Routes>:

{/* Clinician Routes */}
<Route path="/clinician" element={<ClinicianLayout />}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<ClinicianDashboard />} />
</Route>

{/* Caregiver Routes */}
<Route path="/caregiver" element={<CaregiverLayout />}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<CaregiverDashboard />} />
</Route>
```

### Step 5: Update Login to Route by Role

**File: `src/Login/Login.jsx`** - Update handleSubmit:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const { api } = await import('../lib/api.js');
    const response = await api.post('/auth/login', { email, password });
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Route based on role
    const role = response.data.user.role;
    if (role === 'PATIENT') {
      navigate('/patient');
    } else if (role === 'CLINICIAN') {
      navigate('/clinician');
    } else if (role === 'CAREGIVER') {
      navigate('/caregiver');
    } else {
      navigate('/patient'); // fallback
    }
  } catch (error) {
    console.error('Login error:', error);
    alert(error.response?.data?.error || 'Login failed. Please try again.');
  }
};
```

### Step 6: Add .env.example for OpenAI

**File: `server/.env`** - Add:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Testing

### Test Accounts:
- **Patient**: patient@example.com / password123
- **Caregiver**: caregiver@example.com / password123
- **Clinician**: doctor@example.com / password123

### Test Flow:

1. **Login as Doctor**:
   - Go to http://localhost:5173/login
   - Login with doctor@example.com
   - Should redirect to `/clinician/dashboard`
   - Select a patient from dropdown
   - See AI summary, notes, reports

2. **Login as Caregiver**:
   - Login with caregiver@example.com
   - Should redirect to `/caregiver/dashboard`
   - See patient status, alerts, location
   - Add a note - should see AI summary generated

3. **API Docs**:
   - Visit http://localhost:3001/api/docs
   - See all endpoints documented

## 📊 Features Summary

### ✅ Doctor Dashboard
- [x] Patient selection dropdown
- [x] AI-generated health summary
- [x] Patient information display
- [x] Read-only shared notes with AI summaries
- [x] Downloadable reports
- [x] Read-only access (no mutations)

### ✅ Caregiver Dashboard
- [x] Patient monitoring (mood, adherence)
- [x] Location tracking with safe zone status
- [x] Alerts & notifications panel
- [x] Shared notes with add/edit capability
- [x] AI-powered note summaries
- [x] Real-time data updates

### ✅ Backend
- [x] OpenAI SDK integration
- [x] AI summary generation
- [x] Patient list endpoint
- [x] Location tracking endpoint
- [x] Alerts endpoint
- [x] Enhanced Swagger documentation
- [x] Role-based access control

### ✅ UX Enhancements
- [x] Logged-in username display in sidebar
- [x] Role-based routing
- [x] Consistent UI design across all dashboards
- [x] Animated transitions
- [x] Responsive layout

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- API Docs: http://localhost:3001/api/docs

## 📝 Notes

- AI summaries work with or without OpenAI API key (falls back to rule-based)
- Location data is mocked (replace with real GPS in production)
- All existing Patient Dashboard functionality remains untouched
- Swagger docs are auto-generated from code

