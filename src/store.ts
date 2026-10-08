import fs from 'fs';
import path from 'path';

export interface MessageRecord {
  id: string;
  sender: 'prospect' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

export type LeadQualification = 'HOT' | 'WARM' | 'NURTURE' | 'LOW' | 'QUALIFIED' | 'DISQUALIFIED';

export interface LeadRecord {
  phone: string;
  name?: string;
  firstSeen: string;
  lastSeen: string;
  lastMessage: string;
  qualification: LeadQualification;
  isHot: boolean;
  reason: string;
  messages: MessageRecord[];
  escalated: boolean;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

class Store {
  private leads: Map<string, LeadRecord> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        for (const item of parsed) {
          this.leads.set(item.phone, item);
        }
      } else {
        // Inicializar con historial previo de la sesión
        this.seedInitialData();
      }
    } catch (err: any) {
      console.warn('[STORE INIT WARNING]', err.message);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    const seed: LeadRecord[] = [
      {
        phone: '527445000915',
        name: 'Diana Rico (Grupo Corporativo)',
        firstSeen: '2026-10-07T16:13:44.000Z',
        lastSeen: '2026-10-07T16:52:00.000Z',
        lastMessage: 'Requerimos cotizar infraestructura de automatización para 12 sucursales con base de datos central',
        qualification: 'HOT',
        isHot: true,
        reason: 'Empresa multi-sucursal con requerimiento de infraestructura y presupuesto corporativo > $15,000 MXN.',
        escalated: true,
        messages: [
          {
            id: 'seed-1',
            sender: 'prospect',
            text: 'Hola, me interesa saber precios para la infraestructura web de mi empresa',
            timestamp: '2026-10-07T16:13:44.000Z'
          },
          {
            id: 'seed-2',
            sender: 'agent',
            text: 'En IMAGENTIA no vendemos plantillas ni servicios aislados por catálogo; diseñamos arquitectura digital estratégica. Para dimensionar el alcance, ¿cuántas sucursales o unidades operativas integrará el proyecto?',
            timestamp: '2026-10-07T16:13:48.000Z'
          },
          {
            id: 'seed-3',
            sender: 'prospect',
            text: 'Requerimos cotizar infraestructura de automatización para 12 sucursales con base de datos central',
            timestamp: '2026-10-07T16:52:00.000Z'
          },
          {
            id: 'seed-4',
            sender: 'agent',
            text: 'Excelente. Dado el volumen operativo de 12 sucursales y la centralización de datos, esto califica para una sesión de arquitectura técnica con nuestro Director Cristian. ¿Te queda mejor mañana a las 11:00 AM o 4:00 PM?',
            timestamp: '2026-10-07T16:52:05.000Z'
          }
        ]
      },
      {
        phone: '526644808790',
        name: 'Cristian (Validación Operativa)',
        firstSeen: '2026-10-07T17:19:04.000Z',
        lastSeen: '2026-10-07T17:19:59.000Z',
        lastMessage: 'No tengo clientes',
        qualification: 'LOW',
        isHot: false,
        reason: 'Prospecto en etapa temprana de captación sin volumen inicial definido.',
        escalated: false,
        messages: [
          {
            id: 'seed-5',
            sender: 'prospect',
            text: 'Hola me interesa saber precios para automatizar mi empresa',
            timestamp: '2026-10-07T17:19:04.000Z'
          },
          {
            id: 'seed-6',
            sender: 'agent',
            text: 'No vendemos servicios aislados, desarrollamos ecosistemas digitales y de automatización. Para saber si podemos ayudarlos, ¿cuál es el cuello de botella principal que tienen hoy en su captación o conversión de clientes?',
            timestamp: '2026-10-07T17:19:10.000Z'
          },
          {
            id: 'seed-7',
            sender: 'prospect',
            text: 'No tengo clientes',
            timestamp: '2026-10-07T17:19:56.000Z'
          },
          {
            id: 'seed-8',
            sender: 'agent',
            text: 'Es el cuello de botella más común. Cuando eso pasa, el problema suele estar en la atracción o en la conversión. ¿Dónde sienten que se atoran más?',
            timestamp: '2026-10-07T17:19:59.000Z'
          }
        ]
      }
    ];

    for (const s of seed) {
      this.leads.set(s.phone, s);
    }
    this.persist();
  }

  private persist() {
    try {
      const data = Array.from(this.leads.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[STORE PERSIST ERROR]', err.message);
    }
  }

  public recordMessage(
    phone: string,
    sender: 'prospect' | 'agent' | 'system',
    text: string,
    qualification?: LeadQualification,
    isHot?: boolean,
    reason?: string
  ): LeadRecord {
    const now = new Date().toISOString();
    let lead = this.leads.get(phone);

    if (!lead) {
      lead = {
        phone,
        firstSeen: now,
        lastSeen: now,
        lastMessage: text,
        qualification: qualification || 'WARM',
        isHot: !!isHot,
        reason: reason || 'En proceso de evaluación B2B',
        escalated: !!isHot,
        messages: []
      };
    } else {
      lead.lastSeen = now;
      lead.lastMessage = text;
      if (qualification) lead.qualification = qualification;
      if (isHot !== undefined) {
        lead.isHot = isHot;
        if (isHot) lead.escalated = true;
      }
      if (reason) lead.reason = reason;
    }

    lead.messages.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      text,
      timestamp: now
    });

    this.leads.set(phone, lead);
    this.persist();
    return lead;
  }

  public getAllLeads(): LeadRecord[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
  }

  public getLead(phone: string): LeadRecord | undefined {
    return this.leads.get(phone);
  }
}

export const store = new Store();
