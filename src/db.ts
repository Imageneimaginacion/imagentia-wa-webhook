import pg from 'pg';
import { config } from './config.js';
import { hashPassword, UserRole } from './auth.js';
import { store, LeadRecord } from './store.js';

const { Pool } = pg;

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  display_name: string;
  created_at: string;
}

export interface DbLead {
  id: string;
  phone: string;
  wa_profile_name?: string;
  name?: string;
  company?: string;
  industry?: string;
  service_interest?: string;
  budget_range?: string;
  timeline?: string;
  is_decision_maker: boolean;
  score: number;
  stage: string;
  lost_reason?: string;
  source: string;
  ctwa_clid?: string;
  ad_id?: string;
  assigned_to?: string;
  bot_paused: boolean;
  bot_paused_by?: string;
  bot_paused_at?: string;
  last_inbound_at: string;
  last_outbound_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  lead_id: string;
  sender: 'prospect' | 'bot' | 'human' | 'system';
  author_id?: string;
  text: string;
  media_id?: string;
  media_mime?: string;
  wa_message_id?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  error_code?: string;
  created_at: string;
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  public isConnected: boolean = false;
  // Conjunto en memoria para deduplicación ultra rápida de wa_message_id
  private processedMessageIds: Set<string> = new Set();

  // Usuarios en memoria de respaldo si Supabase no está configurado aún
  private fallbackUsers: Map<string, DbUser> = new Map();

  constructor() {
    this.initPool();
  }

  private initPool() {
    if (!config.databaseUrl || config.databaseUrl.trim() === '') {
      console.warn('[DB NOTICE] DATABASE_URL no provisto. Operando con almacén híbrido seguro y usuarios en memoria.');
      this.seedFallbackUsers();
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false }, // Requerido por Supabase Connection Pooler (puerto 6543)
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      this.pool.on('error', (err) => {
        console.error('[DB POOL ERROR]', err.message);
      });
    } catch (err: any) {
      console.error('[DB INIT ERROR]', err.message);
    }
  }

  public async init(): Promise<void> {
    if (this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          const res = await client.query('SELECT current_database(), now()');
          this.isConnected = true;
          console.log(`[DB CONNECTED] Supabase Postgres activo: ${res.rows[0].current_database}`);
          await this.ensureTablesAndSeed(client);
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn(`[DB CONNECTION WARNING] No fue posible conectar a Supabase: ${err.message}. Continuando con almacén en memoria.`);
        this.isConnected = false;
        await this.seedFallbackUsers();
      }
    } else {
      await this.seedFallbackUsers();
    }
  }

  private async ensureTablesAndSeed(client: pg.PoolClient) {
    // 1. Asegurar tablas mínimas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'ventas')),
        display_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 2. Seed de Cristian y Ángel
    const adminHash = await hashPassword(config.adminInitialPassword);
    const salesHash = await hashPassword(config.salesInitialPassword);

    await client.query(`
      INSERT INTO users (email, password_hash, role, display_name)
      VALUES ($1, $2, 'admin', 'Cristian (Director)')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, [config.adminInitialEmail, adminHash]);

    await client.query(`
      INSERT INTO users (email, password_hash, role, display_name)
      VALUES ($1, $2, 'ventas', 'Ángel (Ventas B2B)')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, [config.salesInitialEmail, salesHash]);

    console.log('[DB SEED] Usuarios operativos iniciales (Cristian Admin & Ángel Ventas) verificados en Supabase.');
  }

  private async seedFallbackUsers() {
    const adminHash = await hashPassword(config.adminInitialPassword);
    const salesHash = await hashPassword(config.salesInitialPassword);

    this.fallbackUsers.set(config.adminInitialEmail.toLowerCase(), {
      id: 'usr-admin-cristian-01',
      email: config.adminInitialEmail.toLowerCase(),
      password_hash: adminHash,
      role: 'admin',
      display_name: 'Cristian (Director)',
      created_at: new Date().toISOString()
    });

    this.fallbackUsers.set(config.salesInitialEmail.toLowerCase(), {
      id: 'usr-sales-angel-02',
      email: config.salesInitialEmail.toLowerCase(),
      password_hash: salesHash,
      role: 'ventas',
      display_name: 'Ángel (Ventas B2B)',
      created_at: new Date().toISOString()
    });

    console.log('[AUTH SEED] Operadores iniciales listos: Cristian (admin) y Ángel (ventas).');
  }

  // -----------------------------------------------------------------
  // Deduplicación e Idempotencia (Meta reintentos)
  // -----------------------------------------------------------------
  public isMessageProcessed(waMessageId: string | undefined): boolean {
    if (!waMessageId) return false;
    return this.processedMessageIds.has(waMessageId);
  }

  public markMessageProcessed(waMessageId: string | undefined): void {
    if (!waMessageId) return;
    this.processedMessageIds.add(waMessageId);
    // Limitar tamaño de la caché en memoria a los últimos 10,000 IDs
    if (this.processedMessageIds.size > 10000) {
      const first = this.processedMessageIds.values().next().value;
      if (first) this.processedMessageIds.delete(first);
    }
  }

  // -----------------------------------------------------------------
  // Repositorio de Usuarios
  // -----------------------------------------------------------------
  public async findUserByEmail(email: string): Promise<DbUser | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err: any) {
        console.error('[DB QUERY ERROR: findUserByEmail]', err.message);
      }
    }

    return this.fallbackUsers.get(cleanEmail) || null;
  }

  public async findUserById(id: string): Promise<DbUser | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err: any) {
        console.error('[DB QUERY ERROR: findUserById]', err.message);
      }
    }

    for (const u of this.fallbackUsers.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  // -----------------------------------------------------------------
  // Repositorio de Leads & Mensajes
  // -----------------------------------------------------------------
  public async getLeads(): Promise<LeadRecord[]> {
    return store.getAllLeads();
  }

  public async updateMessageStatus(waMessageId: string, status: 'sent' | 'delivered' | 'read' | 'failed', errorCode?: string): Promise<void> {
    console.log(`[STATUS UPDATE] wa_msg_id: ${waMessageId} -> ${status}${errorCode ? ` (error: ${errorCode})` : ''}`);
    // Si la DB está activa, actualizar el registro
    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          'UPDATE messages SET status = $1, error_code = $2 WHERE wa_message_id = $3',
          [status, errorCode || null, waMessageId]
        );
      } catch (err: any) {
        console.error('[DB STATUS UPDATE ERROR]', err.message);
      }
    }
  }
}

export const db = new DatabaseService();
