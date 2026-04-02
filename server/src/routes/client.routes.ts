import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: clients });
  } catch (err) { next(err); }
});

router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
});

export default router;