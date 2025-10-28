import React, { useState, useEffect } from 'react';
import './PatientPages.css';
import {
    LuRefreshCcw,
    LuPill, LuCalendarDays, LuSmile, LuHeart,
    LuCheck, LuMeh, LuFrown, LuSiren, LuWifiOff,
    LuInbox
} from 'react-icons/lu';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- 模拟数据 (为筛选器准备) ---
const dayData = [
    { id: 1, time: '09:00 AM', title: 'Medication: Metformin', status: 'Completed', details: 'Took 1 pill (500mg) with breakfast.', icon: <LuPill />, colorClass: 'status-completed' },
    { id: 2, time: '10:30 AM', title: 'Appointment: Dr. Smith', status: 'Upcoming', details: 'Annual check-up at City Clinic.', icon: <LuCalendarDays />, colorClass: 'status-upcoming' },
    { id: 3, time: '01:00 PM', title: 'Medication: Lisinopril', status: 'Upcoming', details: 'Take 1 pill (10mg) after lunch.', icon: <LuPill />, colorClass: 'status-upcoming' },
    { id: 4, time: '08:00 AM', title: 'Medication: Aspirin (Yesterday)', status: 'Missed', details: 'Forgot to take morning dose.', icon: <LuPill />, colorClass: 'status-missed' },
    { id: 5, time: '11:00 AM', title: 'Chat Session', status: 'Completed', details: 'Completed a 15-minute session with AI companion.', icon: <LuSmile />, colorClass: 'status-completed' },
];

const weekData = [
    { id: 6, time: 'Mon, 09:00 AM', title: 'Weekly Pill Refill', status: 'Completed', details: 'Sorted pills for the week.', icon: <LuPill />, colorClass: 'status-completed' },
    { id: 7, time: 'Wed, 02:00 PM', title: 'Physiotherapy', status: 'Upcoming', details: 'Appointment at Physio Center.', icon: <LuCalendarDays />, colorClass: 'status-upcoming' },
    { id: 8, time: 'Fri, 08:00 AM', title: 'Blood Pressure Check', status: 'Completed', details: 'Reading: 125/80 mmHg.', icon: <LuHeart />, colorClass: 'status-completed' },
];

const monthData = [
    { id: 9, time: 'Oct 05, 10:00 AM', title: 'Lab Test: Bloodwork', status: 'Completed', details: 'Results available in portal.', icon: <LuHeart />, colorClass: 'status-completed' },
    { id: 10, time: 'Oct 15, 03:00 PM', title: 'Chat: Follow-up', status: 'Completed', details: 'Discussed mood with AI.', icon: <LuSmile />, colorClass: 'status-completed' },
    { id: 11, time: 'Oct 28, 11:00 AM', title: 'Specialist: Dr. Jane', status: 'Upcoming', details: 'Cardiology consultation.', icon: <LuCalendarDays />, colorClass: 'status-upcoming' },
];


/**
 * 患者仪表盘 (UC-01, UC-03, UC-08, UC-10)
 * ... (comments) ...
 * * Ensure title style matches Reminders page via CSS
 */
const PatientDashboard = () => {
    const [filter, setFilter] = useState('Day');
    const [expandedId, setExpandedId] = useState(null);
    const [mood, setMood] = useState(null); // UC-08
    const [isLoading, setIsLoading] = useState(false); // UI enhancement
    const [isOffline, setIsOffline] = useState(!navigator.onLine); // UC-01

    // --- State for data ---
    const [timelineData, setTimelineData] = useState(dayData);

    const reminderData = [
        { id: 1, title: 'Appt: Dr. Smith', time: '10:30 AM', icon: <LuCalendarDays />, iconClass: 'appt' },
        { id: 2, title: 'Med: Lisinopril', time: '01:00 PM', icon: <LuPill />, iconClass: 'reminder' },
    ];

    const sosHistory = [
        { id: 1, time: 'Oct 24, 02:15 PM', status: 'Resolved', icon: <LuCheck /> },
        { id: 2, time: 'Oct 22, 08:00 AM', status: 'Resolved', icon: <LuCheck /> },
    ];

    // Chart data (UC-01 visualization)
    const chartData = {
        labels: ['Taken', 'Missed', 'Upcoming'],
        datasets: [
            {
                label: 'Adherence',
                data: [12, 2, 5], // Mock data
                backgroundColor: [
                    'rgba(25, 135, 84, 0.8)', // Green
                    'rgba(231, 76, 60, 0.8)',  // Red
                    'rgba(13, 110, 253, 0.8)', // Blue
                ],
                borderColor: [
                    '#198754',
                    '#e74c3c',
                    '#0d6efd',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: false,
            },
        },
    };

    // UC-01: Offline detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // UC-01 Filter logic
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            switch (filter) {
                case 'Day':
                    setTimelineData(dayData);
                    break;
                case 'Week':
                    setTimelineData(weekData);
                    break;
                case 'Month':
                    setTimelineData(monthData);
                    break;
                default:
                    setTimelineData(dayData);
            }
            setExpandedId(null);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);

    }, [filter]);

    const handleCardClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // UI Enhancement: Refresh data simulation
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            let currentData;
            switch (filter) {
                case 'Day': currentData = dayData; break;
                case 'Week': currentData = weekData; break;
                case 'Month': currentData = monthData; break;
                default: currentData = dayData;
            }
            setTimelineData([...currentData]);
            setIsLoading(false);
        }, 1500);
    };

    // UI Enhancement: Skeleton Loader Component
    const TimelineSkeleton = () => (
        <div className="timeline-item skeleton-loader">
            <div className="timeline-icon skeleton-avatar"></div>
            <div className="timeline-content">
                <div className="skeleton-line" style={{ width: '60%' }}></div>
                <div className="skeleton-line" style={{ width: '30%' }}></div>
            </div>
        </div>
    );

    return (
        <div className="patient-dashboard">
            {/* UC-01 Offline Banner */}
            {isOffline && (
                <div className="offline-banner large-banner animate-fadeInUp">
                    <LuWifiOff /> You are viewing cached data (offline mode).
                </div>
            )}

            {/* --- Page Header: h1 title and filter buttons --- */}
            <div className="page-header">
                 {/* +++ 添加了 className="dashboard-title" +++ */}
                <h1 className="dashboard-title">My Dashboard</h1>
                {/* UC-01 Filter Panel */}
                <div className="filter-panel">
                    <button className={`filter-btn ${filter === 'Day' ? 'active' : ''}`} onClick={() => setFilter('Day')}>Day</button>
                    <button className={`filter-btn ${filter === 'Week' ? 'active' : ''}`} onClick={() => setFilter('Week')}>Week</button>
                    <button className={`filter-btn ${filter === 'Month' ? 'active' : ''}`} onClick={() => setFilter('Month')}>Month</button>
                    <button className="filter-btn" title="Refresh Data" onClick={handleRefresh} disabled={isLoading}>
                        {isLoading ? <LuRefreshCcw size={16} className="spin" /> : <LuRefreshCcw size={16} />}
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* --- Main Content (Timeline UC-01) --- */}
                <div className="page-card dashboard-card-large animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="page-card-header">
                        <h2>My Health Timeline</h2>
                    </div>
                    <div className="page-card-body health-timeline">
                        {isLoading ? (
                            <>
                                <TimelineSkeleton />
                                <TimelineSkeleton />
                                <TimelineSkeleton />
                            </>
                        ) : timelineData.length === 0 ? (
                            <div className="empty-state">
                                <LuInbox size={50} />
                                <h3>No Activities Found</h3>
                                <p>There are no activities matching your current filter.</p>
                            </div>
                        ) : (
                            timelineData.map((item) => (
                                <div key={item.id} className="timeline-item">
                                    <div className={`timeline-icon ${item.colorClass}`}>
                                        {item.icon}
                                    </div>
                                    <div className="timeline-content" onClick={() => handleCardClick(item.id)} style={{ cursor: 'pointer' }}>
                                        <div className="timeline-content-header">
                                            <span className="timeline-title">{item.title}</span>
                                            <span className={`timeline-status ${item.colorClass}`}>{item.status}</span>
                                        </div>
                                        <span className="timeline-time">{item.time}</span>
                                        {expandedId === item.id && (
                                            <div className="timeline-details animate-fadeInUp">
                                                <p>{item.details}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- Visualization Chart (UC-01) --- */}
                <div className="page-card dashboard-card-small animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="page-card-header">
                        <h3>Weekly Adherence</h3>
                    </div>
                    <div className="page-card-body" style={{ position: 'relative', height: '350px' }}>
                        {isLoading ? (
                            <div className="skeleton-loader" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LuRefreshCcw size={40} className="spin" />
                            </div>
                        ) : (
                            <Doughnut data={chartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {/* --- Widget Grid (UC-08, UC-10, UC-03) --- */}
                <div className="dashboard-widget-grid" style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>

                    {/* Mood Widget (UC-08) */}
                    <div className="page-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <div className="page-card-header">
                            <h3>How are you feeling?</h3>
                        </div>
                        <div className="page-card-body mood-widget-body">
                            <span className={`mood-selector ${mood === 'Happy' ? 'selected' : ''}`} title="Happy" onClick={() => setMood('Happy')}><LuSmile /></span>
                            <span className={`mood-selector ${mood === 'Neutral' ? 'selected' : ''}`} title="Neutral" onClick={() => setMood('Neutral')}><LuMeh /></span>
                            <span className={`mood-selector ${mood === 'Sad' ? 'selected' : ''}`} title="Sad" onClick={() => setMood('Sad')}><LuFrown /></span>
                            <span className={`mood-selector ${mood === 'Loved' ? 'selected' : ''}`} title="Loved" onClick={() => setMood('Loved')}><LuHeart /></span>
                        </div>
                    </div>

                    {/* SOS History (UC-10) */}
                    <div className="page-card animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="page-card-header">
                            <h3>Recent SOS Events</h3>
                        </div>
                        <div className="page-card-body">
                            <ul className="widget-list">
                                {sosHistory.map(item => (
                                    <li key={item.id} className="widget-list-item">
                                        <span className="widget-list-item-icon sos"><LuSiren /></span>
                                        <div className="widget-list-item-info">
                                            <span>SOS Alert</span>
                                            <small>{item.time}</small>
                                        </div>
                                        <span className="widget-list-item-status">{item.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Reminder Widget (UC-03) */}
                    <div className="page-card animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                        <div className="page-card-header">
                            <h3>Upcoming Reminders</h3>
                        </div>
                        <div className="page-card-body">
                            <ul className="widget-list">
                                {reminderData.map(item => (
                                    <li key={item.id} className="widget-list-item">
                                        <span className={`widget-list-item-icon ${item.iconClass}`}>{item.icon}</span>
                                        <div className="widget-list-item-info">
                                            <span>{item.title}</span>
                                            <small>{item.time}</small>
                                        </div>
                                        <span className="widget-list-item-status">Upcoming</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

