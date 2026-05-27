import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { GitHubService } from '../services/githubService';
import { HuggingFaceService } from '../services/huggingFaceService';

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
  },

  async syncWithGitHub(req: Request, res: Response) {
    try {
      const { githubUsername } = req.body;
      
      if (!githubUsername) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el nombre de usuario de GitHub'
        });
      }

      const githubService = new GitHubService(githubUsername);
      const huggingFaceService = new HuggingFaceService(
        process.env.HUGGINGFACE_API_KEY || ''
      );

      // Obtener repositorios de GitHub
      const repos = await githubService.getRepositories();
      
      const syncedProjects = [];
      const errors = [];

      for (const repo of repos) {
        try {
          // Verificar si el proyecto ya existe
          const existingProject = await prisma.project.findUnique({
            where: { githubId: repo.id.toString() }
          });

          // Obtener lenguajes del repositorio
          const languages = await githubService.getRepositoryLanguages(
            repo.owner.login,
            repo.name
          );

          // Generar descripción con IA
          const aiAnalysis = await huggingFaceService.analyzeRepository(
            repo.name,
            repo.description,
            languages,
            repo.topics
          );

          const projectData = {
            title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
            description: aiAnalysis.description,
            githubUrl: repo.html_url,
            technologies: aiAnalysis.technologies,
            githubId: repo.id.toString(),
            repoName: repo.name,
            repoOwner: repo.owner.login,
            repoDescription: repo.description || '',
            repoLanguage: repo.language || '',
            repoStars: repo.stargazers_count,
            repoForks: repo.forks_count,
            repoTopics: repo.topics,
            lastSyncedAt: new Date(),
            aiGenerated: true,
            aiDescription: aiAnalysis.description,
            featured: false,
            order: 0
          };

          let project;
          if (existingProject) {
            // Actualizar proyecto existente
            project = await prisma.project.update({
              where: { id: existingProject.id },
              data: projectData
            });
          } else {
            // Crear nuevo proyecto
            project = await prisma.project.create({
              data: projectData
            });
          }

          syncedProjects.push(project);
        } catch (error) {
          console.error(`Error syncing repo ${repo.name}:`, error);
          errors.push({
            repo: repo.name,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      res.json({
        success: true,
        data: {
          synced: syncedProjects.length,
          errors: errors.length,
          projects: syncedProjects,
          errorDetails: errors
        }
      });
    } catch (error) {
      console.error('Sync with GitHub error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al sincronizar con GitHub',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};
