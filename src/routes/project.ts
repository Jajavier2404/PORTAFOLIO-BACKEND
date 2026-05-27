import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorizeAdmin, projectController.create);
router.put('/:id', authenticate, authorizeAdmin, projectController.update);
router.delete('/:id', authenticate, authorizeAdmin, projectController.delete);

// Sincronización con GitHub (solo admin)
router.post('/sync-github', authenticate, authorizeAdmin, projectController.syncWithGitHub);

export default router;
