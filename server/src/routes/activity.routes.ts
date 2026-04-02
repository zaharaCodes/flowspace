import { Router } from 'express';
import { getProjectActivity, getGlobalActivity, getMissedActivity } from '../controllers/activity.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/global', authorize('ADMIN'), getGlobalActivity);
router.get('/missed', getMissedActivity);
router.get('/project/:projectId', getProjectActivity);

export default router;