import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class HuggingFaceChatService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string
  ): Promise<{
    content: string;
    processingTime: number;
    modelUsed: string;
  }> {
    const startTime = Date.now();
    
    // Formatear mensajes para el modelo
    const formattedPrompt = this.formatMessagesForModel(messages, systemPrompt);

    try {
      const response = await axios.post(
        `${HUGGINGFACE_API_URL}/microsoft/Phi-3-mini-4k-instruct`,
        {
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos timeout
        }
      );

      const processingTime = Date.now() - startTime;
      const generatedText = response.data[0]?.generated_text || '';
      
      // Limpiar la respuesta
      const cleanResponse = this.cleanResponse(generatedText);

      return {
        content: cleanResponse,
        processingTime,
        modelUsed: 'microsoft/Phi-3-mini-4k-instruct'
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Si hay error, retornar respuesta fallback
      return {
        content: this.getFallbackResponse(),
        processingTime: Date.now() - startTime,
        modelUsed: 'fallback'
      };
    }
  }

  private formatMessagesForModel(
    messages: ChatMessage[],
    systemPrompt: string
  ): string {
    // Formato para Phi-3
    let prompt = `<s|system|>\n${systemPrompt}\n</s|system|\u003e\n`;
    
    // Agregar historial de mensajes
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `<s|user|\u003e\n${msg.content}\n</s|user|\u003e\n`;
      } else if (msg.role === 'assistant') {
        prompt += `<s|assistant|\u003e\n${msg.content}\n</s|assistant|\u003e\n`;
      }
    });
    
    // Agregar prompt para la respuesta
    prompt += `<s|assistant|\u003e\n`;
    
    return prompt;
  }

  private cleanResponse(text: string): string {
    // Remover tags de sistema si quedaron
    let cleaned = text
      .replace(/<s\|system\|\u003e[\s\S]*?<\/s\|system\|\u003e/g, '')
      .replace(/<s\|user\|\u003e[\s\S]*?<\/s\|user\|\u003e/g, '')
      .replace(/<s\|assistant\|\u003e/g, '')
      .replace(/<\/s\|assistant\|\u003e/g, '')
      .trim();
    
    // Si la respuesta es muy corta o vacía, usar fallback
    if (cleaned.length < 10) {
      return this.getFallbackResponse();
    }
    
    return cleaned;
  }

  private getFallbackResponse(): string {
    const fallbacks = [
      "¡Hola! Soy Javier. En este momento estoy teniendo algunos problemas técnicos con mi conexión, pero puedes contactarme directamente por email o LinkedIn si es algo urgente.",
      "Uy, parece que hay un pequeño problema con el servidor. ¿Podrías intentar de nuevo en un momento? Mientras tanto, puedes revisar mis proyectos en la sección de arriba.",
      "Disculpa, estoy experimentando dificultades técnicas momentáneas. Si necesitas algo urgente, no dudes en contactarme directamente. ¡Gracias por tu paciencia!"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
