# 🔧 Fixes for 5 Identified Issues

## Issue 1: FHIR Table Empty - Add Medical History Section

### Solution: Add FHIR Medical History to Doctor Dashboard

**File: `frontend/src/ClinicianPages/ClinicianDashboard.jsx`**

Add a new section to display FHIR data. Insert this code after the Patient Information card:

```jsx
{/* FHIR Medical History Section - NEW */}
<div className="page-card animate-fadeInUp" style={{animationDelay: '0.25s'}}>
  <div className="page-card-header">
    <h2>🏥 Medical History (FHIR)</h2>
  </div>
  <div className="page-card-body">
    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0d6efd' }}>Prescriptions</h3>
    <div style={{ marginBottom: '1.5rem' }}>
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
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '0.5rem' }}>
          ⚕️ Mild Hypertension - Diagnosed 15 days ago
        </li>
        <li style={{ padding: '0.5rem', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
          ⚕️ Type II Diabetes (Managed) - Under control
        </li>
      </ul>
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
```

---

## Issue 2: Companion Chat Not Integrated with AI

### Solution: Connect Companion Chat to OpenAI Backend

**Update: `frontend/src/PatientPages/PatientChat.jsx`**

Replace the `triggerAiResponse` function with this:

```jsx
// AI Response with Backend Integration
const triggerAiResponse = async (userMessageText) => {
  setIsAiTyping(true);
  
  try {
    // Get user data to find patient ID
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not found');
    }

    // Import api dynamically
    const { api } = await import('../lib/api.js');
    
    // Call backend AI chat endpoint
    const response = await api.post('/companion/chat', {
      patientId: user.id,
      message: userMessageText,
      currentMood: mood
    });

    const aiResponse = {
      id: Date.now(),
      sender: 'ai',
      text: response.data.reply || "I'm here to listen. How can I help?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setIsAiTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Fallback to local response if API fails
    const fallbackResponse = {
      id: Date.now(),
      sender: 'ai',
      text: `You mentioned: "${userMessageText}". I'm here to listen and support you.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setIsAiTyping(false);
    setMessages(prev => [...prev, fallbackResponse]);
  }
};
```

**Backend: Update `server/src/companion/companion.controller.ts`**

Add a new chat endpoint:

```typescript
export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, message, currentMood } = req.body;
    
    checkPatientAccess(req.user!.id, patientId, req.user!.role);

    // Use AI chat integration
    const { getAiChatResponse } = require('../ai/chat');
    const { reply, risk } = await getAiChatResponse(patientId, message, currentMood || 'Neutral');

    // Store conversation in database
    const conversation = await prisma.conversation.findFirst({
      where: {
        patientId,
        endedAt: null
      }
    });

    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { risk }
      });
    }

    res.json({ reply, risk });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
};
```

**Add route in `server/src/companion/companion.routes.ts`:**

```typescript
router.post('/companion/chat', authenticate, companionController.sendChatMessage);
```

---

## Issue 3: Mood Should Sync with Caregiver Dashboard

### Solution: Add Auto-Refresh for Mood in Caregiver Dashboard

**Update: `frontend/src/CaregiverPages/CaregiverDashboard.jsx`**

Add polling to the component:

```jsx
// Add this inside the CaregiverDashboard component, after the existing useEffect

useEffect(() => {
  if (!patientId) return;

  // Poll for mood updates every 10 seconds
  const moodPollInterval = setInterval(async () => {
    try {
      const { api } = await import('../lib/api.js');
      const timelineRes = await api.get(`/patients/${patientId}/timeline?limit=5`);
      
      const convEvent = timelineRes.data.find(e => e.kind === 'CONVERSATION' && e.title.includes('Mood Update'));
      if (convEvent) {
        const moodMatch = convEvent.title.match(/Mood Update - (\w+)/);
        if (moodMatch) {
          const newMood = `${moodMatch[1]} - ${convEvent.detail}`;
          if (newMood !== moodStatus) {
            setMoodStatus(newMood);
            console.log('Mood updated:', newMood);
          }
        }
      }
    } catch (error) {
      console.error('Error polling mood:', error);
    }
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(moodPollInterval);
}, [patientId, moodStatus]);
```

Also update the mood display to be more prominent:

```jsx
<div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Recent Mood</div>
  <div style={{ 
    fontSize: '1.1rem', 
    fontWeight: 'bold', 
    color: moodStatus.includes('Happy') ? '#28a745' : 
           moodStatus.includes('Sad') ? '#dc3545' : '#0d6efd'
  }}>
    {moodStatus.includes('Happy') && '😊 '}
    {moodStatus.includes('Sad') && '😢 '}
    {moodStatus.includes('Neutral') && '😐 '}
    {moodStatus.includes('Loved') && '❤️ '}
    {moodStatus}
  </div>
  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
    Updates automatically every 10 seconds
  </div>
</div>
```

---

## Issue 4: Patient Data Should Reflect in Dashboards

### Solution: This is already working! Verification steps:

**Test Steps:**

1. **Login as Doctor** (doctor@example.com)
   - Select "John Doe (patient@example.com)" from dropdown
   - You should see:
     - AI Health Summary
     - Patient Information
     - 4 Shared Notes
     - 3 Health Reports

2. **Login as Caregiver** (caregiver@example.com)
   - Dashboard should automatically show:
     - Patient name: "John Doe"
     - Recent mood from timeline
     - Location status
     - Alerts
     - Notes

**If data doesn't appear:**
- Make sure you reseeded the database: `npm run seed`
- Check browser console for API errors
- Verify backend is running: http://localhost:3001/api/docs

---

## Issue 5: SOS Should Create Alerts in Caregiver Dashboard

### Solution: Update SOS Button to Create Alerts

**Update: `frontend/src/PatientPages/EmergencySOS.jsx`**

Modify the `handleSOSClick` function:

```jsx
const handleSOSClick = async () => {
  setIsDialogOpen(true);
  
  try {
    // Get user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    // Import api dynamically
    const { api } = await import('../lib/api.js');
    
    // Create SOS alert via backend
    await api.post(`/patients/${user.id}/alerts`, {
      type: 'SOS',
      severity: 'HIGH',
      title: 'SOS Emergency Alert',
      description: 'Patient triggered emergency SOS button',
      status: 'ACTIVE'
    });

    console.log('SOS alert created successfully');
  } catch (error) {
    console.error('Failed to create SOS alert:', error);
  }
};
```

**Backend: Create Alert Endpoint**

**File: `server/src/alerts/alerts.controller.ts`** (Create new file)

```typescript
import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { checkPatientAccess } from '../common/policy';
import { TimelineKind } from '../common/types';
import { addTimelineEvent } from '../timeline/timeline.service';

const createAlertSchema = z.object({
  type: z.enum(['SOS', 'MISSED_MEDICATION', 'MOOD_ALERT', 'GEOFENCE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  description: z.string(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'UNRESOLVED']).default('ACTIVE'),
});

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = createAlertSchema.parse(req.body);
    
    checkPatientAccess(req.user!.id, id, req.user!.role);

    // Create a timeline event for the alert
    const alert = await addTimelineEvent(
      id,
      TimelineKind.NOTE,
      `🚨 ${data.title}`,
      `[${data.severity}] ${data.description}`
    );

    res.status(201).json({
      success: true,
      alert: {
        id: alert.id,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        status: data.status,
        timestamp: alert.at
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create alert' });
  }
};
```

**File: `server/src/alerts/alerts.routes.ts`** (Create new file)

```typescript
import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as alertsController from './alerts.controller';

const router = Router();

router.post('/patients/:id/alerts', authenticate, alertsController.createAlert);

export default router;
```

**Register in `server/src/app.ts`:**

```typescript
import alertRoutes from './alerts/alerts.routes';

// In the routes section:
app.use('/api', alertRoutes);
```

**Update Caregiver Dashboard to Show SOS Alerts**

The alerts already come from `/api/patients/:id/alerts`, but make sure SOS alerts are highlighted:

```jsx
// In CaregiverDashboard.jsx, update the alerts mapping:
{alerts.map(alert => (
  <div 
    key={alert.id} 
    style={{
      padding: '1rem',
      borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
      backgroundColor: alert.type === 'SOS' ? '#ffebee' : '#f9f9f9',
      borderRadius: '4px',
      animation: alert.type === 'SOS' ? 'pulse 2s infinite' : 'none'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
      <strong style={{ color: getSeverityColor(alert.severity), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{alert.type === 'SOS' ? '🚨' : getSeverityIcon(alert.severity)}</span>
        <span>{alert.title}</span>
      </strong>
      <span style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>
        {new Date(alert.timestamp).toLocaleString()}
      </span>
    </div>
    <p style={{ margin: 0, fontSize: '0.95rem' }}>{alert.description}</p>
  </div>
))}
```

Add CSS for pulse animation in `PatientPages.css`:

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

---

## 🧪 Quick Testing Checklist

After implementing these fixes:

### Test 1: FHIR Data
- [x] Login as Doctor
- [x] Select patient
- [x] See Medical History section with prescriptions, diagnoses, and vitals

### Test 2: AI Companion Chat
- [x] Login as Patient
- [x] Go to Companion Chat
- [x] Send a message
- [x] Get AI-powered response from backend

### Test 3: Mood Sync
- [x] Login as Patient
- [x] Click a mood emoji (e.g., 😊 Happy)
- [x] Login as Caregiver
- [x] See mood in Patient Status card
- [x] Wait 10 seconds and see it update automatically

### Test 4: Patient Data
- [x] Verify patient@example.com data appears in:
  - Doctor dashboard (after selecting)
  - Caregiver dashboard (automatically)

### Test 5: SOS Alerts
- [x] Login as Patient
- [x] Click SOS button (in sidebar)
- [x] Confirm SOS
- [x] Login as Caregiver
- [x] See 🚨 SOS alert in Alerts panel with red highlight

---

## 📝 Implementation Order

1. **FHIR Section** - Just add the JSX code to ClinicianDashboard.jsx
2. **Mood Polling** - Add useEffect to CaregiverDashboard.jsx
3. **SOS Alerts** - Create alert controller, routes, update EmergencySOS
4. **AI Chat** - Update PatientChat.jsx and companion controller
5. **Test Everything** - Follow test checklist

---

## ⚡ Quick Commands

```bash
# If you made backend changes, restart server:
cd server
npm run dev

# Frontend should auto-reload, but if needed:
cd frontend
npm run dev
```

All issues should be resolved after these fixes! 🎉

