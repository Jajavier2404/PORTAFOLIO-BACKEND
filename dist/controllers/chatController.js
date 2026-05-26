"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const prisma_1 = require("../lib/prisma");
exports.chatController = {
    async createMessage(req, res) {
        try {
            const { sessionId, message } = req.body;
            if (!sessionId || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'SessionId y mensaje son requeridos'
                });
            }
            let chat = await prisma_1.prisma.chat.findUnique({
                where: { sessionId }
            });
            if (!chat) {
                chat = await prisma_1.prisma.chat.create({
                    data: {
                        sessionId,
                        userAgent: req.headers['user-agent'] || null,
                        ipAddress: req.ip || null
                    }
                });
            }
            const newMessage = await prisma_1.prisma.message.create({
                data: {
                    role: 'USER',
                    content: message,
                    chatId: chat.id
                }
            });
            res.status(201).json({
                success: true,
                data: {
                    chatId: chat.id,
                    message: newMessage
                }
            });
        }
        catch (error) {
            console.error('Create message error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async addAssistantMessage(req, res) {
        try {
            const { sessionId, message } = req.body;
            const chat = await prisma_1.prisma.chat.findUnique({
                where: { sessionId }
            });
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat no encontrado'
                });
            }
            const newMessage = await prisma_1.prisma.message.create({
                data: {
                    role: 'ASSISTANT',
                    content: message,
                    chatId: chat.id
                }
            });
            res.json({
                success: true,
                data: {
                    message: newMessage
                }
            });
        }
        catch (error) {
            console.error('Add assistant message error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async getChat(req, res) {
        try {
            const sessionId = req.params.sessionId;
            const chat = await prisma_1.prisma.chat.findUnique({
                where: { sessionId },
                include: {
                    messages: {
                        orderBy: {
                            timestamp: 'asc'
                        }
                    }
                }
            });
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat no encontrado'
                });
            }
            res.json({
                success: true,
                data: { chat }
            });
        }
        catch (error) {
            console.error('Get chat error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async getAllChats(req, res) {
        try {
            const chats = await prisma_1.prisma.chat.findMany({
                include: {
                    messages: {
                        orderBy: {
                            timestamp: 'asc'
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            res.json({
                success: true,
                data: { chats }
            });
        }
        catch (error) {
            console.error('Get all chats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async getChatStats(req, res) {
        try {
            const totalChats = await prisma_1.prisma.chat.count();
            const totalMessages = await prisma_1.prisma.message.count();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayMessages = await prisma_1.prisma.message.count({
                where: {
                    timestamp: {
                        gte: today
                    }
                }
            });
            res.json({
                success: true,
                data: {
                    totalChats,
                    totalMessages,
                    todayMessages
                }
            });
        }
        catch (error) {
            console.error('Get chat stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    }
};
//# sourceMappingURL=chatController.js.map