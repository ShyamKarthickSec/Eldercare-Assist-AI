import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as alertsController from './alerts.controller';

const router = Router();

/**
 * @swagger
 * /patients/{id}/alerts:
 *   post:
 *     tags: [Alerts]
 *     summary: Create an alert (SOS, medication, geofence)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SOS, MISSED_MEDICATION, MOOD_ALERT, GEOFENCE]
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, RESOLVED, UNRESOLVED]
 *     responses:
 *       201:
 *         description: Alert created successfully
 */
router.post('/patients/:id/alerts/create', authenticate, alertsController.createAlert);

export default router;

