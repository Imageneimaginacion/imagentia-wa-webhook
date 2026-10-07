import http from 'node:http';
import url from 'node:url';

const PORT = process.env.PORT || 3000;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'imagentia_webhook_token_2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAUaIHJ4keQBSmeD5I3MQ48G2OrvBCZAcnxfzX3ZAH2cNaDm2G30MZAzC5dX7AkZBCISZA7hZBkeJr0YEmx3qEdBfMNcCeZAdkOsdot1UZBY7hoQ0bCOBzRNc7W0clOQBCgBodcynfO3a5Dq8zdMONeKrGozG4ZBHSZC8RqB1axmXM0ZCkildxBE4spvx2ZB2jerKwZDZD';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '716474751543311';
const ADMIN_ALERT_PHONE = process.env.ADMIN_ALERT_PHONE || '526641085327';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const memory = new Map();

const SYSTEM_DIRECTIVE = `[SYSTEM DIRECTIVE: WHATSAPP B2B CONSULTATIVE CLOSER]
ROL: Consultor Estratégico y Sales Engineer B2B de IMAGENTIA.
TONO: Ejecutivo, analítico, asimétrico y profesional.
DIRECTRICES:
1. PROHIBIDO VENDER SERVICIOS DE ENTRADA. Reencuadra hacia ecosistemas y consulta su cuello de botella operativo.
2. PROHIBICIÓN ABSOLUTA DE COSTOS. Exige videollamada de 15 minutos para mapear el proceso.
3. OBJETIVO ES LA REUNIÓN, NO EL PDF. Requerimientos formales en: https://imagentia.com.mx/intake
4. Si detectas proyecto corporativo complejo o ticket > $15,000 MXN, escala a llamada con Cristian, Director General.
5. Cierre de bucle: todo mensaje debe terminar con pregunta directa para agendar (ej. "¿Tienen disponibilidad este jueves a las 11:00 AM?").

Responde estrictamente en JSON:
{
  "reply": "texto para el prospecto",
  "is_hot": true / false,
  "qualification": "HOT" | "QUALIFIED" | "LOW",
  "reason": "diagnóstico breve"
}`;

async function sendWhatsAppMessage(to, text) {
  const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: true, body: text }
      })
    });
    const data = await res.json();
    console.log(`[OUTBOUND SENT] To: +${to} | Status: ${res.status}`);
    return data;
  } catch (err) {
    console.error('[OUTBOUND ERROR]', err.message);
  }
}

async function markAsRead(messageId) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });
  } catch (e) {}
}

async function processWithLLM(phone, text) {
  const history = memory.get(phone) || [];
  const messages = [
    { role: 'system', content: SYSTEM_DIRECTIVE },
    ...history,
    { role: 'user', content: text }
  ];

  if (OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: parsed.reply });
      if (history.length > 10) history.splice(0, history.length - 10);
      memory.set(phone, history);
      return parsed;
    } catch (err) {
      console.error('[LLM API ERROR]', err.message);
    }
  }

  // Fallback heurístico inteligente
  const isPrice = /precio|costo|cuanto|cotiz/i.test(text);
  const isMenu = /servicio|paquete|catalogo|pdf/i.test(text);
  const isHot = /empresa|corporat|sucursal|erp|crm|sistema|infraestructura/i.test(text);

  let reply = '';
  if (isPrice) {
    reply = 'Cada infraestructura web y de automatización se diseña a la medida de su flujo operativo. Para darles un número exacto y no una estimación genérica, necesitamos 15 minutos en videollamada para mapear su proceso. ¿Tienen disponibilidad este jueves a las 11:00 AM?';
  } else if (isMenu) {
    reply = 'No vendemos servicios aislados, desarrollamos ecosistemas digitales y de automatización. Para evaluar la viabilidad técnica, ¿cuál es el cuello de botella principal que tienen hoy en su captación o conversión de clientes?';
  } else if (isHot) {
    reply = 'Por la magnitud y el potencial de su operación, estructuraremos esta llamada directamente con Cristian, nuestro Director General, para alinear la arquitectura técnica. ¿Tienen disponibilidad mañana a las 11:00 AM para la sesión inicial?';
  } else {
    reply = 'Detectamos que optimizar su flujo requiere una arquitectura alineada a sus procesos actuales. ¿Tienen disponibilidad este jueves a las 11:00 AM para una sesión técnica de 15 minutos o prefieren avanzar con el formulario en https://imagentia.com.mx/intake ?';
  }

  history.push({ role: 'user', content: text });
  history.push({ role: 'assistant', content: reply });
  if (history.length > 10) history.splice(0, history.length - 10);
  memory.set(phone, history);

  return {
    reply,
    is_hot: isHot,
    qualification: isHot ? 'HOT' : 'QUALIFIED',
    reason: isHot ? 'Detección corporativa o infraestructura' : 'Interacción estándar'
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // 1. Health check
  if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'online', service: 'IMAGENTIA WhatsApp Webhook' }));
  }

  // 2. Meta Webhook Handshake (GET /webhook)
  if (req.method === 'GET' && parsedUrl.pathname === '/webhook') {
    const mode = parsedUrl.query['hub.mode'];
    const token = parsedUrl.query['hub.verify_token'];
    const challenge = parsedUrl.query['hub.challenge'];

    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
      console.log('[WEBHOOK VERIFIED] Handshake de Meta completado con éxito.');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end(challenge);
    } else {
      console.warn('[WEBHOOK REJECTED] Token incorrecto.');
      res.writeHead(403);
      return res.end('Forbidden');
    }
  }

  // 3. Meta Webhook Events (POST /webhook)
  if (req.method === 'POST' && parsedUrl.pathname === '/webhook') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      // Responder 200 inmediatamente a Meta
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('EVENT_RECEIVED');

      try {
        const data = JSON.parse(body || '{}');
        const entries = data.entry || [];
        for (const entry of entries) {
          const changes = entry.changes || [];
          for (const change of changes) {
            if (change.field !== 'messages') continue;
            const messages = change.value?.messages || [];
            for (const msg of messages) {
              const from = msg.from;
              const text = msg.text?.body;
              if (!text) continue;

              console.log(`[INCOMING] De: +${from} | Mensaje: "${text}"`);
              await markAsRead(msg.id);

              const result = await processWithLLM(from, text);
              console.log(`[REPLY] A: +${from} | Texto: "${result.reply}"`);
              await sendWhatsAppMessage(from, result.reply);

              if (result.is_hot && ADMIN_ALERT_PHONE) {
                const alertText = `🚨 *ALERTA LEAD HOT / IMAGENTIA B2B* 🚨\n\n• *Prospecto:* +${from}\n• *Mensaje:* "${text}"\n• *Diagnóstico:* ${result.reason}\n• *Acción:* Canalizado a llamada con Cristian.\n\n_Revisar WhatsApp Business._`;
                await sendWhatsAppMessage(ADMIN_ALERT_PHONE, alertText);
              }
            }
          }
        }
      } catch (err) {
        console.error('[PROCESS ERROR]', err.message);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[SERVER RUNNING] Webhook activo en http://localhost:${PORT}/webhook`);
  console.log(`[VERIFY TOKEN] ${META_VERIFY_TOKEN}`);
});
