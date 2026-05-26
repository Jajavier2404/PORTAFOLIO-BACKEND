"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
exports.authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'USER'
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },
    async me(req, res) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user?.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            console.error('Me error:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    }
};
//# sourceMappingURL=authController.js.map