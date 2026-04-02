import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), updateProject);
router.delete('/:id', authorize('ADMIN'), deleteProject);

export default router;