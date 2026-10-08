# IMAGENTIA // WhatsApp B2B Consultative Webhook Service

Microservicio de alto rendimiento y arquitectura empresarial para calificación consultiva B2B de WhatsApp (Meta Cloud API Graph v21.0 + OpenAI GPT-4o-mini + Supabase Postgres), desplegado en Render con consola ejecutiva de monitoreo y toma de control humana.

---

## 1. Variables de Entorno (Environment Variables)

Configura estas variables en el panel de Render (**Environment** tab):

| Variable | Tipo | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- | :--- |
| `PORT` | Número | Puerto interno del contenedor | `10000` |
| `NODE_ENV` | String | Entorno de ejecución | `production` |
| `META_VERIFY_TOKEN` | String | Token de verificación para handshake de Meta | `imagentia_webhook_token_2026` |
| `META_APP_SECRET` | String | App Secret de Meta para validación criptográfica `X-Hub-Signature-256` | `(Secreto de App en Meta for Developers)` |
| `WHATSAPP_TOKEN` / `META_ACCESS_TOKEN` | String | Token permanente de System User de Conversions API | `EAAUaIHJ4keQBSv1...` |
| `PHONE_NUMBER_ID` | String | Phone Number ID en Meta de la línea dedicada | `1369166292941724` (+52 663 107 8176) |
| `WABA_ID` | String | WhatsApp Business Account ID | `1066647512848562` |
| `OPENAI_API_KEY` | String | API Key de OpenAI para inferencia con GPT-4o-mini | `sk-proj-...` |
| `OPENAI_BASE_URL` | String | URL base de OpenAI | `https://api.openai.com/v1` |
| `LLM_MODEL` | String | Modelo LLM conversacional | `gpt-4o-mini` |
| `SESSION_SECRET` | String | Secreto para firma de cookies JWT (12 horas) | `(String aleatorio de 64 caracteres)` |
| `DATABASE_URL` | String | Connection string de Supabase Postgres (Pooler puerto 6543) | `postgresql://postgres.[ref]:[pass]@aws-0-us-west-1.pooler.supabase.com:6543/postgres` |
| `ADMIN_ALERT_PHONE` | String | WhatsApp personal de Cristian para alertas HOT | `526644808790` |
| `ADMIN_INITIAL_EMAIL` | String | Correo del Director General (Rol: admin) | `cristian@imagentia.com.mx` |
| `ADMIN_INITIAL_PASSWORD` | String | Contraseña inicial de Cristian para consola | `CristianImagentia2026#` |
| `SALES_INITIAL_EMAIL` | String | Correo del Consultor de Ventas (Rol: ventas) | `angel@imagentia.com.mx` |
| `SALES_INITIAL_PASSWORD` | String | Contraseña inicial de Ángel para consola | `AngelImagentia2026#` |
| `INTAKE_URL` | String | Formulario técnico de levantamiento formal | `https://imagentia.com.mx/intake` |
| `SAPIIX_SYNC_ENABLED` | Boolean | Sincronización con CRM SAPIIX | `false` |

---

## 2. Comandos de Compilación y Arranque en Render

* **Build Command:** `npm install && npm run build`
* **Start Command:** `npm start`
* **Runtime:** Node.js v22 o Docker.

---

## 3. Mitigación de Render Free (Keep-Alive Externo)

El plan gratuito de Render suspende los contenedores tras 15 minutos sin tráfico entrante, causando una latencia de 40 a 55 segundos en la primera interacción.

Para mantener el servicio activo 24/7 sin costo adicional:
1. Crear una cuenta gratuita en [UptimeRobot](https://uptimerobot.com) o [cron-job.org](https://cron-job.org).
2. Configurar un monitor **HTTP(s)** con intervalo de **5 a 10 minutos**.
3. **URL objetivo:** `https://imagentia-wa-webhook.onrender.com/health`
4. Método: `GET` (el endpoint responde en < 10 ms con `{ "status": "online", "uptimeSeconds": ... }` sin sobrecargar la base de datos).

---

## 4. Configuración del Webhook en Meta for Developers

1. Entrar a [Meta Developers Console](https://developers.facebook.com/apps/1436101545333220/).
2. Ir a **WhatsApp > Configuración > Webhooks**.
3. **URL de devolución de llamada:** `https://imagentia-wa-webhook.onrender.com/webhook`
4. **Token de verificación:** `imagentia_webhook_token_2026`
5. Suscribir los siguientes campos del Webhook:
   * `messages` (Obligatorio: recepción de texto entrante y mensajes de clientes).
   * `message_template_status_update` (Actualizaciones de plantillas aprobadas).
6. El webhook de IMAGENTIA procesa de manera automática los eventos de `messages` y `statuses` (`sent`, `delivered`, `read`, `failed`).

---

## 5. Ruta de Migración a Render Starter (Sin Cambios de Código)

Para eliminar definitivamente las restricciones de CPU compartida y el riesgo de sleep sin requerir monitores externos:
1. En el Dashboard de Render, seleccionar el servicio `imagentia-wa-webhook`.
2. Ir a **Settings > Compute > Plan**.
3. Cambiar de **Free** a **Starter** ($7 USD / mes).
4. El cambio se aplica en caliente en segundos sin necesidad de modificar repositorios ni variables.

---

## 6. Esquema de Roles y Seguridad de Acceso

* **Admin (Cristian):** Control total, visualización de todos los leads, cambio de etapas, exportación CSV en `/api/export/csv`, configuración del sistema.
* **Ventas (Ángel):** Visualización de leads, toma de control en conversaciones, asignación de notas. Acceso restringido: bloqueado para exportaciones y configuración.
* **Seguridad:** Cookies `httpOnly`, `SameSite=Strict`, `Secure` en producción, con expiración de 12 horas. Rate limit estricto de 5 intentos fallidos cada 15 minutos por IP en `/api/auth/login`.
