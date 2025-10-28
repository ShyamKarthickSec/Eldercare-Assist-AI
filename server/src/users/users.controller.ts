import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { prisma } from '../prisma';
import { NotFoundError } from '../common/errors';
import { getTimeline } from '../timeline/timeline.service';

export const getUserMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { profile: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile ? {
      displayName: user.profile.displayName,
      dateOfBirth: user.profile.dateOfBirth,
    } : null,
  });
};

export const getPatientSummary = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: id },
  });
  if (!profile) {
    throw new NotFoundError('Patient not found');
  }
  
  const lastTimeline = await getTimeline(id, undefined, undefined, 10);
  
  res.json({
    profile: {
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
    },
    lastTimeline,
  });
};

