import { Router } from 'express';
import { getAllPatients, getPatientLocation, getPatientAlerts } from './patients.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../common/asyncHandler';

const router = Router();

router.get('/patients', authenticate, asyncHandler(getAllPatients));
router.get('/patients/:id/location', authenticate, asyncHandler(getPatientLocation));
router.get('/patients/:id/alerts', authenticate, asyncHandler(getPatientAlerts));

export default router;

