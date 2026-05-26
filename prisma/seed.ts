import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'javier@admin.com' },
    update: {},
    create: {
      email: 'javier@admin.com',
      password: adminPassword,
      name: 'Javier Gomez',
      role: 'ADMIN'
    }
  });
  console.log('✅ Usuario admin creado:', admin.email);

  // Crear proyectos de ejemplo
  const projects = [
    {
      title: 'Sistema de Gestión con IA',
      description: 'Plataforma de gestión empresarial integrada con modelos de lenguaje para automatización de tareas y análisis de datos.',
      image: '/images/bg-day.png',
      technologies: ['React', 'Node.js', 'OpenAI', 'PostgreSQL', 'Docker'],
      githubUrl: 'https://github.com/jajavier2404',
      liveUrl: '#',
      featured: true,
      order: 1
    },
    {
      title: 'API de Microservicios',
      description: 'Arquitectura de microservicios escalable con comunicación asíncrona, balanceo de carga y monitoreo en tiempo real.',
      image: '/images/bg-night.png',
      technologies: ['Node.js', 'Express', 'Redis', 'RabbitMQ', 'Kubernetes'],
      githubUrl: 'https://github.com/jajavier2404',
      liveUrl: '#',
      featured: true,
      order: 2
    },
    {
      title: 'Chatbot Inteligente',
      description: 'Asistente virtual con procesamiento de lenguaje natural, memoria conversacional y personalización de respuestas.',
      image: '/images/bg-day.png',
      technologies: ['Python', 'FastAPI', 'HuggingFace', 'MongoDB', 'React'],
      githubUrl: 'https://github.com/jajavier2404',
      liveUrl: '#',
      featured: false,
      order: 3
    },
    {
      title: 'Dashboard Analytics',
      description: 'Panel de visualización de datos con gráficos interactivos, filtros dinámicos y exportación de reportes.',
      image: '/images/bg-night.png',
      technologies: ['React', 'D3.js', 'TypeScript', 'TailwindCSS'],
      githubUrl: 'https://github.com/jajavier2404',
      liveUrl: '#',
      featured: false,
      order: 4
    }
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { 
        id: project.title.toLowerCase().replace(/\s+/g, '-') 
      },
      update: {},
      create: project
    });
  }
  console.log('✅ Proyectos de ejemplo creados');

  // Crear chats de ejemplo
  const chat = await prisma.chat.create({
    data: {
      sessionId: 'demo-session-1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '127.0.0.1',
      messages: {
        create: [
          {
            role: 'USER',
            content: 'Hola, ¿quién es Javier?'
          },
          {
            role: 'ASSISTANT',
            content: '¡Hola! Javier es un ingeniero de software apasionado por la tecnología. Estudia Ingeniería de Software y tiene experiencia en desarrollo web, microservicios e inteligencia artificial.'
          },
          {
            role: 'USER',
            content: '¿Qué tecnologías maneja?'
          },
          {
            role: 'ASSISTANT',
            content: 'Javier domina tecnologías como React, TypeScript, Node.js, Python, PostgreSQL, Docker, y está explorando el mundo de la IA con Hugging Face y OpenAI.'
          }
        ]
      }
    }
  });
  console.log('✅ Chat de ejemplo creado');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
