import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { authenticate } from './auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;

