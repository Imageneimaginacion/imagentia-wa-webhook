import axios from 'axios';
import { config } from './config.js';
import { processWithLLM, LLMResponse } from './llm.js';
import { store } from './store.js';

export async function sendWhatsAppMessage(to: string, text: string): Promise<any> {
  const url = `https://graph.facebook.com/v21.0/${config.whatsappPhoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: true,
      body: text
    }
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${config.whatsappToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

export async function markAsRead(messageId: string): Promise<void> {
  try {
    const url = `https://graph.facebook.com/v21.0/${config.whatsappPhoneId}/messages`;
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${config.whatsappToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err: any) {
    console.warn('[MARK AS READ WARNING]', err.response?.data?.error?.message || err.message);
  }
}

/**
 * RUTA B: Alerta interna exclusiva al CEO (Cristian: +52 664 480 8790)
 * Regla de oro: Jamás enviar esta alerta al número del prospecto.
 */
export async function notifyAdminHotLead(prospectPhone: string, llmResult: LLMResponse, originalText: string): Promise<void> {
  const targetPhone = config.adminAlertPhone || '526644808790';

  // REGLA DE ORO DE PRIVACIDAD: Blindaje estricto contra fuga de metadatos
  if (!targetPhone || targetPhone === prospectPhone) {
    console.warn(`[DUAL DISPATCH PRIVACY GUARD] Alerta interna omitida: destinatario coincide con prospecto (+${prospectPhone})`);
    return;
  }

  const alertText = `🚨 ALERTA LEAD HOT / IMAGENTIA B2B 🚨\n\n` +
    `* Prospecto: +${prospectPhone}\n` +
    `* Mensaje clave: "${originalText}"\n` +
    `* Diagnóstico: ${llmResult.reason}\n` +
    `* Acción ejecutada: Agendando reunión para sumarte / Revisar WhatsApp de inmediato.`;

  try {
    await sendWhatsAppMessage(targetPhone, alertText);
    console.log(`[RUTA B - ALERTA INTERNA] Notificación despachada con éxito a Cristian (+${targetPhone})`);
    store.recordMessage(prospectPhone, 'system', `🚨 Alerta interna enviada a Cristian (+${targetPhone})`);
  } catch (err: any) {
    console.error('[ERROR NOTIFICANDO ADMIN]', err.response?.data || err.message);
  }
}

export async function handleIncomingMessage(message: any): Promise<void> {
  const from = message.from;
  const messageId = message.id;
  const text = message.text?.body;

  if (!text) {
    console.log(`[MESSAGE IGNORED] Mensaje no contiene texto (tipo: ${message.type})`);
    return;
  }

  console.log(`[INCOMING] De: +${from} | Mensaje: "${text}"`);

  // Registrar mensaje entrante del prospecto
  store.recordMessage(from, 'prospect', text);

  // 1. Confirmar lectura en WhatsApp
  await markAsRead(messageId);

  // 2. Procesar con LLM Consultivo B2B V3
  const llmResult = await processWithLLM(from, text);
  console.log(`[ANALYSIS] Calificación: ${llmResult.qualification} | Es HOT: ${llmResult.is_hot}`);

  // Registrar respuesta del agente en el store
  store.recordMessage(from, 'agent', llmResult.reply, llmResult.qualification, llmResult.is_hot, llmResult.reason);

  // 3. RUTA A: Despacho exclusivo al prospecto (solo conversación humana natural)
  await sendWhatsAppMessage(from, llmResult.reply);
  console.log(`[RUTA A - PROSPECTO] Respuesta enviada a: +${from}`);

  // 4. RUTA B: Despacho dual exclusivo a Cristian si es HOT
  if (llmResult.is_hot) {
    await notifyAdminHotLead(from, llmResult, text);
  }
}
