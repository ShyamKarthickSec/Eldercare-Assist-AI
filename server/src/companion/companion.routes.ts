import { Router } from 'express';
import { startSession, sendMessage, stopSession } from './companion.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.post('/companion/start', authenticate, asyncHandler(startSession));
router.post('/companion/:sessionId/message', authenticate, asyncHandler(sendMessage));
router.post('/companion/:sessionId/stop', authenticate, asyncHandler(stopSession));

export default router;

