import { Router } from 'express';
import { importPatientFHIR } from './fhir.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.post('/fhir/import/:patientId', authenticate, asyncHandler(importPatientFHIR));

export default router;

