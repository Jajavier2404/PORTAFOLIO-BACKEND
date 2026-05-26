"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rutas públicas
router.post('/message', chatController_1.chatController.createMessage);
router.post('/assistant', chatController_1.chatController.addAssistantMessage);
router.get('/session/:sessionId', chatController_1.chatController.getChat);
// Rutas protegidas (solo admin)
router.get('/', auth_1.authenticate, auth_1.authorizeAdmin, chatController_1.chatController.getAllChats);
router.get('/stats', auth_1.authenticate, auth_1.authorizeAdmin, chatController_1.chatController.getChatStats);
exports.default = router;
//# sourceMappingURL=chat.js.map