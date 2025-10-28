import { Router } from 'express';
import { getReminders, createReminder, acknowledgeReminder } from './reminders.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/patients/:id/reminders', authenticate, asyncHandler(getReminders));
router.post('/patients/:id/reminders', authenticate, asyncHandler(createReminder));
router.post('/reminders/:id/ack', authenticate, asyncHandler(acknowledgeReminder));

export default router;

