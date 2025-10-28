// Simple in-memory database for MVP
// This will be replaced with Prisma later

import {
  User,
  PatientProfile,
  Consent,
  Reminder,
  AdherenceEvent,
  Note,
  TimelineEvent,
  Report,
  Conversation,
  VoiceCommand,
  FhirImport,
} from './common/types';

export const db = {
  users: [] as User[],
  patientProfiles: [] as PatientProfile[],
  consents: [] as Consent[],
  reminders: [] as Reminder[],
  adherenceEvents: [] as AdherenceEvent[],
  notes: [] as Note[],
  timelineEvents: [] as TimelineEvent[],
  reports: [] as Report[],
  conversations: [] as Conversation[],
  voiceCommands: [] as VoiceCommand[],
  fhirImports: [] as FhirImport[],
};

// Helper to generate IDs
let idCounter = 1;
export const generateId = () => `id_${idCounter++}`;

