import { Router } from 'express';
import { getNotes, createNote } from './notes.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/patients/:id/notes', authenticate, asyncHandler(getNotes));
router.post('/patients/:id/notes', authenticate, asyncHandler(createNote));

export default router;

