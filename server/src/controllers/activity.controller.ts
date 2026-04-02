import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';

export const getGlobalActivity = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activities = await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, assignedTo: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
};

export const getProjectActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = { projectId: req.params.projectId };
    if (req.user!.role === 'DEVELOPER') {
      where.task = { assignedTo: req.user!.id };
    }
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, assignedTo: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
};

export const getMissedActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { since } = req.query;
    const where: any = {};
    if (since) where.createdAt = { gte: new Date(since as string) };
    if (req.user!.role === 'PROJECT_MANAGER') {
      where.project = { managerId: req.user!.id };
    } else if (req.user!.role === 'DEVELOPER') {
      where.task = { assignedTo: req.user!.id };
    }
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, assignedTo: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
};
