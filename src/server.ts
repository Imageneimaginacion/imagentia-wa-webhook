import express, { Request, Response } from 'express';
import { config, validateConfig } from './config.js';
import { handleIncomingMessage } from './whatsapp.js';
import { store } from './store.js';
import { getDashboardHtml } from './dashboardHtml.js';

const app = express();
app.use(express.json());

// Redirección raíz al Dashboard
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/dashboard');
});

// Dashboard visual ejecutivo
app.get('/dashboard', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getDashboardHtml());
});

// API REST para alimentar el Dashboard en tiempo real
app.get('/api/leads', (_req: Request, res: Response) => {
  res.json(store.getAllLeads());
});

app.get('/api/leads/:phone', (req: Request, res: Response) => {
  const phone = String(req.params.phone);
  const lead = store.getLead(phone);
  if (lead) {
    res.json(lead);
  } else {
    res.status(404).json({ error: 'Lead no encontrado' });
  }
});

// 1. Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'IMAGENTIA WhatsApp B2B Webhook',
    timestamp: new Date().toISOString()
  });
});

// 2. Verificación inicial requerida por Meta for Developers
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.metaVerifyToken) {
    console.log('[WEBHOOK VERIFIED] Handshake de Meta completado con éxito.');
    res.status(200).send(challenge);
  } else {
    console.warn('[WEBHOOK REJECTED] Token de verificación inválido.');
    res.sendStatus(403);
  }
});

// 3. Receptor de eventos y mensajes entrantes
app.post('/webhook', async (req: Request, res: Response) => {
  // Retornar 200 OK de inmediato a Meta para evitar retries o timeouts
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const message of messages) {
          await handleIncomingMessage(message);
        }
      }
    }
  } catch (err: any) {
    console.error('[WEBHOOK ERROR]', err.message);
  }
});

// Iniciar servidor
validateConfig();
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 IMAGENTIA WhatsApp B2B Webhook Server activo`);
  console.log(`📡 Puerto: ${config.port}`);
  console.log(`🔗 Webhook URL: http://localhost:${config.port}/webhook`);
  console.log(`🔑 Verify Token: ${config.metaVerifyToken}`);
  console.log(`====================================================`);
});
