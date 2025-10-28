import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../prisma';
import { ENV } from '../env';
import { BadRequestError, UnauthorizedError, ConflictError } from '../common/errors';
import { UserRole } from '../common/types';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['PATIENT', 'CAREGIVER', 'CLINICIAN']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: AuthRequest, res: Response) => {
  const data = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  // Create user with profile and consent in a transaction
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      consent: {
        create: {
          scopes: JSON.stringify(['timeline', 'notes', 'fhir', 'reminders']),
          active: true,
        },
      },
      ...(data.role === 'PATIENT' && {
        profile: {
          create: {
            displayName: data.firstName && data.lastName 
              ? `${data.firstName} ${data.lastName}`
              : data.email.split('@')[0],
          },
        },
      }),
    },
  });
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const data = loginSchema.parse(req.body);
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { consent: true },
  });
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    consent: user.consent ? {
      scopes: JSON.parse(user.consent.scopes),
      active: user.consent.active,
    } : null,
  });
};

