import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'imagentia_webhook_token_2026',
  whatsappToken: process.env.WHATSAPP_TOKEN || '',
  whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsappWabaId: process.env.WHATSAPP_WABA_ID || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
  adminAlertPhone: process.env.ADMIN_ALERT_PHONE || '',
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
