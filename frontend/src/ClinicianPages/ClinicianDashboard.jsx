import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import '../PatientPages/PatientPages.css';
import { LuFileText, LuUser } from 'react-icons/lu';

const ClinicianDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [aiSummary, setAISummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!patientId) return;
    setLoading(true);
    setSelectedPatient(patientId);
    
    try {
      const [summaryRes, aiRes, notesRes, reportsRes] = await Promise.all([
        api.get(`/patients/${patientId}/summary`),
        api.get(`/ai/summary/${patientId}`),
        api.get(`/patients/${patientId}/notes`),
        api.get(`/patients/${patientId}/reports`)
      ]);
      
      setSummary(summaryRes.data);
      setAISummary(aiRes.data);
      setNotes(notesRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-dashboard" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div id="overview" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Doctor Dashboard
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#64748b',
          fontWeight: '500',
          marginBottom: '2rem'
        }}>
          Clinical oversight and patient health management
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="page-card animate-fadeInUp">
          <div className="page-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <LuUser /> Select Patient
            </h2>
          </div>
          <div className="page-card-body">
          <select 
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="form-control"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '2px solid #10b981', 
              fontSize: '1rem',
              backgroundColor: '#f0fdf4',
              transition: 'all 0.3s ease'
            }}
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

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner">Loading patient data...</div>
        </div>
      )}

      {selectedPatient && !loading && (
        <>
          {aiSummary && (
            <div id="patient-info" className="page-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="page-card-header">
                <h2>🤖 AI Health Summary</h2>
              </div>
              <div className="page-card-body" style={{ backgroundColor: '#f0f8ff', padding: '1.5rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1rem' }}>{aiSummary.summary}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{padding: '0.5rem 1rem', backgroundColor: '#d4edda', borderRadius: '20px', fontSize: '0.9rem'}}>
                    📊 Adherence: {aiSummary.metrics.adherenceRate}%
                  </span>
                  <span style={{padding: '0.5rem 1rem', backgroundColor: '#fff3cd', borderRadius: '20px', fontSize: '0.9rem'}}>
                    ⚠️ Missed: {aiSummary.metrics.missedMeds}
                  </span>
                  <span style={{padding: '0.5rem 1rem', backgroundColor: '#d1ecf1', borderRadius: '20px', fontSize: '0.9rem'}}>
                    😊 Mood: {aiSummary.metrics.recentMood}
                  </span>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <>
              <div className="page-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                <div className="page-card-header">
                  <h2>Patient Information</h2>
                </div>
                <div className="page-card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div><strong>Name:</strong> {summary.profile.displayName}</div>
                    <div><strong>Date of Birth:</strong> {summary.profile.dateOfBirth ? new Date(summary.profile.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Patient ID:</strong> {selectedPatient.substring(0, 8)}...</div>
                  </div>
                </div>
              </div>

              {/* FHIR Medical History Section */}
              <div id="medical-history" className="page-card animate-fadeInUp" style={{animationDelay: '0.25s'}}>
                <div className="page-card-header">
                  <h2>🏥 Medical History (FHIR)</h2>
                </div>
                <div className="page-card-body">
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0d6efd' }}>Prescriptions</h3>
                  <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Medication</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dosage</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '0.75rem' }}>💊 Amlodipine</td>
                          <td style={{ padding: '0.75rem' }}>5mg</td>
                          <td style={{ padding: '0.75rem' }}>Once daily</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '0.75rem' }}>💊 Metformin</td>
                          <td style={{ padding: '0.75rem' }}>500mg</td>
                          <td style={{ padding: '0.75rem' }}>Twice daily</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0d6efd' }}>Diagnoses</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ⚕️ Mild Hypertension - Diagnosed 15 days ago
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
                      ⚕️ Type II Diabetes (Managed) - Under control
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0d6efd' }}>Recent Observations</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Blood Pressure</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>120/80 mmHg</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Glucose</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>90 mg/dL</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Cholesterol</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>180 mg/dL</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="page-card-header">
              <h2>📝 Shared Notes (Read-only)</h2>
            </div>
            <div className="page-card-body">
              {notes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No notes available.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #0d6efd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <strong>📅 {new Date(note.createdAt).toLocaleString()}</strong>
                      <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', backgroundColor: '#e7f3ff', borderRadius: '12px' }}>
                        AI: {note.aiSummary}
                      </span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="reports" className="page-card animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <div className="page-card-header">
              <h2><LuFileText /> Health Reports</h2>
            </div>
            <div className="page-card-body">
              {reports.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No reports available.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {reports.map(report => (
                    <a 
                      key={report.id}
                      href={`http://localhost:3001${report.uri}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-action"
                      style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                      📄 View Report - {new Date(report.createdAt).toLocaleDateString()}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default ClinicianDashboard;

