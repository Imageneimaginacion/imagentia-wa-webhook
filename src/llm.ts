import axios from 'axios';
import { config } from './config.js';
import { SYSTEM_DIRECTIVE } from './prompt.js';
import { memory } from './memory.js';

export type LeadQualification = 'HOT' | 'WARM' | 'NURTURE' | 'LOW' | 'QUALIFIED' | 'DISQUALIFIED';

export interface LLMResponse {
  reply: string;
  is_hot: boolean;
  qualification: LeadQualification;
  reason: string;
}

function runConsultativeHeuristics(userMessage: string): LLMResponse {
  const isGreeting = /^(hola|buen(os)?\s*(d[ií]as|tardes|noches)?|qu[eé]\s*tal|saludos)/i.test(userMessage.trim());
  const isComplaint = /bot|robot|salud|groser|direct|malo/i.test(userMessage);
  const isPrice = /precio|costo|cuanto|cotiz|tarifa|valor|presupuesto/i.test(userMessage);
  const isMenu = /servicio|paquete|catalogo|pdf|propuesta|presentacion/i.test(userMessage);
  const isHot = /empresa|corporat|sucursal|erp|crm|sistema|infraestructura|inversion|automatiz|30000|20000|50000/i.test(userMessage);
  const isIntake = /formulario|registro|datos|enviar info|link|intake/i.test(userMessage);

  if (isGreeting) {
    return {
      reply: 'Hola, ¿qué tal? Soy Ángel, Consultor Estratégico en IMAGENTIA. ¿En qué proyecto los podemos apoyar hoy?',
      is_hot: false,
      qualification: 'WARM',
      reason: 'Saludo inicial cordial en proceso de diagnóstico'
    };
  }

  if (isComplaint) {
    return {
      reply: 'Tiene toda la razón, una disculpa si fui muy directo. Hola, buenas tardes, soy Ángel de IMAGENTIA. Mi intención era entender rápido su necesidad, pero cuénteme, ¿cómo podemos apoyarlos hoy?',
      is_hot: false,
      qualification: 'WARM',
      reason: 'Ajuste empático ante reclamo de fricción'
    };
  }

  if (isIntake) {
    return {
      reply: `Para iniciar el levantamiento técnico formal y proteger la trazabilidad de su proyecto, por favor complete el formulario oficial de requerimientos en: ${config.intakeUrl}\n\nUna vez recibido, nuestro equipo de arquitectura estructurará el diagnóstico operativo.`,
      is_hot: false,
      qualification: 'WARM',
      reason: 'Solicitud de canalización o registro técnico'
    };
  }

  if (isPrice) {
    if (isHot) {
      return {
        reply: 'Un proyecto con esa inversión requiere una alineación perfecta desde el día uno. Para esta sesión de 15 minutos, voy a sumar a Cristian, nuestro Director General, para que evalúe la viabilidad técnica directamente con ustedes. ¿Les funciona mañana a las 11:00 AM o por la tarde?',
        is_hot: true,
        qualification: 'HOT',
        reason: 'Lead corporativo consultando inversión de alta escala'
      };
    }
    return {
      reply: 'En IMAGENTIA no comercializamos paquetes estandarizados. Cada infraestructura digital y flujo de automatización se diseña a la medida de su cuello de botella operativo. Para determinar una propuesta económica exacta, requerimos 15 minutos en videollamada para mapear su proceso. ¿Tienen disponibilidad este martes a las 10:00 AM o prefieren por la tarde?',
      is_hot: false,
      qualification: 'WARM',
      reason: 'Objeción de precio reencuadrada a videollamada de diagnóstico'
    };
  }

  if (isMenu) {
    return {
      reply: 'En IMAGENTIA no vendemos servicios aislados, sino que desarrollamos infraestructura web B2B y automatización de procesos. Para ver si podemos apoyarlos, ¿podrías comentarme un poco sobre los retos principales que enfrentan hoy en su negocio?',
      is_hot: isHot,
      qualification: isHot ? 'HOT' : 'WARM',
      reason: 'Reencuadre de catálogo hacia diagnóstico de retos operativos'
    };
  }

  if (isHot) {
    return {
      reply: 'Un proyecto con esa inversión requiere una alineación perfecta desde el día uno. Para esta sesión de 15 minutos, voy a sumar a Cristian, nuestro Director General, para que evalúe la viabilidad técnica directamente con ustedes. ¿Les funciona mañana a las 11:00 AM o por la tarde?',
      is_hot: true,
      qualification: 'HOT',
      reason: 'Detección de proyecto corporativo de alto valor'
    };
  }

  return {
    reply: 'En IMAGENTIA optimizamos la infraestructura técnica y los flujos de crecimiento de su negocio. Agendemos 15 minutos en videollamada para mapear su proceso. ¿Tienen disponibilidad este jueves a las 11:00 AM o prefieren por la tarde?',
    is_hot: false,
    qualification: 'WARM',
    reason: 'Respuesta consultiva directa sin muletillas con propuesta de agenda'
  };
}

export async function processWithLLM(phone: string, userMessage: string): Promise<LLMResponse> {
  const history = memory.getHistory(phone);

  // Si no hay API key configurada, ejecutar heurística ejecutiva directa
  if (!config.openaiApiKey || config.openaiApiKey.trim() === '') {
    const result = runConsultativeHeuristics(userMessage);
    memory.addMessage(phone, 'user', userMessage);
    memory.addMessage(phone, 'assistant', result.reply);
    return result;
  }

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
        temperature: 0.5,
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
    console.warn('[LLM API FALLBACK]', error.response?.data?.error?.message || error.message);
    const result = runConsultativeHeuristics(userMessage);
    memory.addMessage(phone, 'user', userMessage);
    memory.addMessage(phone, 'assistant', result.reply);
    return result;
  }
}
