import dotenv from 'dotenv';

dotenv.config();

// Token definitivo verificado de Conversions API System User (Never Expires)
const PERMANENT_SYSTEM_USER_TOKEN = 'EAAUaIHJ4keQBSv1FSpiHxcpNsgzmtAND2jmcKZAydHkRECUwUzjmlqGY9lwIiPciJqkumHSdotgphCDqlls3yHXm9UAoDRWeaTZAjKZBVbe40u1TvKyiQhhntugzZAWKpuEfAxBz2agA9HXmKZBYld5mxrXNZCwYne02ol5oNh9T9qR1S6RIV8HWJ61zGj8QZDZD';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'imagentia_webhook_token_2026',
  // Blindaje absoluto: Usar siempre el token permanente del System User
  whatsappToken: PERMANENT_SYSTEM_USER_TOKEN,
  whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1369166292941724',
  whatsappWabaId: process.env.WHATSAPP_WABA_ID || '1066647512848562',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
  adminAlertPhone: process.env.ADMIN_ALERT_PHONE || '526644808790',
  intakeUrl: process.env.INTAKE_URL || 'https://imagentia.com.mx/intake',
};

export function validateConfig(): void {
  const missing: string[] = [];
  if (!config.whatsappToken) missing.push('WHATSAPP_TOKEN');
  if (!config.whatsappPhoneId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!config.openaiApiKey) missing.push('OPENAI_API_KEY');

  if (missing.length > 0) {
    console.warn(`[CONFIG WARNING] Faltan variables críticas: ${missing.join(', ')}`);
  }
}
