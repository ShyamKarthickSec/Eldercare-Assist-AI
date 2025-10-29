import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ElderCare Assist API',
      version: '1.0.0',
      description: 'API documentation for ElderCare Assist MVP - A comprehensive elderly care management system with AI-powered insights',
      contact: {
        name: 'ElderCare Assist Team',
        email: 'support@eldercare.example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management' },
      { name: 'Patients', description: 'Patient data and management' },
      { name: 'Timeline', description: 'Patient health timeline' },
      { name: 'Reminders', description: 'Medication and appointment reminders' },
      { name: 'Notes', description: 'Shared notes with AI summaries' },
      { name: 'Companion', description: 'AI companion chat' },
      { name: 'Voice', description: 'Voice command processing' },
      { name: 'Reports', description: 'Health report generation' },
      { name: 'FHIR', description: 'FHIR health record integration (mock)' },
      { name: 'AI', description: 'AI-powered insights and summaries' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['PATIENT', 'CAREGIVER', 'CLINICIAN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            email: { type: 'string' },
            caregiverId: { type: 'string', nullable: true },
          },
        },
        Reminder: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['MEDICATION', 'APPOINTMENT'] },
            title: { type: 'string' },
            notes: { type: 'string', nullable: true },
            dueAt: { type: 'string', format: 'date-time' },
            active: { type: 'boolean' },
          },
        },
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            content: { type: 'string' },
            aiSummary: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['MISSED_MEDICATION', 'MOOD_ALERT', 'GEOFENCE'] },
            severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            title: { type: 'string' },
            description: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['ACTIVE', 'RESOLVED', 'UNRESOLVED'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/**/*.routes.ts', './src/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

