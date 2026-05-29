import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HuggingFaceChatService } from '../services/huggingFaceChatService';
import { generateSystemPrompt, getFallbackSystemPrompt } from '../prompts/chatPrompts';

const huggingFaceService = new HuggingFaceChatService(
  process.env.HUGGINGFACE_API_KEY || ''
);

export const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'SessionId y mensaje son requeridos'
        });
      }

      // Buscar o crear chat
      let chat = await prisma.chat.findUnique({
        where: { sessionId },
        include: { messages: true }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            sessionId,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: (req.ip as string) || null,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
          },
          include: { messages: true }
        });
      }

      // Guardar mensaje del usuario
      await prisma.message.create({
        data: {
          role: 'USER',
          content: message,
          chatId: chat.id
        }
      });

      // Obtener historial de mensajes para contexto
      const messageHistory = chat.messages.map(msg => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content
      }));

      // Agregar el mensaje actual
      messageHistory.push({
        role: 'user',
        content: message
      });

      // Generar system prompt
      let systemPrompt: string;
      try {
        systemPrompt = await generateSystemPrompt();
      } catch (error) {
        console.error('Error generating system prompt:', error);
        systemPrompt = getFallbackSystemPrompt();
      }

      // Generar respuesta con IA
      const aiResponse = await huggingFaceService.generateResponse(
        messageHistory,
        systemPrompt
      );

      // Guardar respuesta de la IA
      const assistantMessage = await prisma.message.create({
        data: {
          role: 'ASSISTANT',
          content: aiResponse.content,
          chatId: chat.id,
          isAiGenerated: true,
          processingTime: aiResponse.processingTime,
          modelUsed: aiResponse.modelUsed
        }
      });

      // Actualizar contadores del chat
      await prisma.chat.update({
        where: { id: chat.id },
        data: {
          messageCount: { increment: 2 },
          lastMessageAt: new Date()
        }
      });

      res.json({
        success: true,
        data: {
          message: assistantMessage,
          processingTime: aiResponse.processingTime,
          modelUsed: aiResponse.modelUsed
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async createMessage(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'SessionId y mensaje son requeridos'
        });
      }

      let chat = await prisma.chat.findUnique({
        where: { sessionId }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            sessionId,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: (req.ip as string) || null
          }
        });
      }

      const newMessage = await prisma.message.create({
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
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async addAssistantMessage(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;

      const chat = await prisma.chat.findUnique({
        where: { sessionId }
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        });
      }

      const newMessage = await prisma.message.create({
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
    } catch (error) {
      console.error('Add assistant message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async getChat(req: Request, res: Response) {
    try {
      const sessionId = req.params.sessionId as string;

      const chat = await prisma.chat.findUnique({
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
    } catch (error) {
      console.error('Get chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async getAllChats(req: Request, res: Response) {
    try {
      const chats = await prisma.chat.findMany({
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
    } catch (error) {
      console.error('Get all chats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async getChatStats(req: Request, res: Response) {
    try {
      const totalChats = await prisma.chat.count();
      const totalMessages = await prisma.message.count();
      const aiGeneratedMessages = await prisma.message.count({
        where: { isAiGenerated: true }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayMessages = await prisma.message.count({
        where: {
          timestamp: {
            gte: today
          }
        }
      });

      // Obtener chats activos (con mensajes en las últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const activeChats = await prisma.chat.count({
        where: {
          lastMessageAt: {
            gte: yesterday
          }
        }
      });

      res.json({
        success: true,
        data: {
          totalChats,
          totalMessages,
          todayMessages,
          aiGeneratedMessages,
          activeChats
        }
      });
    } catch (error) {
      console.error('Get chat stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async deleteChat(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      await prisma.chat.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Chat eliminado correctamente'
      });
    } catch (error) {
      console.error('Delete chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }
};
