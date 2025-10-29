import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as moodController from './mood.controller';

const router = Router();

/**
 * @swagger
 * /patients/{id}/mood:
 *   post:
 *     tags: [Mood]
 *     summary: Record patient mood
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [Happy, Neutral, Sad, Loved]
 *                 example: Happy
 *               note:
 *                 type: string
 *                 example: Had a great morning walk
 *     responses:
 *       201:
 *         description: Mood recorded successfully
 */
router.post('/patients/:id/mood', authenticate, moodController.recordMood);

/**
 * @swagger
 * /patients/{id}/mood:
 *   get:
 *     tags: [Mood]
 *     summary: Get patient mood history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of mood records
 */
router.get('/patients/:id/mood', authenticate, moodController.getMoodHistory);

export default router;

