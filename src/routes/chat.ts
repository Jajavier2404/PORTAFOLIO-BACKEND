import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/message', chatController.createMessage);
router.post('/assistant', chatController.addAssistantMessage);
router.get('/session/:sessionId', chatController.getChat);

// Rutas protegidas (solo admin)
router.get('/', authenticate, authorizeAdmin, chatController.getAllChats);
router.get('/stats', authenticate, authorizeAdmin, chatController.getChatStats);

export default router;
