import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

export class HuggingFaceService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeRepository(
    repoName: string,
    description: string | null,
    languages: Record<string, number>,
    topics: string[]
  ): Promise<{
    description: string;
    technologies: string[];
    category: string;
  }> {
    const languagesList = Object.keys(languages).join(', ');
    const topicsList = topics.join(', ');
    
    const prompt = `Analiza este repositorio de GitHub y genera una descripción técnica profesional:

Nombre: ${repoName}
Descripción original: ${description || 'No disponible'}
Lenguajes: ${languagesList || 'No especificado'}
Topics: ${topicsList || 'No especificado'}

Genera un JSON con este formato exacto:
{
  "description": "Descripción técnica detallada del proyecto en español, máximo 150 caracteres",
  "technologies": ["tech1", "tech2", "tech3"],
  "category": "Full Stack|Frontend|Backend|IA|DevOps|Mobile"
}

La descripción debe ser atractiva y profesional, destacando las tecnologías principales.`;

    try {
      const response = await axios.post(
        `${HUGGINGFACE_API_URL}/microsoft/Phi-3-mini-4k-instruct`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data[0]?.generated_text || '';
      
      // Intentar extraer JSON de la respuesta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          description: parsed.description || this.generateFallbackDescription(repoName, languages),
          technologies: parsed.technologies || Object.keys(languages).slice(0, 5),
          category: parsed.category || 'Full Stack'
        };
      }

      // Fallback si no se puede parsear
      return {
        description: this.generateFallbackDescription(repoName, languages),
        technologies: Object.keys(languages).slice(0, 5),
        category: 'Full Stack'
      };
    } catch (error) {
      console.error('Error analyzing repository with AI:', error);
      return {
        description: this.generateFallbackDescription(repoName, languages),
        technologies: Object.keys(languages).slice(0, 5),
        category: 'Full Stack'
      };
    }
  }

  private generateFallbackDescription(
    repoName: string,
    languages: Record<string, number>
  ): string {
    const mainLang = Object.keys(languages)[0] || 'varias tecnologías';
    return `Proyecto desarrollado con ${mainLang}. Implementación de funcionalidades modernas y optimización de rendimiento.`;
  }
}
