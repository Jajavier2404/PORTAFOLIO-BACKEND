"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const prisma_1 = require("../lib/prisma");
exports.projectController = {
    async getAll(req, res) {
        try {
            const projects = await prisma_1.prisma.project.findMany({
                orderBy: [
                    { order: 'asc' },
                    { createdAt: 'desc' }
                ]
            });
            res.json({
                success: true,
                data: { projects }
            });
        }
        catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async getById(req, res) {
        try {
            const id = req.params.id;
            const project = await prisma_1.prisma.project.findUnique({
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
        }
        catch (error) {
            console.error('Get project error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async create(req, res) {
        try {
            const project = await prisma_1.prisma.project.create({
                data: req.body
            });
            res.status(201).json({
                success: true,
                data: { project }
            });
        }
        catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async update(req, res) {
        try {
            const id = req.params.id;
            const project = await prisma_1.prisma.project.update({
                where: { id },
                data: req.body
            });
            res.json({
                success: true,
                data: { project }
            });
        }
        catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async delete(req, res) {
        try {
            const id = req.params.id;
            await prisma_1.prisma.project.delete({
                where: { id }
            });
            res.json({
                success: true,
                message: 'Proyecto eliminado correctamente'
            });
        }
        catch (error) {
            console.error('Delete project error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    }
};
//# sourceMappingURL=projectController.js.map