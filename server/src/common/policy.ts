// Simple role-based access control policies

import { UserRole } from './types';
import { ForbiddenError } from './errors';

export const checkRole = (userRole: UserRole, allowedRoles: UserRole[]) => {
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
};

export const checkPatientAccess = (userId: string, patientId: string, userRole: UserRole) => {
  // Allow patient to access their own data
  if (userId === patientId) return true;
  
  // Allow clinicians to access any patient
  if (userRole === UserRole.CLINICIAN) return true;
  
  // TODO: Check caregiver relationship
  if (userRole === UserRole.CAREGIVER) {
    // For MVP, allow caregivers to access any patient
    // In production, check actual relationships
    return true;
  }
  
  throw new ForbiddenError('You do not have access to this patient data');
};

