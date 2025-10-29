import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as companionController from './companion.controller';

const router = Router();

/**
 * @swagger
 * /companion/start:
 *   post:
 *     tags: [Companion]
 *     summary: Start a new companion chat session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/companion/start', authenticate, companionController.startSession);

/**
 * @swagger
 * /companion/message:
 *   post:
 *     tags: [Companion]
 *     summary: Send a message and get AI response
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: I'm feeling a bit lonely today
 *               mood:
 *                 type: string
 *                 example: Sad
 *     responses:
 *       200:
 *         description: AI response returned
 */
router.post('/companion/message', authenticate, companionController.sendMessage);

/**
 * @swagger
 * /companion/end:
 *   post:
 *     tags: [Companion]
 *     summary: End a companion chat session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/companion/end', authenticate, companionController.endSession);

export default router;
