import dotenv from 'dotenv';

dotenv.config();

// Token definitivo verificado de Conversions API System User (Never Expires)
const PERMANENT_SYSTEM_USER_TOKEN = 'EAAUaIHJ4keQBSv1FSpiHxcpNsgzmtAND2jmcKZAydHkRECUwUzjmlqGY9lwIiPciJqkumHSdotgphCDqlls3yHXm9UAoDRWeaTZAjKZBVbe40u1TvKyiQhhntugzZAWKpuEfAxBz2agA9HXmKZBYld5mxrXNZCwYne02ol5oNh9T9qR1S6RIV8HWJ61zGj8QZDZD';

export const config = {
  port: parseInt(process.env.PORT || '10000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Meta Cloud API
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'imagentia_webhook_token_2026',
  metaAppSecret: process.env.META_APP_SECRET || '',
  whatsappToken: process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || PERMANENT_SYSTEM_USER_TOKEN,
  whatsappPhoneId: process.env.PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || '1369166292941724',
  whatsappWabaId: process.env.WABA_ID || process.env.WHATSAPP_WABA_ID || '1066647512848562',
  
  // OpenAI LLM
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
  
  // Seguridad y Sesiones
  sessionSecret: process.env.SESSION_SECRET || 'imagentia_executive_vault_session_secret_2026_jwt_token',
  sessionCookieName: 'imagentia_session',
  sessionDurationHours: 12,
  
  // Base de Datos Supabase Postgres
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Credenciales iniciales para Seed de Operadores
  adminInitialEmail: process.env.ADMIN_INITIAL_EMAIL || 'cristian@imagentia.com.mx',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'CristianImagentia2026#',
  salesInitialEmail: process.env.SALES_INITIAL_EMAIL || 'angel@imagentia.com.mx',
  salesInitialPassword: process.env.SALES_INITIAL_PASSWORD || 'AngelImagentia2026#',
  
  // Alertas y Trazabilidad B2B
  adminAlertPhone: process.env.ADMIN_ALERT_PHONE || '526644808790',
  intakeUrl: process.env.INTAKE_URL || 'https://imagentia.com.mx/intake',
  sapiixSyncEnabled: process.env.SAPIIX_SYNC_ENABLED === 'true'
};

export function validateConfig(): void {
  const missing: string[] = [];
  if (!config.whatsappToken) missing.push('WHATSAPP_TOKEN / META_ACCESS_TOKEN');
  if (!config.whatsappPhoneId) missing.push('WHATSAPP_PHONE_NUMBER_ID / PHONE_NUMBER_ID');
  if (!config.openaiApiKey) missing.push('OPENAI_API_KEY');

  if (missing.length > 0) {
    console.warn(`[CONFIG WARNING] Faltan variables críticas: ${missing.join(', ')}`);
  }
}
