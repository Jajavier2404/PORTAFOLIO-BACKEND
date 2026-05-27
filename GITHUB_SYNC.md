# Sincronización con GitHub

Este endpoint permite sincronizar automáticamente los repositorios públicos de GitHub y generar descripciones con IA usando Hugging Face.

## Configuración

1. **Variables de entorno** (en `.env`):
```env
HUGGINGFACE_API_KEY=tu-api-key-de-huggingface
GITHUB_USERNAME=jajavier2404
```

2. **Obtener API Key de Hugging Face**:
   - Ve a https://huggingface.co/settings/tokens
   - Crea un nuevo token (gratuito)
   - Copia el token en tu `.env`

## Endpoint

### POST /api/projects/sync-github

Sincroniza los repositorios públicos de un usuario de GitHub.

**Headers requeridos:**
- `Authorization: Bearer <token>` (requiere autenticación de admin)
- `Content-Type: application/json`

**Body:**
```json
{
  "githubUsername": "jajavier2404"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "synced": 5,
    "errors": 0,
    "projects": [
      {
        "id": "...",
        "title": "Nombre del Proyecto",
        "description": "Descripción generada por IA",
        "technologies": ["React", "Node.js", "TypeScript"],
        "githubUrl": "https://github.com/...",
        "repoStars": 10,
        "repoForks": 2,
        "aiGenerated": true
      }
    ]
  }
}
```

## Características

- ✅ Obtiene repositorios públicos de GitHub
- ✅ Filtra repositorios que son forks
- ✅ Obtiene lenguajes de programación usados
- ✅ Genera descripciones con IA usando Hugging Face
- ✅ Detecta tecnologías automáticamente
- ✅ Categoriza proyectos (Full Stack, Frontend, Backend, IA, etc.)
- ✅ Guarda metadatos del repositorio (stars, forks, topics)
- ✅ Actualiza proyectos existentes si ya fueron sincronizados
- ✅ Marca proyectos generados por IA

## Flujo de trabajo

1. El admin hace POST a `/api/projects/sync-github` con el username
2. El backend obtiene los repositorios de GitHub
3. Para cada repositorio:
   - Obtiene los lenguajes usados
   - Genera descripción con Hugging Face
   - Detecta tecnologías
   - Guarda/actualiza en la base de datos
4. Retorna el resumen de la sincronización

## Notas

- La API de Hugging Face tiene límites de uso en el plan gratuito
- Si la IA no responde, se usa una descripción fallback
- Los proyectos se marcan con `aiGenerated: true` para identificarlos
- Se guarda `lastSyncedAt` para tracking
