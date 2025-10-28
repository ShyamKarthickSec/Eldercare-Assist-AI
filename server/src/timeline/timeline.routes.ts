import { Router } from 'express';
import { getPatientTimeline } from './timeline.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/patients/:id/timeline', authenticate, asyncHandler(getPatientTimeline));

export default router;

