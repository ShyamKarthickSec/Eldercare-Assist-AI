import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { api } from '../lib/api';
import { LuMapPin, LuBell, LuHeart, LuUser } from 'react-icons/lu';
import '../PatientPages/PatientPages.css';

const CaregiverDashboard = () => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [moodStatus, setMoodStatus] = useState('');
  const [lastAdherence, setLastAdherence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Poll for mood updates every 10 seconds
  useEffect(() => {
    if (!patientId) return;

    console.log('🔄 Starting mood polling for patient:', patientId);

    const moodPollInterval = setInterval(async () => {
      try {
        const { api } = await import('../lib/api.js');
        const timelineRes = await api.get(`/patients/${patientId}/timeline?limit=10`); // Increased limit
        
        console.log('📡 Polling timeline, found events:', timelineRes.data.length);
        
        const convEvent = timelineRes.data.find(e => 
          e.kind === 'CONVERSATION' && 
          e.title && 
          e.title.includes('Mood Update')
        );
        
        if (convEvent) {
          const moodMatch = convEvent.title.match(/Mood Update - (\w+)/);
          if (moodMatch) {
            const newMood = `${moodMatch[1]} - ${convEvent.detail}`;
            if (newMood !== moodStatus) {
              setMoodStatus(newMood);
              console.log('✅ Mood updated via polling:', newMood);
            } else {
              console.log('ℹ️ Mood unchanged:', newMood);
            }
          }
        } else {
          console.log('⚠️ No mood update found in timeline during poll');
        }
      } catch (error) {
        console.error('❌ Error polling mood:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      console.log('🛑 Stopping mood polling');
      clearInterval(moodPollInterval);
    };
  }, [patientId]); // Removed moodStatus dependency to avoid resetting interval

  // Poll for alert updates every 10 seconds
  useEffect(() => {
    if (!patientId) return;

    const alertPollInterval = setInterval(async () => {
      try {
        const { api } = await import('../lib/api.js');
        const alertsRes = await api.get(`/patients/${patientId}/alerts`);
        
        if (JSON.stringify(alertsRes.data) !== JSON.stringify(alerts)) {
          setAlerts(alertsRes.data);
          console.log('✅ Alerts updated:', alertsRes.data.length, 'total alerts');
        }
      } catch (error) {
        console.error('Error polling alerts:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(alertPollInterval);
  }, [patientId, alerts]);

  const fetchInitialData = async () => {
    try {
      const patientsRes = await api.get('/patients');
      if (patientsRes.data.length > 0) {
        const patient = patientsRes.data[0];
        setPatientId(patient.id);
        setPatientName(patient.name);
        await loadPatientData(patient.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (pid) => {
    try {
      const [alertsRes, locationRes, notesRes, timelineRes, remindersRes] = await Promise.all([
        api.get(`/patients/${pid}/alerts`),
        api.get(`/patients/${pid}/location`),
        api.get(`/patients/${pid}/notes`),
        api.get(`/patients/${pid}/timeline?limit=5`),
        api.get(`/patients/${pid}/reminders`)
      ]);

      setAlerts(alertsRes.data);
      setLocation(locationRes.data);
      setNotes(notesRes.data);

      // Look specifically for Mood Update events
      const convEvent = timelineRes.data.find(e => 
        e.kind === 'CONVERSATION' && 
        e.title && 
        e.title.includes('Mood Update')
      );
      
      if (convEvent) {
        const moodMatch = convEvent.title.match(/Mood Update - (\w+)/);
        if (moodMatch) {
          setMoodStatus(`${moodMatch[1]} - ${convEvent.detail}`);
          console.log('✅ Initial mood loaded:', moodMatch[1]);
        } else {
          setMoodStatus(convEvent.detail);
        }
      } else {
        setMoodStatus('No recent mood data');
        console.log('⚠️ No mood update found in timeline');
      }

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
      const notesRes = await api.get(`/patients/${patientId}/notes`);
      setNotes(notesRes.data);
      alert('✅ Note added successfully with AI summary!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('❌ Failed to add note');
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

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner">Loading caregiver dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div id="overview">
        <h1 className="page-header">Caregiver Dashboard</h1>
        {patientName && (
          <div style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <LuUser size={20} />
            <span><strong>Monitoring Patient:</strong> {patientName}</span>
          </div>
        )}
      </div>

      {/* Vertical Stacked Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div id="patient-status" className="page-card animate-fadeInUp">
          <div className="page-card-header">
            <h2><LuHeart /> Patient Status</h2>
          </div>
          <div className="page-card-body">
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f0f8ff', borderRadius: '6px', border: '1px solid #b8daff' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Recent Mood</div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: moodStatus.includes('Happy') ? '#28a745' : 
                       moodStatus.includes('Sad') ? '#dc3545' : 
                       moodStatus.includes('Loved') ? '#e83e8c' : '#0d6efd'
              }}>
                {moodStatus.includes('Happy') && '😊 '}
                {moodStatus.includes('Sad') && '😢 '}
                {moodStatus.includes('Neutral') && '😐 '}
                {moodStatus.includes('Loved') && '❤️ '}
                {moodStatus}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem', fontStyle: 'italic' }}>
                🔄 Auto-updates every 10 seconds
              </div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                💊 Last Medication
              </div>
              <strong>{lastAdherence ? lastAdherence.title : 'No data available'}</strong>
            </div>
          </div>
        </div>

        {/* Location Tracking with Map */}
        {location && (
          <div id="location-status" className="page-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="page-card-header">
              <h2><LuMapPin /> Location Status</h2>
            </div>
            <div className="page-card-body">
              <div style={{
                padding: '1rem',
                backgroundColor: location.inSafeZone ? '#d4edda' : '#f8d7da',
                color: location.inSafeZone ? '#155724' : '#721c24',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: '500'
              }}>
                {location.inSafeZone ? '✅ Patient is in Safe Zone' : '⚠️ Patient is Outside Safe Zone'}
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  Last updated: {new Date(location.timestamp).toLocaleString()}
                </p>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0' }}>📍 Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                <p style={{ margin: '0.5rem 0' }}>🛡️ Safe zone radius: {location.safeZone.radius}m</p>
              </div>

              {/* Map Preview */}
              {typeof location.latitude === 'number' && typeof location.longitude === 'number' ? (
                <div style={{ 
                  marginTop: '1rem', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid #dee2e6',
                  height: '300px'
                }}>
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={[location.latitude, location.longitude]} />
                    {location.safeZone?.radius && (
                      <Circle
                        center={[location.latitude, location.longitude]}
                        radius={location.safeZone.radius}
                        pathOptions={{ color: '#28a745', fillColor: '#28a745', fillOpacity: 0.1 }}
                      />
                    )}
                  </MapContainer>
                </div>
              ) : (
                <div style={{
                  marginTop: '1rem',
                  height: '220px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d',
                  fontSize: '0.9rem'
                }}>
                  Location unavailable
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alerts & Notifications */}
      <div id="alerts" className="page-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <div className="page-card-header">
          <h2><LuBell /> Alerts & Notifications</h2>
          {alerts.length > 0 && (
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>
              {alerts.length}
            </span>
          )}
        </div>
        <div className="page-card-body">
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>✓</div>
              <p>No active alerts. All clear! 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  style={{
                    padding: '1rem',
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                    backgroundColor: alert.type === 'SOS' ? '#ffebee' : '#f9f9f9',
                    borderRadius: '4px',
                    animation: alert.type === 'SOS' ? 'pulse 2s infinite' : 'none',
                    boxShadow: alert.type === 'SOS' ? '0 2px 8px rgba(220, 53, 69, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                    <strong style={{ 
                      color: getSeverityColor(alert.severity), 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: alert.type === 'SOS' ? '1.05rem' : '1rem',
                      fontWeight: alert.type === 'SOS' ? 'bold' : '600'
                    }}>
                      <span>{alert.type === 'SOS' ? '🚨' : getSeverityIcon(alert.severity)}</span>
                      <span>{alert.title}</span>
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>{alert.description}</p>
                  {alert.type === 'SOS' && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.5rem', 
                      backgroundColor: '#fff', 
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#721c24',
                      fontWeight: '500'
                    }}>
                      ⚠️ Emergency - Immediate attention required
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Notes */}
      <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        <div className="page-card-header">
          <h2>📝 Shared Notes</h2>
        </div>
        <div className="page-card-body">
          <form onSubmit={handleAddNote} style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Add New Note
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about the patient... (AI will generate a summary automatically)"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                minHeight: '100px',
                marginBottom: '0.75rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <button type="submit" className="btn-action" disabled={!newNote.trim()}>
              💾 Add Note (with AI Summary)
            </button>
          </form>

          <div style={{ borderTop: '2px solid #e9ecef', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Previous Notes</h3>
            {notes.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>No notes yet. Add the first one!</p>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id} 
                  style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <strong style={{ color: '#0d6efd' }}>
                      📅 {new Date(note.createdAt).toLocaleString()}
                    </strong>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: '#e7f3ff', 
                      borderRadius: '12px',
                      border: '1px solid #b8daff'
                    }}>
                      🤖 AI: {note.aiSummary}
                    </span>
                  </div>
                  <p style={{ margin: 0, lineHeight: '1.6', color: '#333' }}>{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;

