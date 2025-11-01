# ElderCare Assist AI - Comprehensive Test Plan

## Document Information
- **Project**: ElderCare Assist AI
- **Version**: 1.0
- **Date**: October 31, 2025
- **Test Lead**: QA Team
- **Environment**: Development (localhost)

## Table of Contents
1. [Introduction](#introduction)
2. [Test Scope](#test-scope)
3. [Test Strategy](#test-strategy)
4. [Test Environment](#test-environment)
5. [Test Cases by Module](#test-cases-by-module)
6. [Test Execution Results](#test-execution-results)

---

## 1. Introduction

### 1.1 Purpose
This document outlines comprehensive test cases for the ElderCare Assist AI application, covering all three user roles (Patient, Caregiver, Doctor) and their respective features.

### 1.2 Scope
- Frontend UI/UX Testing
- Backend API Testing
- Integration Testing
- Data Persistence Testing
- AI Feature Testing
- FHIR Data Import Testing

### 1.3 Out of Scope
- Performance/Load Testing
- Security Penetration Testing
- Mobile Responsiveness (beyond basic checks)

---

## 2. Test Scope

### 2.1 Features to Test

#### Authentication & Authorization
- User Registration
- User Login
- Role-based Access Control
- Session Management
- Logout Functionality

#### Patient Dashboard
- Timeline View (Week filter)
- Adherence Tracking
- Medication Reminders
- Mood Selection & Tracking
- Companion Chat (AI-powered)
- Voice Assistant
- Emergency SOS
- Health Records View
- Profile Management

#### Caregiver Dashboard
- Patient Monitoring
- Real-time Mood Updates
- Medication Adherence View
- Location Tracking (Map)
- Alerts & Notifications
- Shared Notes (Create/Edit/Delete)
- SOS Alert Reception
- Patient Timeline Access

#### Doctor Dashboard
- Patient Selection
- Patient Summary View
- Medical History (FHIR)
- Prescriptions & Medications
- Lab Results & Vitals
- Encounters & Visits
- Diagnostic Reports
- AI-Generated Health Reports
- Immunizations & Allergies
- Care Plans

#### Backend Services
- FHIR Data Generation & Import
- AI Summary Generation
- PDF Report Generation
- Real-time Data Sync
- Database Persistence

---

## 3. Test Strategy

### 3.1 Test Levels
1. **Unit Testing**: Individual components and functions
2. **Integration Testing**: Component interactions and API calls
3. **System Testing**: End-to-end workflows
4. **User Acceptance Testing**: Real-world scenarios

### 3.2 Test Types
- **Functional Testing**: Verify features work as expected
- **UI Testing**: Visual consistency and usability
- **Data Testing**: Database CRUD operations
- **API Testing**: Backend endpoint validation
- **Cross-browser Testing**: Chrome, Firefox, Edge

### 3.3 Test Approach
- Manual testing for critical paths
- Automated API testing where applicable
- Database verification for data persistence
- UI inspection for visual consistency

---

## 4. Test Environment

### 4.1 Software Requirements
- **Frontend**: React + Vite (http://localhost:5173)
- **Backend**: Node.js + Express + Prisma (http://localhost:3001)
- **Database**: SQLite (dev.db)
- **Tools**: Prisma Studio, Browser DevTools

### 4.2 Test Data
- **Patient**: patient@example.com / password123 (John Doe)
- **Caregiver**: caregiver@example.com / password123
- **Doctor**: doctor@example.com / password123
- **Secondary Patient**: Mary Smith

### 4.3 Pre-requisites
1. Database seeded with comprehensive data
2. Backend server running
3. Frontend dev server running
4. Prisma Studio available for DB inspection

---

## 5. Test Cases by Module

### 5.1 Authentication Module

#### TC-AUTH-001: User Login - Patient
**Priority**: Critical  
**Preconditions**: Database seeded with patient user  
**Steps**:
1. Navigate to http://localhost:5173
2. Enter email: patient@example.com
3. Enter password: password123
4. Click "Login" button

**Expected Result**:
- User successfully logs in
- Redirected to `/patient` dashboard
- JWT token stored in localStorage
- User profile displayed in sidebar

**Status**: ⏳ Pending

---

#### TC-AUTH-002: User Login - Caregiver
**Priority**: Critical  
**Steps**:
1. Navigate to login page
2. Enter caregiver@example.com / password123
3. Click Login

**Expected Result**:
- Redirected to `/caregiver` dashboard
- Caregiver-specific UI loads
- Patient monitoring badge shows "John Doe"

**Status**: ⏳ Pending

---

#### TC-AUTH-003: User Login - Doctor
**Priority**: Critical  
**Steps**:
1. Navigate to login page
2. Enter doctor@example.com / password123
3. Click Login

**Expected Result**:
- Redirected to `/clinician` dashboard
- Patient selection dropdown visible
- Medical-themed green color scheme

**Status**: ⏳ Pending

---

#### TC-AUTH-004: Invalid Login Credentials
**Priority**: High  
**Steps**:
1. Enter invalid email/password
2. Click Login

**Expected Result**:
- Error message displayed
- User remains on login page
- No token stored

**Status**: ⏳ Pending

---

#### TC-AUTH-005: Logout Functionality
**Priority**: High  
**Steps**:
1. Login as any user
2. Click logout button in sidebar
3. Verify redirect to login page

**Expected Result**:
- localStorage cleared
- Session ended
- Redirected to login page

**Status**: ⏳ Pending

---

### 5.2 Patient Dashboard Module

#### TC-PAT-001: Dashboard Load & Timeline Display
**Priority**: Critical  
**Preconditions**: Logged in as patient@example.com  
**Steps**:
1. Observe dashboard load
2. Check Week view is default and only option
3. Verify timeline events display

**Expected Result**:
- Timeline shows adherence, mood, and clinical events
- Week filter is active (no Day/Month buttons)
- Data loads within 2 seconds
- No console errors

**Status**: ⏳ Pending

---

#### TC-PAT-002: Mood Selection
**Priority**: High  
**Steps**:
1. Navigate to Patient Dashboard
2. Click on a mood emoji (e.g., Happy 😊)
3. Check backend receives request
4. Verify Caregiver dashboard updates

**Expected Result**:
- Mood selected visually indicates selection
- API call to `/api/patients/:id/mood` succeeds
- Mood persisted to database
- Timeline event created
- Caregiver dashboard shows updated mood within 30 seconds

**Status**: ⏳ Pending

---

#### TC-PAT-003: Medication Adherence Tracking
**Priority**: Critical  
**Steps**:
1. View reminders section
2. Mark a medication as "Taken"
3. Verify timeline updates
4. Check database

**Expected Result**:
- Adherence event created with status "TAKEN"
- Timeline shows adherence entry
- Caregiver sees updated adherence status
- Chart/graph updates

**Status**: ⏳ Pending

---

#### TC-PAT-004: Companion Chat - Send Message
**Priority**: High  
**Steps**:
1. Navigate to Companion Chat tab
2. Type message: "I'm feeling a bit lonely today"
3. Click send (arrow icon)
4. Wait for AI response

**Expected Result**:
- User message appears in chat
- AI response appears within 5 seconds
- Response is empathetic and non-medical
- Conversation saved to database

**Status**: ⏳ Pending

---

#### TC-PAT-005: Companion Chat - Mood Detection
**Priority**: High  
**Steps**:
1. Send message containing "sad": "I feel sad today"
2. Observe response

**Expected Result**:
- AI response acknowledges sadness
- Supportive message provided
- Mood possibly updated in backend
- Risk level assessed

**Status**: ⏳ Pending

---

#### TC-PAT-006: Voice Assistant - Speech Recognition
**Priority**: Medium  
**Preconditions**: Browser supports Web Speech API  
**Steps**:
1. Navigate to Voice Assistant tab
2. Click microphone button
3. Say: "How are you today?"
4. Observe transcript and response

**Expected Result**:
- Mic button shows listening state (pulsing animation)
- Speech transcribed correctly
- AI response generated
- Response spoken via TTS
- Conversation logged in Command History

**Status**: ⏳ Pending

---

#### TC-PAT-007: Voice Assistant - Create Shared Note
**Priority**: High  
**Steps**:
1. Click mic button
2. Say: "Create a note to my caregiver that I'm feeling dizzy"
3. Confirm note creation

**Expected Result**:
- Intent detected: note creation
- Confirmation prompt appears
- On confirm: Note created via `/api/patients/:id/notes`
- Success message spoken
- Badge "Saved note" shown in history
- Caregiver can see note

**Status**: ⏳ Pending

---

#### TC-PAT-008: Emergency SOS Trigger
**Priority**: Critical  
**Steps**:
1. Navigate to Emergency SOS tab
2. Click "Send SOS Alert" button
3. Confirm action

**Expected Result**:
- SOS alert created
- Alert stored as timeline event with kind=SOS
- Caregiver dashboard shows alert immediately
- Alert marked as High severity with red styling

**Status**: ⏳ Pending

---

#### TC-PAT-009: Health Records View
**Priority**: Medium  
**Steps**:
1. Navigate to Health Records tab
2. View medical history

**Expected Result**:
- Patient can view their own records
- Read-only display
- Data matches FHIR import

**Status**: ⏳ Pending

---

### 5.3 Caregiver Dashboard Module

#### TC-CARE-001: Dashboard Load & Patient Info
**Priority**: Critical  
**Preconditions**: Logged in as caregiver@example.com  
**Steps**:
1. Dashboard loads
2. Check patient badge

**Expected Result**:
- "Monitoring Patient: John Doe" badge visible
- Patient status cards display
- Map loads with patient location
- Alerts panel visible

**Status**: ⏳ Pending

---

#### TC-CARE-002: Real-time Mood Update Reception
**Priority**: High  
**Preconditions**: Caregiver dashboard open, Patient updates mood  
**Steps**:
1. Open Caregiver dashboard
2. Have patient (in another session) select mood "Sad"
3. Wait 30 seconds (polling interval)

**Expected Result**:
- Current Mood card updates to show "😢 Sad"
- No page refresh needed
- Timeline shows mood event

**Status**: ⏳ Pending

---

#### TC-CARE-003: Medication Adherence View
**Priority**: High  
**Steps**:
1. View Patient Status section
2. Check last medication adherence

**Expected Result**:
- Shows last taken medication
- Timestamp displayed
- Visual indicator (green checkmark for taken)

**Status**: ⏳ Pending

---

#### TC-CARE-004: Location Tracking Map
**Priority**: Medium  
**Steps**:
1. View Location Status section
2. Check map display

**Expected Result**:
- Leaflet map renders
- Patient marker visible
- Safe zone (geofence) shown
- Coordinates accurate

**Status**: ⏳ Pending

---

#### TC-CARE-005: Alerts & Notifications - SOS Reception
**Priority**: Critical  
**Steps**:
1. Patient triggers SOS
2. Check Caregiver Alerts panel

**Expected Result**:
- SOS alert appears within 30 seconds
- Marked with 🚨 icon and red background
- Type: "SOS"
- Status: "Pending" or "Active"
- Timestamp accurate

**Status**: ⏳ Pending

---

#### TC-CARE-006: Create Shared Note
**Priority**: High  
**Steps**:
1. Navigate to Shared Notes section
2. Type note: "Patient is doing well today, had breakfast"
3. Click Submit

**Expected Result**:
- Note appears in list below
- AI summary generated automatically
- Note visible to Doctor
- Timeline event created

**Status**: ⏳ Pending

---

#### TC-CARE-007: Edit Shared Note
**Priority**: Medium  
**Preconditions**: Caregiver has created a note  
**Steps**:
1. Click Edit on own note
2. Modify content
3. Save

**Expected Result**:
- Note updated in database
- AI summary regenerated
- Updated timestamp shown

**Status**: ⏳ Pending

---

#### TC-CARE-008: Delete Shared Note
**Priority**: Medium  
**Steps**:
1. Click Delete on own note
2. Confirm deletion

**Expected Result**:
- Note removed from list
- Deleted from database
- No longer visible to Doctor

**Status**: ⏳ Pending

---

#### TC-CARE-009: Dynamic Sidebar Navigation
**Priority**: Low  
**Steps**:
1. Scroll through dashboard sections
2. Observe sidebar links

**Expected Result**:
- Active section highlighted in sidebar
- Smooth scroll on sidebar link click
- Blue active indicator

**Status**: ⏳ Pending

---

### 5.4 Doctor Dashboard Module

#### TC-DOC-001: Patient Selection
**Priority**: Critical  
**Preconditions**: Logged in as doctor@example.com  
**Steps**:
1. View patient dropdown
2. Select "John Doe"

**Expected Result**:
- Dropdown lists all patients
- On selection, all sections populate with John Doe's data
- Loading states shown during fetch
- No errors

**Status**: ⏳ Pending

---

#### TC-DOC-002: Medical History Display (FHIR)
**Priority**: Critical  
**Steps**:
1. Select patient
2. Scroll to Medical History section

**Expected Result**:
- Shows 4 conditions (Hypertension, Diabetes, Allergies, Bronchitis-resolved)
- SNOMED CT codes visible
- Onset dates shown
- Active/Resolved status clear

**Status**: ⏳ Pending

---

#### TC-DOC-003: Prescriptions & Medications
**Priority**: Critical  
**Steps**:
1. View Prescriptions section

**Expected Result**:
- Shows 6 medications (5 active, 1 discontinued)
- RxNorm codes displayed
- Dosage information clear
- Status indicators (Active/Discontinued)

**Status**: ⏳ Pending

---

#### TC-DOC-004: Labs & Vitals
**Priority**: High  
**Steps**:
1. View Labs & Vitals section

**Expected Result**:
- 60+ observations displayed
- LOINC codes shown
- Values with units (mmHg, mg/dL, %, etc.)
- Dates span 90 days
- Grouped by type (Vitals, Labs)

**Status**: ⏳ Pending

---

#### TC-DOC-005: Encounters & Visits
**Priority**: High  
**Steps**:
1. View Encounters section

**Expected Result**:
- 8 encounters listed
- Visit types shown (Office Visit, Telehealth, Check-up)
- Provider names visible
- Dates accurate

**Status**: ⏳ Pending

---

#### TC-DOC-006: Diagnostic Reports
**Priority**: High  
**Steps**:
1. View Diagnostic Reports section

**Expected Result**:
- 3 reports shown (Lipid Panel, Diabetes Panel, Metabolic Panel)
- Conclusions visible
- Result counts accurate
- Linked observations accessible

**Status**: ⏳ Pending

---

#### TC-DOC-007: AI-Generated Health Reports - List View
**Priority**: Critical  
**Steps**:
1. Scroll to Health Reports section
2. View report list

**Expected Result**:
- 3 reports for John Doe, 2 for Mary Smith
- Each shows:
  - Title
  - Period (start/end dates)
  - Generated date
  - AI-generated badge
  - Download PDF button
  - View Report button

**Status**: ⏳ Pending

---

#### TC-DOC-008: AI-Generated Health Reports - Download PDF
**Priority**: High  
**Steps**:
1. Click "Download PDF" on a report
2. Check file downloads

**Expected Result**:
- PDF file downloads
- File opens successfully
- Contains:
  - Patient name & ID
  - Period covered
  - AI-generated badge
  - KPIs (adherence %, mood, alerts)
  - Tables (Medications, Encounters, Notes)
  - Timeline highlights
  - Footer with timestamp

**Status**: ⏳ Pending

---

#### TC-DOC-009: AI-Generated Health Reports - View Report
**Priority**: High  
**Steps**:
1. Click "View Report" button
2. Check PDF opens in new tab

**Expected Result**:
- New tab opens
- PDF renders in browser
- Same content as download

**Status**: ⏳ Pending

---

#### TC-DOC-010: Immunizations Display
**Priority**: Medium  
**Steps**:
1. View Immunizations section (if visible)

**Expected Result**:
- 2 immunizations shown (Flu, COVID)
- CVX codes displayed
- Dates accurate

**Status**: ⏳ Pending

---

#### TC-DOC-011: Allergies Display
**Priority**: Medium  
**Steps**:
1. View Allergies section (if visible)

**Expected Result**:
- 2 allergies (Penicillin, Grass Pollen)
- Severity indicators
- Reaction details

**Status**: ⏳ Pending

---

#### TC-DOC-012: Care Plans Display
**Priority**: Medium  
**Steps**:
1. View Care Plans section (if visible)

**Expected Result**:
- 1 care plan (Diabetes Management)
- Activities listed (Exercise, Diet, Monitoring)
- Goals visible

**Status**: ⏳ Pending

---

#### TC-DOC-013: Dynamic Sidebar Navigation
**Priority**: Low  
**Steps**:
1. Scroll through dashboard
2. Click sidebar links

**Expected Result**:
- Smooth scrolling to sections
- Active indicator (green for doctor)
- "Dr." prefix on username

**Status**: ⏳ Pending

---

### 5.5 Backend & Integration Tests

#### TC-BE-001: FHIR Data Generation
**Priority**: Critical  
**Steps**:
1. Check `data/fhir_samples/` directory
2. Verify bundle files exist

**Expected Result**:
- 2 comprehensive bundle files
- ~97KB each
- 89 resources per bundle
- Valid JSON structure

**Status**: ⏳ Pending

---

#### TC-BE-002: FHIR Data Import
**Priority**: Critical  
**Steps**:
1. Query FhirImport table in Prisma Studio
2. Check record count

**Expected Result**:
- 7 FHIR import records
- Dates span 6 months (May - Oct 2025)
- Items count correct (45, 38, 32, 25, 28, 89, 178)

**Status**: ⏳ Pending

---

#### TC-BE-003: Timeline Events from FHIR
**Priority**: High  
**Steps**:
1. Query TimelineEvent table
2. Filter by kind='CLINIC'

**Expected Result**:
- 100+ clinic events
- Events match FHIR resources (Observations, Medications, Encounters, Conditions, etc.)
- Dates accurate
- Details populated

**Status**: ⏳ Pending

---

#### TC-BE-004: AI Summary Generation for Notes
**Priority**: High  
**Steps**:
1. Create a caregiver note
2. Check Note table for aiSummary field

**Expected Result**:
- aiSummary field populated
- Summary concise (<150 chars)
- Captures key points

**Status**: ⏳ Pending

---

#### TC-BE-005: PDF Report Generation
**Priority**: Critical  
**Steps**:
1. Check `server/reports/` directory
2. Verify PDF files exist

**Expected Result**:
- 5 PDF files (3 for John Doe, 2 for Mary Smith)
- Files are readable PDFs
- Size > 0 bytes
- Filenames contain patient IDs

**Status**: ⏳ Pending

---

#### TC-BE-006: Mood Persistence
**Priority**: High  
**Steps**:
1. Patient selects mood
2. Query database MoodEvent or TimelineEvent table

**Expected Result**:
- Record created with correct mood value
- Timestamp accurate
- Patient ID correct

**Status**: ⏳ Pending

---

#### TC-BE-007: SOS Alert Persistence
**Priority**: Critical  
**Steps**:
1. Patient triggers SOS
2. Query TimelineEvent for SOS entries

**Expected Result**:
- SOS event created
- kind='SOS' or detail contains "SOS"
- Timestamp correct
- Visible to caregiver

**Status**: ⏳ Pending

---

#### TC-BE-008: Database Seeding
**Priority**: Critical  
**Steps**:
1. Fresh seed: Delete dev.db, run `npm run seed`
2. Check all tables

**Expected Result**:
- 4 users created
- 2 patient profiles
- 4 reminders
- 14 adherence events
- 4 notes
- 278+ timeline events
- 7 FHIR imports
- 5 reports
- Deterministic (same data each time)

**Status**: ⏳ Pending

---

### 5.6 UI/UX Tests

#### TC-UI-001: Responsive Layout
**Priority**: Medium  
**Steps**:
1. Resize browser window
2. Test on different screen sizes

**Expected Result**:
- Layout adjusts gracefully
- No horizontal scroll on desktop
- Sidebar remains accessible
- Cards stack properly

**Status**: ⏳ Pending

---

#### TC-UI-002: Color Consistency
**Priority**: Low  
**Steps**:
1. Check all dashboards for color scheme

**Expected Result**:
- Patient: Blue theme
- Caregiver: Blue theme
- Doctor: Green theme (#10b981)
- Consistent spacing tokens

**Status**: ⏳ Pending

---

#### TC-UI-003: Loading States
**Priority**: Medium  
**Steps**:
1. Observe data loading across dashboards

**Expected Result**:
- Skeleton loaders or spinners shown
- No blank screens
- Smooth transitions

**Status**: ⏳ Pending

---

#### TC-UI-004: Error Handling Display
**Priority**: High  
**Steps**:
1. Simulate network error (disconnect internet)
2. Try to load data

**Expected Result**:
- User-friendly error messages
- No raw error objects shown
- Retry option available

**Status**: ⏳ Pending

---

#### TC-UI-005: Branding Consistency
**Priority**: Medium  
**Steps**:
1. Check all pages for app name

**Expected Result**:
- "ElderCare Assist AI" shown consistently
- No instances of "AgCarE" or old branding

**Status**: ⏳ Pending

---

## 6. Test Execution Results

_This section will be populated during test execution._

### 6.1 Summary
- **Total Test Cases**: 67
- **Executed**: 0
- **Passed**: 0
- **Failed**: 0
- **Blocked**: 0
- **Pending**: 67

### 6.2 Critical Issues Found
_To be filled during testing_

### 6.3 Test Coverage
- **Authentication**: 5 test cases
- **Patient Dashboard**: 9 test cases
- **Caregiver Dashboard**: 9 test cases
- **Doctor Dashboard**: 13 test cases
- **Backend/Integration**: 8 test cases
- **UI/UX**: 5 test cases

### 6.4 Recommendations
_To be filled after testing_

---

## Appendix A: Test Data

### User Accounts
```
Patient:   patient@example.com   / password123 (John Doe)
Caregiver: caregiver@example.com / password123
Doctor:    doctor@example.com    / password123
```

### Expected Data Counts (Post-Seed)
- Users: 4
- Patient Profiles: 2
- Reminders: 4
- Timeline Events: 278+
- FHIR Imports: 7
- Reports: 5
- Notes: 4+
- Adherence Events: 14+

## Appendix B: Bug Report Template

```markdown
**Bug ID**: BUG-XXX
**Title**: [Short description]
**Severity**: Critical/High/Medium/Low
**Priority**: P1/P2/P3
**Found in Test Case**: TC-XXX-XXX
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Screenshots**: [If applicable]
**Environment**: [Browser, OS]
**Status**: Open/In Progress/Resolved
```

---

**Document Version**: 1.0  
**Last Updated**: October 31, 2025  
**Next Review**: TBD

