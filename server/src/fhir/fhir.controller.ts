import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { checkRole } from '../common/policy';
import { UserRole } from '../common/types';
import { importFHIRData } from './fhir.connector';

export const importPatientFHIR = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params;
  
  // Only clinicians can trigger FHIR import
  checkRole(req.user!.role, [UserRole.CLINICIAN, UserRole.PATIENT]);
  
  const result = await importFHIRData(patientId);
  
  res.json({
    success: true,
    message: `Imported ${result.items} records from My Health Record`,
    items: result.items,
  });
};

