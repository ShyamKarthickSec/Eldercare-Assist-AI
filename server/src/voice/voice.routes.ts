import { Router } from 'express';
import { parseVoice, confirmVoice } from './voice.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.post('/voice/parse', authenticate, asyncHandler(parseVoice));
router.post('/voice/confirm/:voiceCommandId', authenticate, asyncHandler(confirmVoice));

export default router;

