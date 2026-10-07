import axios from 'axios';
import { config } from './config.js';
import { processWithLLM, LLMResponse } from './llm.js';

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

export async function notifyAdminHotLead(prospectPhone: string, llmResult: LLMResponse, originalText: string): Promise<void> {
  if (!config.adminAlertPhone) return;

  const alertText = `🚨 *ALERTA LEAD HOT / IMAGENTIA B2B* 🚨\n\n` +
    `• *Prospecto:* +${prospectPhone}\n` +
    `• *Mensaje recibido:* "${originalText}"\n` +
    `• *Diagnóstico:* ${llmResult.reason}\n` +
    `• *Acción ejecutada:* Enrutado a llamada con Dirección General (Cristian).\n\n` +
    `_Revisar WhatsApp Business para seguimiento estratégico inmediato._`;

  try {
    await sendWhatsAppMessage(config.adminAlertPhone, alertText);
    console.log(`[ESCALAMIENTO EXITOSO] Notificación enviada a Cristian (+${config.adminAlertPhone})`);
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

  // 1. Confirmar lectura en WhatsApp
  await markAsRead(messageId);

  // 2. Procesar con LLM Consultivo B2B
  const llmResult = await processWithLLM(from, text);
  console.log(`[ANALYSIS] Calificación: ${llmResult.qualification} | Es HOT: ${llmResult.is_hot}`);

  // 3. Despachar respuesta consultiva al prospecto
  await sendWhatsAppMessage(from, llmResult.reply);
  console.log(`[REPLY SENT] A: +${from} | Respuesta: "${llmResult.reply}"`);

  // 4. Si es lead HOT o ticket > $15,000 MXN, notificar a Dirección
  if (llmResult.is_hot) {
    await notifyAdminHotLead(from, llmResult, text);
  }
}
