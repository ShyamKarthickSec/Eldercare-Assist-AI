import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getTimeline } from './timeline.service';
import { checkPatientAccess } from '../common/policy';

export const getPatientTimeline = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { from, to, limit } = req.query;
  
  // Check access
  checkPatientAccess(req.user!.id, id, req.user!.role);
  
  const fromDate = from ? new Date(from as string) : undefined;
  const toDate = to ? new Date(to as string) : undefined;
  const limitNum = limit ? parseInt(limit as string) : 50;
  
  const events = await getTimeline(id, fromDate, toDate, limitNum); // FIXED: Added await
  
  console.log(`[TIMELINE] Fetched ${events.length} events for patient ${id}`);
  
  res.json(events);
};

