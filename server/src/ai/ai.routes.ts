import { Router } from 'express';
import { getPatientAISummary } from './ai.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/ai/summary/:patientId', authenticate, asyncHandler(getPatientAISummary));

export default router;

