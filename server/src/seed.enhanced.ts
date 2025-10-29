import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole, ReminderType, TimelineKind, RiskLevel, FhirSource } from './common/types';

/**
 * ENHANCED SEED DATA
 * Populates ALL tables with realistic, relationally consistent data
 * Demonstrates all dashboard features working immediately
 */

export const seedEnhancedDatabase = async () => {
  console.log('[SEED] 🌱 Starting enhanced database seeding...');

  // Clear existing data
  await prisma.voiceCommand.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.fhirImport.deleteMany();
  await prisma.report.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.note.deleteMany();
  await prisma.adherenceEvent.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.user.deleteMany();

  console.log('[SEED] ✅ Cleared existing data');

  // Hash passwords
  const password = await bcrypt.hash('password123', 10);

  // ==================== CREATE USERS ====================
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      passwordHash: password,
      role: UserRole.PATIENT,
      profile: {
        create: {
          displayName: 'John Doe',
          dateOfBirth: new Date('1950-05-15'),
          caregiverId: null, // Will link after caregiver created
        },
      },
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'fhir', 'reminders', 'companion', 'voice']),
          active: true,
        },
      },
    },
  });

  const patient2User = await prisma.user.create({
    data: {
      email: 'patient2@example.com',
      passwordHash: password,
      role: UserRole.PATIENT,
      profile: {
        create: {
          displayName: 'Mary Smith',
          dateOfBirth: new Date('1945-08-22'),
        },
      },
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'fhir', 'reminders']),
          active: true,
        },
      },
    },
  });

  const caregiverUser = await prisma.user.create({
    data: {
      email: 'caregiver@example.com',
      passwordHash: password,
      role: UserRole.CAREGIVER,
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'reminders', 'alerts']),
          active: true,
        },
      },
    },
  });

  const clinicianUser = await prisma.user.create({
    data: {
      email: 'doctor@example.com',
      passwordHash: password,
      role: UserRole.CLINICIAN,
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'fhir', 'reports']),
          active: true,
        },
      },
    },
  });

  // Link caregiver to patient
  await prisma.patientProfile.update({
    where: { userId: patientUser.id },
    data: { caregiverId: caregiverUser.id },
  });

  await prisma.patientProfile.update({
    where: { userId: patient2User.id },
    data: { caregiverId: caregiverUser.id },
  });

  console.log('[SEED] ✅ Created users (Patient, Patient2, Caregiver, Doctor)');

  // ==================== CREATE REMINDERS ====================
  const now = new Date();
  const reminders = await prisma.reminder.createMany({
    data: [
      {
        patientId: patientUser.id,
        type: ReminderType.MEDICATION,
        title: 'Amlodipine 5mg',
        notes: 'Blood pressure medication - Take with breakfast',
        dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        recurrence: 'daily',
        createdById: caregiverUser.id,
        active: true,
      },
      {
        patientId: patientUser.id,
        type: ReminderType.MEDICATION,
        title: 'Metformin 500mg',
        notes: 'Diabetes medication - Take twice daily with meals',
        dueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        recurrence: 'daily',
        createdById: caregiverUser.id,
        active: true,
      },
      {
        patientId: patientUser.id,
        type: ReminderType.APPOINTMENT,
        title: 'Dr. Martinez Check-up',
        notes: 'Quarterly health review at City Medical Center',
        dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        recurrence: 'quarterly',
        createdById: clinicianUser.id,
        active: true,
      },
      {
        patientId: patient2User.id,
        type: ReminderType.MEDICATION,
        title: 'Aspirin 81mg',
        notes: 'Heart health - Take with morning meal',
        dueAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        recurrence: 'daily',
        createdById: caregiverUser.id,
        active: true,
      },
    ],
  });

  // Get created reminders for adherence events
  const allReminders = await prisma.reminder.findMany({
    where: { patientId: patientUser.id },
  });

  console.log('[SEED] ✅ Created 4 medication/appointment reminders');

  // ==================== CREATE ADHERENCE EVENTS ====================
  const adherenceData = [];
  for (let i = 1; i <= 7; i++) {
    const dayOffset = -i * 24 * 60 * 60 * 1000;
    adherenceData.push({
      reminderId: allReminders[0].id,
      patientId: patientUser.id,
      status: i % 5 === 0 ? 'MISSED' : 'TAKEN', // 80% adherence
      at: new Date(now.getTime() + dayOffset),
    });
    adherenceData.push({
      reminderId: allReminders[1].id,
      patientId: patientUser.id,
      status: i % 4 === 0 ? 'SKIPPED' : 'TAKEN', // 75% adherence
      at: new Date(now.getTime() + dayOffset),
    });
  }

  await prisma.adherenceEvent.createMany({ data: adherenceData });
  console.log('[SEED] ✅ Created 14 adherence events (7 days history)');

  // ==================== CREATE MOOD TIMELINE EVENTS ====================
  const moodEvents = [
    {
      patientId: patientUser.id,
      kind: TimelineKind.CONVERSATION,
      title: 'Mood Update - Happy',
      detail: 'Patient reported feeling happy. Had a great morning walk.',
      at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      patientId: patientUser.id,
      kind: TimelineKind.CONVERSATION,
      title: 'Mood Update - Neutral',
      detail: 'Patient reported feeling neutral. Regular daily activities.',
      at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      patientId: patientUser.id,
      kind: TimelineKind.CONVERSATION,
      title: 'Mood Update - Sad',
      detail: 'Patient reported feeling sad. Missing family members.',
      at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      patientId: patientUser.id,
      kind: TimelineKind.CONVERSATION,
      title: 'Mood Update - Happy',
      detail: 'Patient reported feeling happy. Video call with grandchildren.',
      at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      patientId: patient2User.id,
      kind: TimelineKind.CONVERSATION,
      title: 'Mood Update - Happy',
      detail: 'Patient reported feeling happy and energetic.',
      at: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
  ];

  await prisma.timelineEvent.createMany({ data: moodEvents });
  console.log('[SEED] ✅ Created 5 mood timeline events');

  // ==================== CREATE CAREGIVER NOTES ====================
  const notes = await prisma.note.createMany({
    data: [
      {
        patientId: patientUser.id,
        authorId: caregiverUser.id,
        content: 'Patient had a wonderful day today. Took all medications on time, went for a 30-minute walk in the garden, and had a video call with family. Mood significantly improved compared to yesterday.',
        aiSummary: 'Patient showed improved mood, completed all meds, and enjoyed family time.',
      },
      {
        patientId: patientUser.id,
        authorId: caregiverUser.id,
        content: 'Noticed patient seemed a bit tired this morning. Encouraged rest after breakfast. Blood pressure checked: 128/82 mmHg (slightly elevated). Will monitor closely.',
        aiSummary: 'Patient fatigued, BP slightly elevated, monitoring required.',
      },
      {
        patientId: patientUser.id,
        authorId: caregiverUser.id,
        content: 'Excellent adherence this week! Patient remembered all medications without prompts. Participated actively in physical therapy exercises. Overall very positive progress.',
        aiSummary: 'Perfect medication adherence, active in therapy, positive progress.',
      },
      {
        patientId: patient2User.id,
        authorId: caregiverUser.id,
        content: 'Patient enjoys afternoon reading sessions. Cognitive function remains sharp. Family visited today which lifted spirits considerably.',
        aiSummary: 'Good cognitive function, positive family visit today.',
      },
    ],
  });

  console.log('[SEED] ✅ Created 4 caregiver notes with AI summaries');

  // ==================== CREATE COMPANION CHAT CONVERSATIONS ====================
  const conversation1 = await prisma.conversation.create({
    data: {
      patientId: patientUser.id,
      startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      risk: RiskLevel.LOW,
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      patientId: patientUser.id,
      startedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      risk: RiskLevel.MEDIUM,
    },
  });

  const conversation3 = await prisma.conversation.create({
    data: {
      patientId: patientUser.id,
      startedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      endedAt: null, // Recent, ongoing
      risk: RiskLevel.LOW,
    },
  });

  // Add timeline entries for conversations
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.CONVERSATION,
        title: 'Companion Chat Session',
        detail: 'Patient chatted about daily activities and feeling positive.',
        refId: conversation1.id,
        at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.CONVERSATION,
        title: 'Companion Chat Session - Moderate Concern',
        detail: 'Patient expressed some concerns about upcoming appointment. Provided reassurance.',
        refId: conversation2.id,
        at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.CONVERSATION,
        title: 'Companion Chat Session',
        detail: 'Patient currently chatting about hobbies and interests.',
        refId: conversation3.id,
        at: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('[SEED] ✅ Created 3 companion chat conversations with timeline entries');

  // ==================== CREATE VOICE COMMANDS ====================
  await prisma.voiceCommand.createMany({
    data: [
      {
        patientId: patientUser.id,
        rawText: 'Set reminder for medication at 2pm',
        intent: 'reminder',
        highRisk: false,
        confirmed: true,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        rawText: 'Call emergency services',
        intent: 'sos',
        highRisk: true,
        confirmed: false, // Requires confirmation
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('[SEED] ✅ Created 2 voice command samples');

  // ==================== GENERATE & IMPORT COMPREHENSIVE FHIR DATA ====================
  console.log('[SEED] 🏥 Generating comprehensive FHIR R4 health records (90 days)...');
  
  try {
    const { generateFHIRSamplesForPatient } = require('./fhir/generate-samples');
    const { importFHIRData } = require('./fhir/fhir.connector');
    
    // Generate rich FHIR data for John Doe
    console.log('[SEED] 📄 Generating FHIR data for John Doe...');
    const johnDoeResult = await generateFHIRSamplesForPatient(patientUser.id, 'John Doe');
    
    // Import the generated data
    console.log('[SEED] 📥 Importing FHIR data for John Doe...');
    const importResult1 = await importFHIRData(patientUser.id);
    console.log(`[SEED] ✅ Imported ${importResult1.items} FHIR resources for John Doe`);
    
    // Generate and import for Mary Smith
    console.log('[SEED] 📄 Generating FHIR data for Mary Smith...');
    const marySmithResult = await generateFHIRSamplesForPatient(patient2User.id, 'Mary Smith');
    
    console.log('[SEED] 📥 Importing FHIR data for Mary Smith...');
    const importResult2 = await importFHIRData(patient2User.id);
    console.log(`[SEED] ✅ Imported ${importResult2.items} FHIR resources for Mary Smith`);
    
    console.log('[SEED] ✅ Generated and imported comprehensive FHIR health records');
    console.log(`[SEED]    Total resources: ${johnDoeResult.resourceCount + marySmithResult.resourceCount}`);
  } catch (error) {
    console.error('[SEED] ❌ ERROR generating/importing FHIR data:');
    console.error(error);
    console.log('[SEED] ⚠️  Continuing with seed despite FHIR error...');
  }

  // ==================== ADD HISTORICAL FHIR IMPORT RECORDS ====================
  console.log('[SEED] 📋 Creating historical FHIR import records...');
  
  // Add historical imports for John Doe (simulate past imports)
  await prisma.fhirImport.createMany({
    data: [
      {
        patientId: patientUser.id,
        source: FhirSource.MOCK,
        bundleType: 'collection',
        items: 45,
        importedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      },
      {
        patientId: patientUser.id,
        source: FhirSource.MOCK,
        bundleType: 'collection',
        items: 32,
        importedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
      },
      {
        patientId: patientUser.id,
        source: FhirSource.MOCK,
        bundleType: 'collection',
        items: 28,
        importedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      },
      // Historical imports for Mary Smith
      {
        patientId: patient2User.id,
        source: FhirSource.MOCK,
        bundleType: 'collection',
        items: 38,
        importedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
      },
      {
        patientId: patient2User.id,
        source: FhirSource.MOCK,
        bundleType: 'collection',
        items: 25,
        importedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      },
    ],
  });
  
  // Add corresponding timeline events for historical imports
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.CLINIC,
        title: 'Health Records Imported',
        detail: 'Initial health records imported from My Health Record (45 items): Previous medical history, baseline labs, and prescriptions.',
        at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.CLINIC,
        title: 'Health Records Updated',
        detail: 'Updated health records imported (32 items): Recent lab results, medication changes, and follow-up visit notes.',
        at: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.CLINIC,
        title: 'Health Records Sync',
        detail: 'Health records synchronized (28 items): Latest vitals, prescription renewals, and immunization updates.',
        at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patient2User.id,
        kind: TimelineKind.CLINIC,
        title: 'Health Records Imported',
        detail: 'Initial health records imported from My Health Record (38 items): Medical history and baseline assessments.',
        at: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patient2User.id,
        kind: TimelineKind.CLINIC,
        title: 'Health Records Updated',
        detail: 'Updated health records imported (25 items): Recent test results and medication adjustments.',
        at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  
  console.log('[SEED] ✅ Created 5 historical FHIR import records');

  // ==================== CREATE AI-GENERATED PDF REPORTS ====================
  console.log('[SEED] 📄 Generating AI-powered PDF health reports...');
  
  try {
    const { generateReport } = require('./reports/reports.service');
    
    // Generate 3 reports for John Doe (patientUser)
    // Report 1: Last 7 days
    console.log('[SEED] Generating report 1/5...');
    const report1 = await generateReport(patientUser.id, {
      title: 'Weekly Health Report - Past 7 Days',
      periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: now
    });
    console.log(`[SEED] ✅ Report 1 generated: ${report1.uri}`);
  
  await prisma.report.create({
    data: {
      patientId: patientUser.id,
      title: report1.title,
      periodStart: report1.periodStart,
      periodEnd: report1.periodEnd,
      uri: report1.uri,
      checksum: report1.checksum,
      generatedBy: 'AI',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // Created yesterday
    }
  });
  
  // Report 2: Previous week (8-14 days ago)
  const report2 = await generateReport(patientUser.id, {
    title: 'Weekly Health Report - Previous Week',
    periodStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  });
  
  await prisma.report.create({
    data: {
      patientId: patientUser.id,
      title: report2.title,
      periodStart: report2.periodStart,
      periodEnd: report2.periodEnd,
      uri: report2.uri,
      checksum: report2.checksum,
      generatedBy: 'AI',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) // Created 8 days ago
    }
  });
  
  // Report 3: Monthly summary (last 30 days)
  const report3 = await generateReport(patientUser.id, {
    title: 'Monthly Health Report - Last 30 Days',
    periodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: now
  });
  
  await prisma.report.create({
    data: {
      patientId: patientUser.id,
      title: report3.title,
      periodStart: report3.periodStart,
      periodEnd: report3.periodEnd,
      uri: report3.uri,
      checksum: report3.checksum,
      generatedBy: 'AI',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // Created 2 hours ago
    }
  });
  
  // Generate 2 reports for Mary Smith (patient2User)
  // Report 1: Last 7 days
  const report4 = await generateReport(patient2User.id, {
    title: 'Weekly Health Report - Past 7 Days',
    periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: now
  });
  
  await prisma.report.create({
    data: {
      patientId: patient2User.id,
      title: report4.title,
      periodStart: report4.periodStart,
      periodEnd: report4.periodEnd,
      uri: report4.uri,
      checksum: report4.checksum,
      generatedBy: 'AI',
      createdAt: now
    }
  });
  
  // Report 2: Previous week
  const report5 = await generateReport(patient2User.id, {
    title: 'Weekly Health Report - Previous Week',
    periodStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  });
  
  await prisma.report.create({
    data: {
      patientId: patient2User.id,
      title: report5.title,
      periodStart: report5.periodStart,
      periodEnd: report5.periodEnd,
      uri: report5.uri,
      checksum: report5.checksum,
      generatedBy: 'AI',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  });
  
  // Add report timeline events
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.SUMMARY,
        title: 'AI Health Report Generated',
        detail: `${report1.title} - Comprehensive AI-generated health summary with adherence metrics, mood analysis, and clinical insights.`,
        at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.SUMMARY,
        title: 'AI Health Report Generated',
        detail: `${report2.title} - Comprehensive AI-generated health summary with adherence metrics, mood analysis, and clinical insights.`,
        at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.SUMMARY,
        title: 'AI Health Report Generated',
        detail: `${report3.title} - Comprehensive AI-generated health summary with adherence metrics, mood analysis, and clinical insights.`,
        at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        patientId: patient2User.id,
        kind: TimelineKind.SUMMARY,
        title: 'AI Health Report Generated',
        detail: `${report4.title} - Comprehensive AI-generated health summary.`,
        at: now,
      },
    ],
  });

    console.log('[SEED] ✅ Created 5 AI-generated PDF health reports with real files!');
  } catch (error) {
    console.error('[SEED] ❌ ERROR generating PDF reports:');
    console.error(error);
    console.log('[SEED] ⚠️  Continuing with seed despite PDF generation error...');
  }

  // ==================== CREATE ADHERENCE TIMELINE EVENTS ====================
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.ADHERENCE,
        title: 'Amlodipine 5mg - Taken',
        detail: 'Medication taken on time with breakfast.',
        refId: allReminders[0].id,
        at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.ADHERENCE,
        title: 'Metformin 500mg - Taken',
        detail: 'Medication taken on time with lunch.',
        refId: allReminders[1].id,
        at: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.ADHERENCE,
        title: 'Amlodipine 5mg - Missed',
        detail: 'Medication reminder missed. Patient was sleeping.',
        refId: allReminders[0].id,
        at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('[SEED] ✅ Created adherence timeline events');

  // ==================== CREATE NOTE TIMELINE EVENTS ====================
  const allNotes = await prisma.note.findMany({
    where: { patientId: patientUser.id },
  });

  if (allNotes.length > 0) {
    await prisma.timelineEvent.createMany({
      data: allNotes.map((note, index) => ({
        patientId: patientUser.id,
        kind: TimelineKind.NOTE,
        title: 'Caregiver Note Added',
        detail: note.aiSummary || 'Caregiver note added',
        refId: note.id,
        at: new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000),
      })),
    });
  }

  console.log('[SEED] ✅ Created note timeline events');

  // ==================== FINAL SUMMARY ====================
  const finalCounts = {
    users: await prisma.user.count(),
    profiles: await prisma.patientProfile.count(),
    consents: await prisma.consent.count(),
    reminders: await prisma.reminder.count(),
    adherenceEvents: await prisma.adherenceEvent.count(),
    notes: await prisma.note.count(),
    timelineEvents: await prisma.timelineEvent.count(),
    conversations: await prisma.conversation.count(),
    voiceCommands: await prisma.voiceCommand.count(),
    fhirImports: await prisma.fhirImport.count(),
    reports: await prisma.report.count(),
  };

  console.log('\n[SEED] 🎉 ENHANCED SEEDING COMPLETE!\n');
  console.log('📊 Summary:');
  console.log(`   Users: ${finalCounts.users}`);
  console.log(`   Patient Profiles: ${finalCounts.profiles}`);
  console.log(`   Consents: ${finalCounts.consents}`);
  console.log(`   Reminders: ${finalCounts.reminders}`);
  console.log(`   Adherence Events: ${finalCounts.adherenceEvents}`);
  console.log(`   Caregiver Notes: ${finalCounts.notes}`);
  console.log(`   Timeline Events: ${finalCounts.timelineEvents}`);
  console.log(`   Conversations: ${finalCounts.conversations}`);
  console.log(`   Voice Commands: ${finalCounts.voiceCommands}`);
  console.log(`   FHIR Imports: ${finalCounts.fhirImports}`);
  console.log(`   Reports: ${finalCounts.reports}`);
  console.log('\n✅ All dashboards should now display rich, realistic data!\n');
};

// Export for use in main seed file
export default seedEnhancedDatabase;

