import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/openapi';
import { AppError } from './common/errors';
import { ZodError } from 'zod';

// Route imports
import authRoutes from './auth/auth.routes';
import userRoutes from './users/users.routes';
import timelineRoutes from './timeline/timeline.routes';
import reminderRoutes from './reminders/reminders.routes';
import noteRoutes from './notes/notes.routes';
import companionRoutes from './companion/companion.routes';
import voiceRoutes from './voice/voice.routes';
import reportRoutes from './reports/reports.routes';
import fhirRoutes from './fhir/fhir.routes';
import aiRoutes from './ai/ai.routes';
import patientRoutes from './patients/patients.routes';
import moodRoutes from './mood/mood.routes';
import alertRoutes from './alerts/alerts.routes';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api', timelineRoutes);
  app.use('/api', reminderRoutes);
  app.use('/api', noteRoutes);
  app.use('/api', companionRoutes);
  app.use('/api', voiceRoutes);
  app.use('/api', reportRoutes);
  app.use('/api', fhirRoutes);
  app.use('/api', aiRoutes);
  app.use('/api', patientRoutes);
  app.use('/api', moodRoutes);
  app.use('/api', alertRoutes);

  // Swagger documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve static reports
  app.use('/reports', express.static('reports'));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors,
      });
    }

    // Handle custom app errors
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }

    // Handle unknown errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  });

  return app;
};

