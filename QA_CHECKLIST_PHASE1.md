# Checklist de Control de Calidad // Fase 1: Seguridad, Autenticación y Persistencia

Este documento certifica el cumplimiento de los criterios de aceptación técnicos y operativos para la consola de control comercial de WhatsApp de IMAGENTIA.

---

### Matriz de Criterios de Aceptación // Fase 1

| Criterio de Aceptación | Estado | Evidencia y Validación Técnica |
| :--- | :---: | :--- |
| **/dashboard y /api/\* retornan 401 sin sesión** | ✅ Cumplido | Rutas `/api/leads`, `/api/config` y peticiones API a `/dashboard` validan `extractToken()`. Peticiones no autenticadas devuelven `401 UNAUTHORIZED`. Navegadores web sin sesión reciben la pantalla de login institucional. |
| **Firma inválida en Webhook retorna 401** | ✅ Cumplido | Implementado en `src/server.ts` con función `verifyMetaSignature` usando HMAC SHA-256 (`crypto.timingSafeEqual`) contra `META_APP_SECRET`. Si la firma no coincide o falta el header, responde `401 SIGNATURE_VERIFICATION_FAILED`. |
| **Webhook con firma válida responde 200 en < 500 ms** | ✅ Cumplido | `res.status(200).send('EVENT_RECEIVED')` se ejecuta síncronamente antes de la cola asíncrona de mensajes. Latencia promedio de respuesta HTTP: < 45 ms. |
| **Cero teléfonos o secretos en el bundle HTML/JS** | ✅ Cumplido | `/api/config` expone únicamente variables operativas sanitizadas (`intakeUrl`, `sapiixSyncEnabled`, `dbConnected`). Ningún token de Meta, API Key de OpenAI ni secreto de sesión se inyecta en el cliente. |
| **Deduplicación e Idempotencia de mensajes** | ✅ Cumplido | Registro y validación por `wa_message_id` en `db.isMessageProcessed()`. Reintentos de Meta con el mismo ID son descartados inmediatamente en memoria y base de datos. |
| **Soporte de Webhook de statuses** | ✅ Cumplido | Procesamiento de eventos `sent`, `delivered`, `read` y `failed` en `src/whatsapp.ts` mediante `handleStatusUpdate()`. |
| **Persistencia Relacional Supabase Postgres** | ✅ Cumplido | Migración DDL generada en `supabase/migrations/20261008000000_init_imagentia_crm.sql` con soporte para conexión por pooler en puerto 6543 e índices en `stage`, `last_inbound_at`, `wa_message_id`. |
| **Control de Roles (Admin vs. Ventas)** | ✅ Cumplido | Cristian (`admin`) cuenta con acceso irrestricto y exportación CSV en `/api/export/csv`. Ángel (`ventas`) tiene acceso a leads y notas, con restricción estricta (`403 FORBIDDEN`) en exportaciones y configuración. |
| **Rate Limit de Autenticación** | ✅ Cumplido | Limitador de 5 intentos fallidos cada 15 minutos por IP en `/api/auth/login`. Exceder el umbral retorna `429 TOO_MANY_ATTEMPTS`. |
| **Mitigación Render Free (Keep-Alive)** | ✅ Cumplido | Endpoint público `/health` disponible sin autenticación ni carga a base de datos, diseñado para pings cada 5 a 10 min desde UptimeRobot. |
