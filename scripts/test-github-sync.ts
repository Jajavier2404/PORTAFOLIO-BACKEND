import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testGitHubSync() {
  try {
    console.log('🚀 Probando sincronización con GitHub...\n');

    // Primero, obtener token de autenticación (si es necesario)
    // const loginResponse = await axios.post(`${API_URL}/auth/login`, {
    //   email: 'admin@example.com',
    //   password: 'password'
    // });
    // const token = loginResponse.data.data.token;

    // Probar sincronización
    const response = await axios.post(
      `${API_URL}/projects/sync-github`,
      {
        githubUsername: 'jajavier2404'
      },
      {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Sincronización exitosa!');
    console.log('📊 Resultados:');
    console.log(`   - Proyectos sincronizados: ${response.data.data.synced}`);
    console.log(`   - Errores: ${response.data.data.errors}`);
    
    if (response.data.data.projects.length > 0) {
      console.log('\n📁 Primeros proyectos sincronizados:');
      response.data.data.projects.slice(0, 3).forEach((project: any, index: number) => {
        console.log(`\n   ${index + 1}. ${project.title}`);
        console.log(`      Descripción: ${project.description}`);
        console.log(`      Tecnologías: ${project.technologies.join(', ')}`);
        console.log(`      GitHub: ${project.githubUrl}`);
      });
    }

    if (response.data.data.errorDetails.length > 0) {
      console.log('\n❌ Errores encontrados:');
      response.data.data.errorDetails.forEach((error: any) => {
        console.log(`   - ${error.repo}: ${error.error}`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    console.error('Detalles:', error.response?.data?.error || 'No hay detalles adicionales');
  }
}

// Ejecutar prueba
testGitHubSync();
