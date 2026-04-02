import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { createError } from '../middleware/error.middleware';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string().uuid(),
});

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: { ...data, managerId: req.user!.id },
      include: { client: true, manager: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const getAllProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where = req.user!.role === 'PROJECT_MANAGER'
      ? { managerId: req.user!.id }
      : req.user!.role === 'DEVELOPER'
      ? { tasks: { some: { assignedTo: req.user!.id } } }
      : {};

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        manager: { select: { id: true, name: true, email: true } },
        tasks: {
          include: { developer: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return next(createError(404, 'Project not found'));

    if (req.user!.role === 'PROJECT_MANAGER' && project.managerId !== req.user!.id) {
      return next(createError(403, 'Access denied'));
    }
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return next(createError(404, 'Project not found'));
    if (req.user!.role === 'PROJECT_MANAGER' && project.managerId !== req.user!.id) {
      return next(createError(403, 'Access denied'));
    }
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: { client: true, manager: { select: { id: true, name: true, email: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};