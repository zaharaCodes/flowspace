import { Router } from 'express';
import { createTask, getTasksByProject, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), createTask);
router.get('/project/:projectId', getTasksByProject);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteTask);

export default router;