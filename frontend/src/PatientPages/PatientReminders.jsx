import React, { useState, useEffect, useRef } from 'react';
import './PatientPages.css';
import { 
  LuPill, LuCalendarDays, LuCheck, LuX, LuBellRing, LuHistory, 
  LuMapPin, LuRefreshCw, LuCalendarPlus, LuSunrise, LuSun, LuMoon,
  LuCircleCheck 
} from 'react-icons/lu';
import PatientHistory from './PatientHistory'; 

/**
 * 提醒页面 (UC-03)
 * ...
 * 修复: 移除导致语法错误的 JSX 注释
 */
const PatientReminders = () => {
  
  // 模拟状态 (保持不变)
  const [meds, setMeds] = React.useState([ // Use React.useState for clarity
    { id: 1, name: 'Metformin', details: '500mg, with breakfast', time: '09:00 AM', status: 'Completed', snoozeCount: 0 },
    { id: 2, name: 'Lisinopril', details: '10mg, after lunch', time: '01:00 PM', status: 'Upcoming', snoozeCount: 0 },
    { id: 3, name: 'Aspirin', details: '81mg, morning', time: '08:00 AM', status: 'Missed', snoozeCount: 0 },
    { id: 4, name: 'Vitamin D', details: '1000 IU, with any meal', time: '02:00 PM', status: 'Upcoming', snoozeCount: 1 },
    { id: 5, name: 'Atorvastatin', details: '20mg, before bed', time: '09:00 PM', status: 'Upcoming', snoozeCount: 0 },
  ]);

  const [appointments, setAppointments] = React.useState([
    { id: 1, title: 'Annual Check-up', doctor: 'Dr. Smith', time: 'Oct 28, 2025 at 10:30 AM', status: 'Upcoming', address: '123 Main St, Sydney NSW 2000' }, 
    { id: 2, title: 'Dental Cleaning', doctor: 'Dr. White', time: 'Oct 22, 2025 at 02:00 PM', status: 'Completed', address: '456 Oak Ave, Sydney NSW 2000' },
    { id: 3, title: 'Physio Session', doctor: 'Dr. Allen', time: 'Oct 24, 2025 at 11:00 AM', status: 'Missed', address: '789 Pine Ln, Sydney NSW 2000' }, 
  ]);

  const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
  const [selectedAppt, setSelectedAppt] = React.useState(null);
  const [showHistory, setShowHistory] = React.useState(false);

  // Medication handlers - moved inside for direct state access
  const handleAction = (id, newStatus) => {
      setMeds(prevMeds => prevMeds.map(med => 
        med.id === id ? { ...med, status: newStatus } : med
      ));
  };
  const handleSnooze = (id) => {
      setMeds(prevMeds => prevMeds.map(med => 
        (med.id === id && med.snoozeCount < 3) 
          ? { ...med, snoozeCount: med.snoozeCount + 1, time: '01:10 PM' } // Simulate snooze time update
          : med
      ));
  };
  const openRescheduleModal = (appt) => { 
      setSelectedAppt(appt);
      setShowRescheduleModal(true);
  };
  const getGroupedReminders = (reminders) => {
      const groups = { Morning: [], Afternoon: [], Evening: [] };
      reminders.forEach(med => {
        if (med.status !== 'Upcoming') return;
        const hourString = med.time.split(':')[0];
        const hour = parseInt(hourString);
        if (isNaN(hour)) return; // Skip if hour is not a number

        const isPM = med.time.toUpperCase().includes('PM');
        // Basic time parsing, might need refinement for edge cases like 12 AM/PM
        let realHour = hour;
        if (isPM && hour !== 12) {
            realHour += 12;
        } else if (!isPM && hour === 12) { // Handle 12 AM (midnight)
            realHour = 0;
        }
        
        if (realHour < 12) groups.Morning.push(med);
        else if (realHour < 18) groups.Afternoon.push(med);
        else groups.Evening.push(med);
      });
      return groups;
  };

  const groupedMeds = getGroupedReminders(meds);

  // Define renderMedCard inside component to access handlers directly
  const renderMedCard = (med) => (
      <div key={med.id} className={`reminder-card animate-fadeInUp status-${med.status.toLowerCase()}`}>
        <div className={`reminder-icon-bar status-${med.status.toLowerCase()}`}>
          <LuPill />
        </div>
        <div className="reminder-content">
          <div className="reminder-info">
            <h3>{med.name}</h3>
            <p>{med.details}</p>
            <small>{med.time} {med.status === 'Missed' && '(Missed)'}</small>
          </div>
          <div className="reminder-actions">
            <button 
              className="btn-action" 
              onClick={() => handleAction(med.id, 'Completed')}
              disabled={med.status !== 'Upcoming'}
            >
              <LuCheck size={14} /> Taken
            </button>
            <button 
              className="btn-action-secondary" 
              onClick={() => handleSnooze(med.id)}
              disabled={med.status !== 'Upcoming' || med.snoozeCount >= 3}
            >
              <LuBellRing size={14} /> Snooze
            </button>
            <button 
              className="btn-action-secondary" 
              onClick={() => handleAction(med.id, 'Missed')}
              disabled={med.status !== 'Upcoming'}
            >
              <LuX size={14} /> Skip
            </button>
            {med.snoozeCount > 0 && (
              <span className="snooze-count">Snoozed {med.snoozeCount} time(s)</span>
            )}
          </div>
        </div>
      </div>
  );


  // Navigate Handler
  const handleNavigate = (address) => {
    if (!address) {
      // Use a custom modal/toast in a real app instead of alert
      console.warn('Address not available for this appointment.'); 
      return;
    }
    const encodedAddress = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to format date for ICS
  const formatICSDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  };

  // Sync to Calendar Handler
  const handleSyncCalendar = (appt) => {
    let startDate;
    try {
        // More robust parsing attempt
        const dateTimeString = appt.time.replace(' at ', ' ');
        startDate = new Date(Date.parse(dateTimeString));
        if (isNaN(startDate.getTime())) throw new Error('Invalid Date');
    } catch (e) {
        console.error('Could not parse appointment time for calendar sync:', appt.time, e);
        // Use a custom modal/toast in a real app
        alert('Could not parse appointment time for calendar sync.');
        return;
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); 
    const startICS = formatICSDate(startDate);
    const endICS = formatICSDate(endDate);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AgCareApp//EN
BEGIN:VEVENT
UID:${appt.id}@agcare.example.com 
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${startICS}
DTEND:${endICS}
SUMMARY:${appt.title} with ${appt.doctor}
DESCRIPTION:Appointment reminder for ${appt.title} with ${appt.doctor}. Please confirm details.
LOCATION:${appt.address || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${appt.title.replace(/[^a-zA-Z0-9]/g, '_')}_appointment.ics`; // Sanitize filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); 
  };


  if (showHistory) { 
      return (
          <PatientHistory 
            meds={meds} 
            onBack={() => setShowHistory(false)} 
          />
      );
  }

  return (
    <div className="reminders-page">
      <h1 className="page-header">My Reminders</h1>

      {/* Medication Reminders Card */}
      <div className="page-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
         <div className="page-card-header">
           <h2>Medication Reminders</h2>
           <button className="btn-action-secondary" onClick={() => setShowHistory(true)}>
             <LuHistory size={16} /> View History
           </button>
         </div>
         <div className="page-card-body" style={{ padding: '1.5rem', background: '#f8f9fa' }}>
           
           {/* Render groups only if they have items */}
           {groupedMeds.Morning.length > 0 && ( 
              <div className="reminder-group">
                <h3 className="reminder-group-title"><LuSunrise /> Morning</h3>
                <div className="reminders-grid">{groupedMeds.Morning.map(renderMedCard)}</div>
              </div>
           )}
           {groupedMeds.Afternoon.length > 0 && ( 
              <div className="reminder-group">
                <h3 className="reminder-group-title"><LuSun /> Afternoon</h3>
                <div className="reminders-grid">{groupedMeds.Afternoon.map(renderMedCard)}</div>
              </div>
            )}
           {groupedMeds.Evening.length > 0 && (
             <div className="reminder-group">
                <h3 className="reminder-group-title"><LuMoon /> Evening</h3>
                <div className="reminders-grid">{groupedMeds.Evening.map(renderMedCard)}</div>
              </div>
           )}

           {/* Show All Clear only if ALL groups are empty */}
           {groupedMeds.Morning.length === 0 && groupedMeds.Afternoon.length === 0 && groupedMeds.Evening.length === 0 && ( 
            <div className="empty-state" style={{ padding: '2rem 0', background: '#fff', borderRadius: '8px' }}>
              {/* --- 修复: 移除了有问题的注释 --- */}
              <LuCircleCheck size={40} color="#198754" />
              <h3 style={{marginTop: '1rem'}}>All Clear!</h3>
              <p>You have no upcoming medication reminders for today.</p>
            </div>
          )}

         </div>
      </div>


      {/* Appointment Reminders Card */}
      <div className="page-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        <div className="page-card-header">
          <h2>Appointment Reminders</h2>
        </div>
        <div className="page-card-body" style={{ padding: 0 }}>
          <div className="reminders-grid">
            {appointments.map(app => (
              <div key={app.id} className={`reminder-card status-${app.status.toLowerCase()}`}>
                <div className={`reminder-icon-bar status-${app.status.toLowerCase()}`}>
                  <LuCalendarDays />
                </div>
                <div className="reminder-content">
                  <div className="reminder-info">
                    <h3>{app.title}</h3>
                    <p>{app.doctor}</p>
                    <small>{app.time}</small>
                  </div>
                  <div className="reminder-actions">
                    <button 
                      className="btn-action" 
                      onClick={() => handleNavigate(app.address)} 
                      disabled={app.status !== 'Upcoming'}
                    >
                      <LuMapPin size={14} /> Navigate
                    </button>
                    <button 
                      className="btn-action-secondary" 
                      onClick={() => openRescheduleModal(app)} 
                      disabled={app.status !== 'Upcoming'}
                    >
                      <LuRefreshCw size={14} /> Reschedule
                    </button>
                    <button 
                      className="btn-action-secondary" 
                      onClick={() => handleSyncCalendar(app)}
                      disabled={app.status !== 'Upcoming'}
                    >
                      <LuCalendarPlus size={14} /> Sync to Calendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppt && ( 
          <div className="modal-backdrop">
              <div className="modal-content animate-fadeInUp">
                <h3>Reschedule Appointment?</h3>
                <p>You are requesting to reschedule your appointment for <strong>{selectedAppt.title}</strong> with {selectedAppt.doctor}.</p>
                <p>A confirmation is required. We will contact you to arrange a new time.</p>
                <div className="form-group" style={{textAlign: 'left', marginBottom: '1rem'}}>
                  <label style={{fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block'}}>Preferred New Date (Optional)</label>
                  <input type="date" className="modal-input"/>
                </div>
                <div className="modal-actions">
                  <button className="btn-action-secondary" onClick={() => setShowRescheduleModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-action" onClick={() => {
                    // Replace alert with console log or toast in real app
                    console.log('Reschedule request sent!'); 
                    setShowRescheduleModal(false);
                  }}>
                    Confirm Request
                  </button>
                </div>
              </div>
          </div>
       )}
    </div>
  );
};


export default PatientReminders;

