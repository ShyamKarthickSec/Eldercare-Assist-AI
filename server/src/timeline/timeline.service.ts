import { prisma } from '../prisma';
import { TimelineKind } from '../common/types';

export const addTimelineEvent = async (
  patientId: string,
  kind: TimelineKind,
  title: string,
  detail: string,
  refId?: string
) => {
  const event = await prisma.timelineEvent.create({
    data: {
      patientId,
      kind,
      title,
      detail,
      refId,
    },
  });
  
  return event;
};

export const getTimeline = async (
  patientId: string,
  from?: Date,
  to?: Date,
  limit: number = 50
) => {
  const events = await prisma.timelineEvent.findMany({
    where: {
      patientId,
      ...(from && { at: { gte: from } }),
      ...(to && { at: { lte: to } }),
    },
    orderBy: { at: 'desc' },
    take: limit,
  });
  
  return events;
};

