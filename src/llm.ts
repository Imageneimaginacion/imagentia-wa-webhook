import axios from 'axios';
import { config } from './config.js';
import { SYSTEM_DIRECTIVE } from './prompt.js';
import { memory } from './memory.js';

export interface LLMResponse {
  reply: string;
  is_hot: boolean;
  qualification: 'HOT' | 'QUALIFIED' | 'LOW';
  reason: string;
}

export async function processWithLLM(phone: string, userMessage: string): Promise<LLMResponse> {
  const history = memory.getHistory(phone);

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: SYSTEM_DIRECTIVE }
  ];

  for (const item of history) {
    messages.push({
      role: item.role,
      content: item.content
    });
  }

  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await axios.post(
      `${config.openaiBaseUrl}/chat/completions`,
      {
        model: config.llmModel,
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content || '{}';
    const parsed: LLMResponse = JSON.parse(rawContent);

    // Persistir en memoria
    memory.addMessage(phone, 'user', userMessage);
    memory.addMessage(phone, 'assistant', parsed.reply);

    return parsed;
  } catch (error: any) {
    console.error('[LLM ERROR]', error.response?.data || error.message);
    // Respuesta de contingencia estrictamente alineada a la directiva
    const fallback: LLMResponse = {
      reply: 'Para brindarle una evaluación técnica precisa y no una estimación genérica, requerimos mapear su flujo operativo. ¿Tienen disponibilidad este jueves a las 11:00 AM para una videollamada de diagnóstico de 15 minutos?',
      is_hot: false,
      qualification: 'QUALIFIED',
      reason: 'Fallback por contingencia de conexión LLM'
    };
    return fallback;
  }
}
