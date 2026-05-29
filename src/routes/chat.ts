import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/message', chatController.sendMessage);
router.post('/send', chatController.sendMessage); // Alias para el frontend
router.post('/assistant', chatController.addAssistantMessage);
router.get('/session/:sessionId', chatController.getChat);

// Rutas protegidas (solo admin)
router.get('/', authenticate, authorizeAdmin, chatController.getAllChats);
router.get('/stats', authenticate, authorizeAdmin, chatController.getChatStats);
router.delete('/:id', authenticate, authorizeAdmin, chatController.deleteChat);

export default router;
