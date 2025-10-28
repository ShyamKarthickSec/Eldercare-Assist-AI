// Common types used across the application

export enum UserRole {
  PATIENT = 'PATIENT',
  CAREGIVER = 'CAREGIVER',
  CLINICIAN = 'CLINICIAN',
}

export enum ReminderType {
  MEDICATION = 'MEDICATION',
  APPOINTMENT = 'APPOINTMENT',
}

export enum AdherenceStatus {
  TAKEN = 'TAKEN',
  MISSED = 'MISSED',
  SNOOZED = 'SNOOZED',
  SKIPPED = 'SKIPPED',
}

export enum TimelineKind {
  NOTE = 'NOTE',
  ADHERENCE = 'ADHERENCE',
  CLINIC = 'CLINIC',
  SUMMARY = 'SUMMARY',
  CONVERSATION = 'CONVERSATION',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum FhirSource {
  MOCK = 'MOCK',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  displayName: string;
  dateOfBirth?: Date;
  caregiverId?: string;
}

export interface Consent {
  id: string;
  userId: string;
  scopes: string[];
  active: boolean;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  patientId: string;
  type: ReminderType;
  title: string;
  notes?: string;
  dueAt: Date;
  recurrence?: string;
  createdById: string;
  active: boolean;
}

export interface AdherenceEvent {
  id: string;
  reminderId: string;
  patientId: string;
  status: AdherenceStatus;
  at: Date;
}

export interface Note {
  id: string;
  patientId: string;
  authorId: string;
  content: string;
  aiSummary?: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  kind: TimelineKind;
  refId?: string;
  title: string;
  detail: string;
  at: Date;
}

export interface Report {
  id: string;
  patientId: string;
  uri: string;
  checksum: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  patientId: string;
  startedAt: Date;
  endedAt?: Date;
  risk: RiskLevel;
  summary?: string;
}

export interface VoiceCommand {
  id: string;
  patientId: string;
  rawText: string;
  intent: string;
  highRisk: boolean;
  confirmed: boolean;
  createdAt: Date;
}

export interface FhirImport {
  id: string;
  patientId: string;
  source: FhirSource;
  importedAt: Date;
  bundleType: string;
  items: number;
}

