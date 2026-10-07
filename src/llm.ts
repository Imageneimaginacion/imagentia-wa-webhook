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

function runConsultativeHeuristics(userMessage: string): LLMResponse {
  const isPrice = /precio|costo|cuanto|cotiz|tarifa|valor|presupuesto/i.test(userMessage);
  const isMenu = /servicio|paquete|catalogo|pdf|propuesta|presentacion/i.test(userMessage);
  const isHot = /empresa|corporat|sucursal|erp|crm|sistema|infraestructura|inversion|automatiz/i.test(userMessage);
  const isIntake = /formulario|registro|datos|enviar info|link|intake/i.test(userMessage);

  if (isIntake) {
    return {
      reply: `Para iniciar el levantamiento técnico formal y proteger la trazabilidad de su proyecto, por favor complete el formulario oficial de requerimientos en: ${config.intakeUrl}\n\nUna vez recibido, nuestro equipo de arquitectura estructurará el diagnóstico operativo.`,
      is_hot: false,
      qualification: 'QUALIFIED',
      reason: 'Solicitud de canalización o registro técnico'
    };
  }

  if (isPrice) {
    return {
      reply: 'En IMAGENTIA no comercializamos paquetes estandarizados. Cada infraestructura digital y flujo de automatización se diseña a la medida de su cuello de botella operativo. Para determinar una propuesta económica exacta, requerimos 15 minutos en videollamada de diagnóstico. ¿Tienen disponibilidad este jueves a las 11:00 AM?',
      is_hot: isHot,
      qualification: isHot ? 'HOT' : 'QUALIFIED',
      reason: isHot ? 'Lead corporativo consultando inversión' : 'Objeción de precio reencuadrada a diagnóstico'
    };
  }

  if (isMenu) {
    return {
      reply: 'No vendemos servicios aislados ni entregamos catálogos genéricos; desarrollamos ecosistemas integrales de captación, conversión y cumplimiento. Para evaluar la viabilidad de su caso: ¿cuál es el cuello de botella principal que enfrentan hoy en sus operaciones?',
      is_hot: isHot,
      qualification: isHot ? 'HOT' : 'QUALIFIED',
      reason: 'Reencuadre de catálogo hacia diagnóstico de cuello de botella'
    };
  }

  if (isHot) {
    return {
      reply: 'Por la escala de la infraestructura que mencionan, este proyecto califica para alineación técnica directa con Cristian, nuestro Director General. ¿Tienen disponibilidad mañana a las 11:00 AM para la sesión de arquitectura técnica de 15 minutos?',
      is_hot: true,
      qualification: 'HOT',
      reason: 'Detección de proyecto corporativo de alto valor'
    };
  }

  return {
    reply: `Entendido. En IMAGENTIA optimizamos la infraestructura técnica y los flujos de crecimiento de su negocio. ¿Tienen disponibilidad este jueves a las 11:00 AM para una sesión de diagnóstico de 15 minutos, o prefieren avanzar con su levantamiento en ${config.intakeUrl} ?`,
    is_hot: false,
    qualification: 'QUALIFIED',
    reason: 'Respuesta consultiva estándar con cierre forzado a llamada'
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
    console.warn('[LLM API FALLBACK]', error.response?.data?.error?.message || error.message);
    const result = runConsultativeHeuristics(userMessage);
    memory.addMessage(phone, 'user', userMessage);
    memory.addMessage(phone, 'assistant', result.reply);
    return result;
  }
}
