import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { config, validateConfig } from './config.js';
import { handleIncomingMessage, handleStatusUpdate } from './whatsapp.js';
import { store } from './store.js';
import { db } from './db.js';
import {
  requireAuth,
  requireAdmin,
  isLoginRateLimited,
  recordFailedLogin,
  clearLoginAttempts,
  comparePassword,
  createSessionToken,
  extractToken,
  verifySessionToken,
  AuthenticatedRequest
} from './auth.js';
import { getDashboardHtml, getLoginHtml } from './dashboardHtml.js';

const app = express();
app.set('trust proxy', 1);

// 1. Parser de Cookies httpOnly
app.use(cookieParser());

// 2. Parser JSON con captura de rawBody para verificación criptográfica de Meta
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// -------------------------------------------------------------
// Verificación Criptográfica X-Hub-Signature-256 (Meta Cloud API)
// -------------------------------------------------------------
function verifyMetaSignature(req: Request): boolean {
  if (!config.metaAppSecret || config.metaAppSecret.trim() === '') {
    // Si no se ha configurado META_APP_SECRET, se permite en desarrollo o modo fallback
    return true;
  }

  const signatureHeader = req.headers['x-hub-signature-256'] as string;
  if (!signatureHeader) {
    console.warn('[WEBHOOK SECURITY] Falta header X-Hub-Signature-256');
    return false;
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) return false;

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', config.metaAppSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch (_e) {
    return false;
  }
}

// -------------------------------------------------------------
// Rutas Públicas (Sin Autenticación)
// -------------------------------------------------------------

// Redirección raíz al Dashboard
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/dashboard');
});

// Health check para keep-alive externo (Render Free mitigation sin tocar DB)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'IMAGENTIA WhatsApp B2B Webhook',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    dbConnected: db.isConnected
  });
});

// Verificación inicial de handshake requerida por Meta for Developers
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

// Receptor de eventos y mensajes entrantes de WhatsApp
app.post('/webhook', async (req: Request, res: Response) => {
  // 1. Validar firma criptográfica de Meta si está configurado el secreto
  if (!verifyMetaSignature(req)) {
    console.warn('[WEBHOOK UNAUTHORIZED] Firma X-Hub-Signature-256 inválida o adulterada.');
    res.status(401).send('SIGNATURE_VERIFICATION_FAILED');
    return;
  }

  // 2. Retornar 200 OK inmediatamente a Meta (< 500 ms) para evitar reintentos
  res.status(200).send('EVENT_RECEIVED');

  // 3. Procesamiento asíncrono
  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;

        // Procesar mensajes entrantes del cliente
        const messages = value.messages || [];
        for (const message of messages) {
          await handleIncomingMessage(message);
        }

        // Procesar actualizaciones de estado (sent, delivered, read, failed)
        const statuses = value.statuses || [];
        for (const status of statuses) {
          await handleStatusUpdate(status);
        }
      }
    }
  } catch (err: any) {
    console.error('[WEBHOOK ASYNC PROCESSING ERROR]', err.message);
  }
});

// -------------------------------------------------------------
// Rutas de Autenticación y Sesión
// -------------------------------------------------------------

// Login con email + password y rate limit (5 intentos / 15 min)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (isLoginRateLimited(ip)) {
    res.status(429).json({
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Demasiados intentos fallidos. Por seguridad, intente nuevamente en 15 minutos.'
    });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'Email y contraseña requeridos.' });
    return;
  }

  const user = await db.findUserByEmail(email);
  if (!user) {
    recordFailedLogin(ip);
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' });
    return;
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    recordFailedLogin(ip);
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' });
    return;
  }

  clearLoginAttempts(ip);

  const sessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.display_name
  };

  const token = createSessionToken(sessionUser);

  // Cookie httpOnly, Secure en producción, SameSite=Lax para permitir navegación fluida tras login, 12h
  res.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: config.sessionDurationHours * 60 * 60 * 1000
  });

  res.json({
    success: true,
    user: sessionUser
  });
});

// Logout: invalidar cookie
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie(config.sessionCookieName);
  res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
});

// Perfil de la sesión activa
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// -------------------------------------------------------------
// Rutas Protegidas del Dashboard y API
// -------------------------------------------------------------

// Dashboard visual con verificación de sesión
app.get('/dashboard', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = token ? verifySessionToken(token) : null;

  // Si se solicita vía API (JSON) y no hay sesión -> 401 estricto
  if (req.headers.accept?.includes('application/json')) {
    if (!session) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Se requiere inicio de sesión.' });
      return;
    }
  }

  res.setHeader('Content-Type', 'text/html');

  if (!session) {
    // Si no está autenticado, renderizar la pantalla de login segura
    res.send(getLoginHtml());
  } else {
    // Si está autenticado, renderizar el dashboard operativo completo
    res.send(getDashboardHtml());
  }
});

// API de leads protegida (requiere sesión de admin o ventas)
app.get('/api/leads', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(store.getAllLeads());
});

app.get('/api/leads/:phone', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const phone = String(req.params.phone);
  const lead = store.getLead(phone);
  if (lead) {
    res.json(lead);
  } else {
    res.status(404).json({ error: 'Lead no encontrado' });
  }
});

// API de configuración sanitizada (Cero secretos ni tokens expuestos)
app.get('/api/config', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    intakeUrl: config.intakeUrl,
    sapiixSyncEnabled: config.sapiixSyncEnabled,
    dbConnected: db.isConnected,
    user: req.user,
    role: req.user?.role
  });
});

// Exportación CSV: Acceso exclusivo a Dirección General (admin)
app.get('/api/export/csv', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const leads = store.getAllLeads();
  let csv = 'phone,name,qualification,isHot,firstSeen,lastSeen,lastMessage\n';
  for (const l of leads) {
    csv += `"${l.phone}","${l.name || ''}","${l.qualification}",${l.isHot},"${l.firstSeen}","${l.lastSeen}","${l.lastMessage.replace(/"/g, '""')}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="imagentia_leads.csv"');
  res.send(csv);
});

// -------------------------------------------------------------
// Arranque del Servidor
// -------------------------------------------------------------
validateConfig();

db.init().then(() => {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 IMAGENTIA WhatsApp B2B Webhook Server activo`);
    console.log(`📡 Puerto: ${config.port}`);
    console.log(`🔗 Webhook URL: http://localhost:${config.port}/webhook`);
    console.log(`🔑 Verify Token: ${config.metaVerifyToken}`);
    console.log(`🔐 Autenticación: Bcrypt + HttpOnly Cookies (12h)`);
    console.log(`🛡️ Seguridad Webhook: X-Hub-Signature-256 habilitada`);
    console.log(`====================================================`);
  });
});
