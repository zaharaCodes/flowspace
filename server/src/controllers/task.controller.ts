import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { createError } from '../middleware/error.middleware';
import { z } from 'zod';
import { io } from '../index';
import { emitActivityToRoom, emitNotification } from '../services/socket.service';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string(),
  projectId: z.string().uuid(),
  assignedTo: z.string().uuid(),
});

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = taskSchema.parse(req.body);
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) return next(createError(404, 'Project not found'));
    if (req.user!.role === 'PROJECT_MANAGER' && project.managerId !== req.user!.id) {
      return next(createError(403, 'Access denied'));
    }

    const task = await prisma.task.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
      include: { developer: { select: { id: true, name: true, email: true } }, project: true },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: data.assignedTo,
        title: 'New task assigned',
        message: `You have been assigned: ${task.title}`,
      },
    });
    emitNotification(io, data.assignedTo, notification);

    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

export const getTasksByProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, priority, dueDateFrom, dueDateTo } = req.query;
    const where: any = { projectId: req.params.projectId };

    if (req.user!.role === 'DEVELOPER') where.assignedTo = req.user!.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom as string);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo as string);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { developer: { select: { id: true, name: true, email: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        developer: { select: { id: true, name: true, email: true } },
        project: true,
        activityLogs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!task) return next(createError(404, 'Task not found'));
    if (req.user!.role === 'DEVELOPER' && task.assignedTo !== req.user!.id) {
      return next(createError(403, 'Access denied'));
    }
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!existing) return next(createError(404, 'Task not found'));
    if (req.user!.role === 'DEVELOPER' && existing.assignedTo !== req.user!.id) {
      return next(createError(403, 'Access denied'));
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        developer: { select: { id: true, name: true, email: true } },
        project: true,
      },
    });

    if (req.body.status && req.body.status !== existing.status) {
      const activity = await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          projectId: existing.projectId,
          taskId: existing.id,
          action: `${req.user!.name} moved ${existing.title} from ${existing.status} → ${req.body.status}`,
          fromStatus: existing.status,
          toStatus: req.body.status,
        },
        include: {
          user: { select: { id: true, name: true } },
          task: { select: { id: true, title: true, assignedTo: true } },
        },
      });

      await emitActivityToRoom(io, existing.projectId, activity, req.user!.role, req.user!.id);

      if (req.body.status === 'IN_REVIEW') {
        const notification = await prisma.notification.create({
          data: {
            userId: existing.project.managerId,
            title: 'Task ready for review',
            message: `${existing.title} has been moved to In Review`,
          },
        });
        emitNotification(io, existing.project.managerId, notification);
      }
    }

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};