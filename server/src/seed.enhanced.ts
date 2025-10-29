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

  // ==================== CREATE FHIR IMPORTS (MOCK HEALTH RECORDS) ====================
  const fhirImport1 = await prisma.fhirImport.create({
    data: {
      patientId: patientUser.id,
      source: FhirSource.MOCK,
      bundleType: 'Collection',
      items: 5,
    },
  });

  const fhirImport2 = await prisma.fhirImport.create({
    data: {
      patientId: patient2User.id,
      source: FhirSource.MOCK,
      bundleType: 'Collection',
      items: 3,
    },
  });

  // Add FHIR timeline events
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.CLINIC,
        title: 'FHIR Data Imported - General Check-up',
        detail: 'Health records imported: BP 120/80 mmHg, Glucose 90 mg/dL, Cholesterol 180 mg/dL. Prescriptions: Amlodipine, Metformin.',
        refId: fhirImport1.id,
        at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.CLINIC,
        title: 'Diagnosis Added - Mild Hypertension',
        detail: 'Diagnosed with mild hypertension. Prescribed Amlodipine 5mg daily. Follow-up in 3 months.',
        at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patient2User.id,
        kind: TimelineKind.CLINIC,
        title: 'FHIR Data Imported - Routine Visit',
        detail: 'Routine check-up completed. All vitals normal. Prescribed Aspirin 81mg for heart health.',
        refId: fhirImport2.id,
        at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('[SEED] ✅ Created FHIR import records with health data');

  // ==================== CREATE REPORTS ====================
  await prisma.report.createMany({
    data: [
      {
        patientId: patientUser.id,
        uri: '/reports/john-doe-2025-01-weekly.pdf',
        checksum: 'abc123',
      },
      {
        patientId: patientUser.id,
        uri: '/reports/john-doe-2025-02-weekly.pdf',
        checksum: 'def456',
      },
      {
        patientId: patient2User.id,
        uri: '/reports/mary-smith-2025-01-weekly.pdf',
        checksum: 'ghi789',
      },
    ],
  });

  // Add report timeline events
  await prisma.timelineEvent.createMany({
    data: [
      {
        patientId: patientUser.id,
        kind: TimelineKind.SUMMARY,
        title: 'Weekly Health Report Generated',
        detail: 'Comprehensive health summary for week ending Jan 27. Adherence: 85%. Mood: Positive.',
        at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientUser.id,
        kind: TimelineKind.SUMMARY,
        title: 'Weekly Health Report Generated',
        detail: 'Comprehensive health summary for week ending Feb 3. Adherence: 90%. Mood: Very positive.',
        at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('[SEED] ✅ Created 3 health reports with timeline entries');

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

