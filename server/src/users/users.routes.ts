import { Router } from 'express';
import { getUserMe, getPatientSummary } from './users.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/users/me', authenticate, asyncHandler(getUserMe));
router.get('/patients/:id/summary', authenticate, asyncHandler(getPatientSummary));

export default router;

