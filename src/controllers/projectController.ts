import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const projectController = {
  async getAll(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      res.json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }

      res.json({
        success: true,
        data: { project }
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const project = await prisma.project.create({
        data: req.body
      });

      res.status(201).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const project = await prisma.project.update({
        where: { id },
        data: req.body
      });

      res.json({
        success: true,
        data: { project }
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await prisma.project.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Proyecto eliminado correctamente'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }
};
