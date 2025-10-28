import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole, ReminderType, TimelineKind } from './common/types';

export const seedDatabase = async () => {
  // Check if already seeded
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('[SEED] Database already seeded');
    return;
  }

  console.log('[SEED] Seeding database with demo data...');

  // Hash passwords
  const patientPassword = await bcrypt.hash('password123', 10);
  const caregiverPassword = await bcrypt.hash('password123', 10);
  const clinicianPassword = await bcrypt.hash('password123', 10);

  // Create patient user with profile and consent
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      passwordHash: patientPassword,
      role: 'PATIENT',
      profile: {
        create: {
          displayName: 'John Doe',
          dateOfBirth: new Date('1950-05-15'),
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

  // Create caregiver user
  const caregiverUser = await prisma.user.create({
    data: {
      email: 'caregiver@example.com',
      passwordHash: caregiverPassword,
      role: 'CAREGIVER',
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'reminders']),
          active: true,
        },
      },
    },
  });

  // Create clinician user
  const clinicianUser = await prisma.user.create({
    data: {
      email: 'doctor@example.com',
      passwordHash: clinicianPassword,
      role: 'CLINICIAN',
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'fhir', 'reminders', 'reports']),
          active: true,
        },
      },
    },
  });

  // Create reminders
  const now = new Date();
  
  const reminder1 = await prisma.reminder.create({
    data: {
      patientId: patientUser.id,
      type: 'MEDICATION',
      title: 'Metformin',
      notes: '500mg, with breakfast',
      dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      recurrence: 'daily',
      createdById: clinicianUser.id,
      active: true,
    },
  });

  const reminder2 = await prisma.reminder.create({
    data: {
      patientId: patientUser.id,
      type: 'MEDICATION',
      title: 'Lisinopril',
      notes: '10mg, after lunch',
      dueAt: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours from now
      recurrence: 'daily',
      createdById: clinicianUser.id,
      active: true,
    },
  });

  const reminder3 = await prisma.reminder.create({
    data: {
      patientId: patientUser.id,
      type: 'APPOINTMENT',
      title: 'Annual Check-up',
      notes: 'Dr. Smith at City Clinic',
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdById: clinicianUser.id,
      active: true,
    },
  });

  // Create adherence events
  await prisma.adherenceEvent.create({
    data: {
      reminderId: reminder1.id,
      patientId: patientUser.id,
      status: 'TAKEN',
      at: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  await prisma.adherenceEvent.create({
    data: {
      reminderId: reminder2.id,
      patientId: patientUser.id,
      status: 'TAKEN',
      at: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  // Create notes
  const note1 = await prisma.note.create({
    data: {
      patientId: patientUser.id,
      authorId: caregiverUser.id,
      content: 'Patient is doing well today. Had a good breakfast and took morning medications on time.',
      aiSummary: 'Patient doing well, breakfast and meds taken on time...',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  const note2 = await prisma.note.create({
    data: {
      patientId: patientUser.id,
      authorId: clinicianUser.id,
      content: 'Blood pressure readings have been stable. Continue current medication regimen.',
      aiSummary: 'Blood pressure stable, continue current meds...',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  });

  // Create timeline events
  await prisma.timelineEvent.create({
    data: {
      patientId: patientUser.id,
      kind: 'NOTE',
      refId: note1.id,
      title: 'New Shared Note',
      detail: `Note added by ${caregiverUser.email}: ${note1.aiSummary}`,
      at: note1.createdAt,
    },
  });

  await prisma.timelineEvent.create({
    data: {
      patientId: patientUser.id,
      kind: 'NOTE',
      refId: note2.id,
      title: 'New Shared Note',
      detail: `Note added by ${clinicianUser.email}: ${note2.aiSummary}`,
      at: note2.createdAt,
    },
  });

  await prisma.timelineEvent.create({
    data: {
      patientId: patientUser.id,
      kind: 'ADHERENCE',
      refId: reminder1.id,
      title: 'Metformin - Taken',
      detail: 'Medication reminder acknowledged as Taken',
      at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  });

  console.log('[SEED] Database seeded successfully!');
  console.log('[SEED] Demo accounts:');
  console.log('  Patient:   patient@example.com / password123');
  console.log('  Caregiver: caregiver@example.com / password123');
  console.log('  Clinician: doctor@example.com / password123');
};
