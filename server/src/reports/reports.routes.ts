import { Router } from 'express';
import { getReports, createReport } from './reports.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/patients/:id/reports', authenticate, asyncHandler(getReports));
router.post('/patients/:id/reports/generate', authenticate, asyncHandler(createReport));

export default router;

