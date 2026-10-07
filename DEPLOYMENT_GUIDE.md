# GUÍA DE DESPLIEGUE // WEBHOOK AUTÓNOMO 24/7 WHATSAPP B2B (IMAGENTIA)

Esta guía documenta la puesta en marcha del microservicio de respuesta automática para la **Meta WhatsApp Cloud API**, integrando la directiva comercial de Consultor Estratégico B2B, blindaje de tarifas y escalamiento de leads hacia Dirección General (Cristian).

---

## 1. Arquitectura del Sistema

```
[Prospecto en WhatsApp]
          │ (Mensaje de texto)
          ▼
[Meta Cloud API Gateway]
          │ (POST https://tu-dominio.com/webhook)
          ▼
[Microservicio Webhook (Node.js o n8n)]
          ├─► 1. Handshake de verificación (GET /webhook -> hub.challenge)
          ├─► 2. Confirmación de lectura (mark as read)
          ├─► 3. Memoria de conversación (últimos 10 mensajes)
          ├─► 4. Invocación LLM (Directiva B2B Consultiva + formato JSON)
          │
          ├─► [Evaluación de Calificación]
          │         ├─ is_hot: true / Ticket > $15k MXN ──► Alerta WhatsApp a Cristian
          │         └─ Prospecto calificado estándar ──► Enlace a imagentia.com.mx/intake
          ▼
[Despacho Outbound: POST /v21.0/{PHONE_ID}/messages]
          │
          ▼
[Respuesta Inmediata entregada al WhatsApp del Prospecto]
```

---

## 2. Variables de Entorno Requeridas (`.env`)

Crea un archivo `.env` en la raíz del servicio con la siguiente estructura:

```env
PORT=3000
META_VERIFY_TOKEN=imagentia_webhook_token_2026

# Credenciales Meta Cloud API
WHATSAPP_TOKEN=EAAUaIHJ4keQBSmeD5I3MQ48G2OrvBCZAcnxfzX3ZAH2cNaDm2G30MZAzC5dX7AkZBCISZA7hZBkeJr0YEmx3qEdBfMNcCeZAdkOsdot1UZBY7hoQ0bCOBzRNc7W0clOQBCgBodcynfO3a5Dq8zdMONeKrGozG4ZBHSZC8RqB1axmXM0ZCkildxBE4spvx2ZB2jerKwZDZD
WHATSAPP_PHONE_NUMBER_ID=716474751543311
WHATSAPP_WABA_ID=1407452683936580

# Proveedor de Inteligencia Artificial (OpenAI, Groq o compatible)
OPENAI_API_KEY=tu_clave_de_openai
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

# Teléfono personal de Cristian para alertas HOT (con lada, sin signos)
ADMIN_ALERT_PHONE=526641085327
INTAKE_URL=https://imagentia.com.mx/intake
```

---

## 3. Opciones de Ejecución y Despliegue

### Opción A: Prueba Local Inmediata con Túnel Seguro (Cloudflare / ngrok)

1. **Instalar dependencias y levantar el servidor:**
   ```bash
   npm install
   npm run dev
   ```
2. **Exponer el puerto 3000 a internet:**
   * Usando Cloudflare Tunnel (gratuito, sin límite de tiempo):
     ```bash
     cloudflared tunnel --url http://localhost:3000
     ```
   * O usando ngrok:
     ```bash
     ngrok http 3000
     ```
3. Copia la URL pública generada (ej. `https://random-subdomain.trycloudflare.com`).

---

### Opción B: Despliegue en Servidor / VPS (Docker Compose)

El proyecto incluye `Dockerfile` multi-stage y `docker-compose.yml`:

```bash
docker compose up -d --build
```

El contenedor reiniciará automáticamente ante caídas (`restart: always`).

---

### Opción C: Flujo Visual en n8n

Si utilizas tu propia infraestructura de **n8n**:
1. Entra a tu panel de n8n.
2. Ve a **Workflows** → **Import from File**.
3. Selecciona `n8n-imagentia-whatsapp-workflow.json`.
4. Define las variables de entorno o credenciales de OpenAI y Meta.
5. Activa el workflow (**Active: ON**).
6. Copia la URL de producción del nodo Webhook.

---

## 4. Configuración en Meta for Developers

1. Inicia sesión en [Meta for Developers](https://developers.facebook.com/).
2. Dirígete a tu App → **WhatsApp** → **Configuration** (o Configuración).
3. En la sección **Webhook**, haz clic en **Editar (Edit)**:
   * **URL de devolución de llamada (Callback URL):**  
     `https://tu-dominio-publico.com/webhook`
   * **Token de verificación (Verify Token):**  
     `imagentia_webhook_token_2026` *(o el valor configurado en META_VERIFY_TOKEN)*
4. Haz clic en **Verificar y guardar**. Meta ejecutará un `GET` inmediato para validar el token.
5. En **Campos de webhook (Webhook fields)**, haz clic en **Administrar (Manage)** y suscríbete al evento:
   * ✅ **`messages`** (Obligatorio).

---

## 5. Salida de Sandbox a Producción (Número Oficial IMAGENTIA)

El número actual (`+1 555-754-0088`) es un sandbox de prueba de Meta. Para recibir y contestar mensajes de clientes reales en WhatsApp:
1. En **Meta Business Suite** (`business.facebook.com`) → **Cuentas de WhatsApp** → Seleccionar WABA `1407452683936580`.
2. Añadir un número telefónico real (debe estar desvinculado de WhatsApp personal o Business app).
3. Verificar la titularidad del número mediante SMS o llamada.
4. Obtener el nuevo **`Phone Number ID`** del número en producción y actualizar la variable `WHATSAPP_PHONE_NUMBER_ID` en el archivo `.env`.
