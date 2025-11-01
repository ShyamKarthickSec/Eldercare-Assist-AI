# ElderCare Assist AI - Quick Manual Testing Guide

## Pre-requisites

✅ **Backend Running**: `cd server && npm run dev` (Port 3001)  
✅ **Frontend Running**: `cd frontend && npm run dev` (Port 5173)  
✅ **Database Seeded**: `cd server && npm run seed`  
✅ **Browsers**: Chrome, Firefox, or Edge (latest)

---

## Test Accounts

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Patient** | patient@example.com | password123 | /patient |
| **Caregiver** | caregiver@example.com | password123 | /caregiver |
| **Doctor** | doctor@example.com | password123 | /clinician |

---

## 5-Minute Critical Path Test

### Step 1: Test Patient Dashboard (2 min)

1. **Login as Patient**
   - Navigate to http://localhost:5173
   - Email: patient@example.com
   - Password: password123
   - Click "Login"
   - ✅ Should redirect to `/patient`

2. **Check Dashboard Loads**
   - ✅ Timeline displays with events
   - ✅ "Week" pill badge visible (no Day/Month buttons)
   - ✅ Adherence chart shows data
   - ✅ Mood emojis visible

3. **Test Mood Selection**
   - Click "😢 Sad" emoji
   - ✅ Visual feedback on selection
   - Open DevTools → Network tab
   - ✅ See POST to `/api/patients/.../mood`
   - **Note**: Will test caregiver view in Step 2

4. **Test Companion Chat**
   - Click "Companion Chat" tab
   - Type: "I'm feeling lonely today"
   - Click send button (arrow icon)
   - ✅ Message appears
   - ✅ AI response appears within 5 seconds
   - ✅ Response is empathetic

---

### Step 2: Test Caregiver Dashboard (2 min)

1. **Open New Browser Window** (Incognito/Private mode recommended)

2. **Login as Caregiver**
   - Navigate to http://localhost:5173
   - Email: caregiver@example.com
   - Password: password123
   - ✅ Should redirect to `/caregiver`

3. **Check Patient Monitoring**
   - ✅ "Monitoring Patient: John Doe" badge visible
   - ✅ Current Mood card shows last mood
   - ✅ Last medication status shown
   - ✅ Location map renders (Leaflet)

4. **Test Real-time Mood Update** (verify Step 1.3)
   - Go back to Patient window
   - Select different mood (e.g., "😊 Happy")
   - Wait ~30 seconds on Caregiver dashboard
   - ✅ Mood card updates to "😊 Happy"

5. **Test Shared Notes**
   - Scroll to "Shared Notes" section
   - Type: "Patient is doing well today, had breakfast"
   - Click "Submit Note"
   - ✅ Note appears in list below
   - ✅ AI summary chip visible
   - ✅ "Edit" and "Delete" buttons visible

---

### Step 3: Test Doctor Dashboard (1 min)

1. **Login as Doctor** (use 3rd browser window or logout first)
   - Navigate to http://localhost:5173
   - Email: doctor@example.com
   - Password: password123
   - ✅ Should redirect to `/clinician`

2. **Select Patient**
   - ✅ Patient dropdown visible at top
   - Select "John Doe (patient@example.com)"
   - ✅ All sections populate with data

3. **Verify FHIR Medical History**
   - Scroll to "Medical History" section
   - ✅ See 4 conditions:
     - Essential Hypertension (active)
     - Type 2 Diabetes Mellitus (active)
     - Seasonal Allergies (active)
     - Acute Bronchitis (resolved)
   - ✅ SNOMED CT codes visible

4. **Verify Prescriptions**
   - ✅ See 6 medications:
     - Metformin 500mg (active)
     - Amlodipine 5mg (active)
     - Lisinopril 10mg (active)
     - Aspirin 81mg (active)
     - Atorvastatin 20mg (active)
     - Amoxicillin 500mg (discontinued)
   - ✅ RxNorm codes, dosages shown

5. **Test AI-Generated Reports**
   - Scroll to "AI-Generated Health Reports" section
   - ✅ See 3 reports for John Doe
   - ✅ Each has "🤖 AI-Generated" badge
   - Click "📥 Download PDF" on first report
   - ✅ PDF downloads and opens
   - ✅ Contains patient name, KPIs, tables, timeline

---

## 10-Minute Extended Test

### Patient Features

#### Emergency SOS
1. Patient dashboard → "Emergency SOS" tab
2. Click "Send SOS Alert"
3. Confirm action
4. Switch to Caregiver dashboard
5. ✅ See SOS alert in "Alerts & Notifications" (red, high priority)

#### Voice Assistant (Browser must support Web Speech API)
1. Patient dashboard → "Voice Assistant" tab
2. Click microphone icon
3. Allow mic permission if prompted
4. Say: "How are you feeling today?"
5. ✅ Transcript appears
6. ✅ AI response spoken aloud
7. ✅ Conversation logged in history

#### Voice Note Creation
1. Click mic again
2. Say: "Create a note to my caregiver that I'm feeling dizzy"
3. ✅ Confirmation prompt appears
4. Click "Confirm"
5. ✅ Success message spoken
6. ✅ "Saved note" badge in history
7. Switch to Caregiver dashboard
8. ✅ Note appears in Shared Notes section

---

### Caregiver Features

#### Location Tracking
1. Caregiver dashboard → "Location Status" section
2. ✅ Map displays with patient marker
3. ✅ Safe zone (geofence circle) visible
4. ✅ Last known location timestamp shown

#### Edit/Delete Notes
1. Find note you created in previous test
2. Click "Edit" button
3. Modify text
4. Save
5. ✅ Note updated, AI summary regenerated
6. Click "Delete" button
7. Confirm deletion
8. ✅ Note removed from list

#### View Patient Timeline
1. Click "View Full Patient Timeline" button (if visible)
2. ✅ Redirects to timeline view
3. ✅ Shows comprehensive patient history

---

### Doctor Features

#### Switch Patients
1. Doctor dashboard → Patient dropdown
2. Select "Mary Smith"
3. ✅ All sections reload with Mary's data
4. ✅ Different medical history displayed
5. ✅ Different reports shown

#### View Multiple Report Types
1. Select John Doe again
2. Check all 3 reports:
   - "Weekly Health Report - Past 7 Days"
   - "Weekly Health Report - Previous Week"
   - "Monthly Health Report - Last 30 Days"
3. ✅ Period dates are different
4. ✅ All have AI badge

#### Diagnostic Reports
1. Scroll to "Diagnostic Reports" section (if visible)
2. ✅ See 3 reports:
   - Lipid Panel
   - Diabetes Management Panel
   - Comprehensive Metabolic Panel
3. ✅ Conclusions shown

#### Labs & Vitals
1. Scroll to "Labs & Vitals" section
2. ✅ See 60+ observations
3. ✅ LOINC codes visible
4. ✅ Units shown (mmHg, mg/dL, %, etc.)
5. ✅ Dates span ~90 days

---

## UI/UX Checks

### Visual Consistency
- ✅ Patient Dashboard: Blue theme (#3b82f6)
- ✅ Caregiver Dashboard: Blue theme (#3b82f6)
- ✅ Doctor Dashboard: Green theme (#10b981)
- ✅ All sidebars: Consistent spacing, hover effects
- ✅ Cards: Rounded corners, shadows, consistent padding

### Branding
- ✅ All pages show "ElderCare Assist AI" (not "AgCarE")
- ✅ Login page has correct title
- ✅ Browser tab shows "ElderCare Assist AI"

### Sidebar Navigation
- ✅ Patient: Sections listed, smooth scroll on click
- ✅ Caregiver: Active indicator (blue), smooth scroll
- ✅ Doctor: Active indicator (green), "Dr." prefix on username

### Responsive Layout
- ✅ Resize browser window (narrower)
- ✅ Cards stack properly
- ✅ No horizontal scroll
- ✅ Sidebar remains accessible

---

## Database Verification

### Using Prisma Studio

1. **Open Prisma Studio**
   ```bash
   cd server
   npx prisma studio
   ```
   Navigate to http://localhost:5555

2. **Check Tables**:

   **User Table** (should have 4 rows):
   - patient@example.com (PATIENT)
   - patient2@example.com (PATIENT)
   - caregiver@example.com (CAREGIVER)
   - doctor@example.com (CLINICIAN)

   **FhirImport Table** (should have 7 rows):
   - Check dates span May - October 2025
   - Check items: 45, 38, 32, 25, 28, 89, 178

   **TimelineEvent Table** (should have 283+ rows):
   - Filter by kind: 'CLINIC' → should see 265+ rows
   - Check for varied titles: Encounters, Observations, Medications, etc.

   **Report Table** (should have 5 rows):
   - All have generatedBy = "AI"
   - All have title, periodStart, periodEnd, uri

   **Note Table** (should have 4+ rows):
   - All should have aiSummary populated
   - Check author IDs link to caregiver/doctor

---

## Error Scenarios

### Invalid Login
1. Try login with wrong email: wrong@example.com
2. ✅ Error message displayed
3. ✅ Does not redirect

### Offline Mode
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to load data
4. ✅ User-friendly error message (not raw error)
5. ✅ Retry button available (if implemented)

### SOS Without Confirmation
1. Patient dashboard → Emergency SOS
2. Click "Send SOS"
3. Click "Cancel" on confirmation
4. ✅ Alert NOT created
5. ✅ No notification to caregiver

---

## Performance Checks

### Dashboard Load Times
- ✅ Patient Dashboard: < 2 seconds
- ✅ Caregiver Dashboard: < 2 seconds
- ✅ Doctor Dashboard: < 3 seconds (more data)

### API Response Times
- ✅ Login: < 1 second
- ✅ Timeline fetch: < 2 seconds
- ✅ Companion chat: < 5 seconds (AI response)
- ✅ Mood update: < 1 second

### No Console Errors
- Open DevTools → Console
- ✅ No red errors during normal operation
- ✅ No 404s for missing resources
- ✅ No CORS errors

---

## Defect Reporting Template

If you find an issue, report it with:

```markdown
**Bug ID**: BUG-XXX
**Title**: [Short description]
**Severity**: Critical / High / Medium / Low
**Found in Test**: [Test step number]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Screenshots**: [Attach if applicable]

**Environment**:
- Browser: 
- OS: 
- Account Used: 

**Console Errors**: [Copy from DevTools console]
```

---

## Quick Test Checklist

Print this and check off as you test:

### Authentication (5 tests)
- [ ] Login as Patient
- [ ] Login as Caregiver  
- [ ] Login as Doctor
- [ ] Invalid credentials handled
- [ ] Logout works

### Patient Dashboard (9 tests)
- [ ] Timeline displays
- [ ] Mood selection
- [ ] Adherence tracking
- [ ] Companion chat
- [ ] Voice assistant (if supported)
- [ ] Voice note creation (if supported)
- [ ] Emergency SOS
- [ ] Health records view
- [ ] Week view only (no Day/Month)

### Caregiver Dashboard (9 tests)
- [ ] Patient badge visible
- [ ] Mood updates in real-time
- [ ] Adherence view
- [ ] Location map
- [ ] SOS alert reception
- [ ] Create note
- [ ] Edit note
- [ ] Delete note
- [ ] Sidebar navigation

### Doctor Dashboard (13 tests)
- [ ] Patient selection
- [ ] Medical history (4 conditions)
- [ ] Prescriptions (6 meds)
- [ ] Labs & vitals (60+ obs)
- [ ] Encounters (8 visits)
- [ ] Diagnostic reports (3 reports)
- [ ] AI report list (3 for John)
- [ ] Download PDF
- [ ] View PDF in tab
- [ ] Immunizations
- [ ] Allergies
- [ ] Care plans
- [ ] Sidebar navigation

### Backend (8 tests - AUTOMATED ✅)
- [x] Database seeding
- [x] User authentication data
- [x] FHIR data generation
- [x] FHIR data import
- [x] Timeline events from FHIR
- [x] PDF report generation
- [x] Shared notes feature
- [x] Report metadata

### UI/UX (5 tests)
- [ ] Color consistency
- [ ] Branding (ElderCare Assist AI)
- [ ] Responsive layout
- [ ] Loading states
- [ ] Error handling

---

**Total Manual Tests**: 44  
**Estimated Time**: 10-15 minutes (critical path) + 20-30 minutes (extended)

---

## Tips for Efficient Testing

1. **Use Multiple Browser Windows/Tabs**: Test real-time features (mood sync, SOS) without logging out
2. **Use Incognito/Private Mode**: Easily test multiple users simultaneously
3. **Keep DevTools Open**: Monitor network requests and console
4. **Use Prisma Studio**: Verify data persistence immediately
5. **Take Screenshots**: Capture any visual issues
6. **Note Timestamps**: For debugging timing issues

---

**Happy Testing! 🧪**

For questions or issues, refer to TEST_PLAN.md and TEST_EXECUTION_REPORT.md.

