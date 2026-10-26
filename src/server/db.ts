import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
}

export interface HabitGroup {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

export interface Habit {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  description?: string;
  type: 'positivo' | 'negativo';
  frequency: string;
  daysOfWeek: number[]; // 0 = Dom, 1 = Seg, ...
  reminderTime?: string;
  order: number;
  archived: boolean;
  createdAt: string;
}

export type HabitEntryStatus = 'concluido' | 'nao_concluido' | 'evitado' | 'ocorrido' | 'nao_aplica' | 'nao_respondido';

export interface HabitEntry {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitEntryStatus;
  notes?: string;
  updatedAt: string;
}

export interface ExceptionalDay {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  reason: 'trabalho' | 'viagem' | 'compromisso' | 'outro';
  notes?: string;
  excludedGroupIds?: string[];
  createdAt: string;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface DailyRoutine {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  daysOfWeek: number[];
  category: string;
  color: string;
  notificationEnabled: boolean;
  reminderMinutes: number;
  items: RoutineItem[];
  active: boolean;
}

export interface RecurringTask {
  id: string;
  userId: string;
  title: string;
  frequency: 'diaria' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
  ruleDescription: string;
  nextDueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  status: 'pendente' | 'concluida' | 'adiada';
  lastCompletedDate?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  ageText: string;
  relationship: string;
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  memberId: string;
  name: string;
  dosage: string;
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  instructions: string;
  notificationEnabled: boolean;
  active: boolean;
  createdAt: string;
}

export interface MedicationDose {
  id: string;
  userId: string;
  medicationId: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string;
  status: 'administrado' | 'pendente' | 'recusado' | 'omitido';
  recordedAt?: string;
  recordedBy?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'habito' | 'rotina' | 'medicamento' | 'compromisso' | 'sistema';
  actionUrl?: string;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  theme: 'claro' | 'escuro' | 'sistema';
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AccountLink {
  id: string;
  userId: string;
  linkedEmail: string;
  linkedUserId?: string;
  status: 'ativo' | 'pendente';
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  habitGroups: HabitGroup[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  exceptionalDays: ExceptionalDay[];
  dailyRoutines: DailyRoutine[];
  recurringTasks: RecurringTask[];
  familyMembers: FamilyMember[];
  medications: Medication[];
  medicationDoses: MedicationDose[];
  notifications: AppNotification[];
  preferences: UserPreferences[];
  auditLogs: AuditLog[];
  accountLinks: AccountLink[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rotinapp_db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [],
  habitGroups: [],
  habits: [],
  habitEntries: [],
  exceptionalDays: [],
  dailyRoutines: [],
  recurringTasks: [],
  familyMembers: [],
  medications: [],
  medicationDoses: [],
  notifications: [],
  preferences: [],
  auditLogs: [],
  accountLinks: []
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading database file, initializing fresh:', e);
        this.data = { ...INITIAL_DB };
        this.save();
      }
    } else {
      this.data = { ...INITIAL_DB };
      this.save();
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public save(): void {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public logAudit(userId: string, action: string, details: string): void {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // Keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.length = 500;
    }
    this.save();
  }

  public seedBrendaData(userId: string): void {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();

    // 1. Grupos de Hábitos
    const groups: HabitGroup[] = [
      { id: `grp_casa_${userId}`, userId, name: 'Casa', icon: 'Home', color: '#52B788', order: 1 },
      { id: `grp_eu_${userId}`, userId, name: 'Eu', icon: 'User', color: '#40916C', order: 2 },
      { id: `grp_maternidade_${userId}`, userId, name: 'Maternidade', icon: 'Heart', color: '#E76F51', order: 3 },
      { id: `grp_relacionamentos_${userId}`, userId, name: 'Relacionamentos', icon: 'Users', color: '#2A9D8F', order: 4 },
      { id: `grp_trabalho_${userId}`, userId, name: 'Trabalho', icon: 'Briefcase', color: '#264653', order: 5 },
      { id: `grp_saude_${userId}`, userId, name: 'Saúde', icon: 'Activity', color: '#10B981', order: 6 },
    ];
    this.data.habitGroups = this.data.habitGroups.filter(g => g.userId !== userId).concat(groups);

    // 2. Hábitos
    const habits: Habit[] = [
      {
        id: `h1_${userId}`,
        userId,
        groupId: `grp_eu_${userId}`,
        name: 'Beber água',
        description: 'Meta de 2.5L ao longo do dia',
        type: 'positivo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '09:00',
        order: 1,
        archived: false,
        createdAt: today
      },
      {
        id: `h2_${userId}`,
        userId,
        groupId: `grp_eu_${userId}`,
        name: 'Fazer atividade física',
        description: 'Caminhada ou pilates 30 minutos',
        type: 'positivo',
        frequency: 'Diária',
        daysOfWeek: [1, 2, 3, 4, 5],
        reminderTime: '07:30',
        order: 2,
        archived: false,
        createdAt: today
      },
      {
        id: `h3_${userId}`,
        userId,
        groupId: `grp_maternidade_${userId}`,
        name: 'Ser paciente com as crianças',
        description: 'Respirar fundo antes de responder nas birras',
        type: 'positivo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '17:00',
        order: 3,
        archived: false,
        createdAt: today
      },
      {
        id: `h4_${userId}`,
        userId,
        groupId: `grp_eu_${userId}`,
        name: 'Evitar redes sociais',
        description: 'Não usar celular na primeira hora após acordar',
        type: 'negativo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '06:30',
        order: 4,
        archived: false,
        createdAt: today
      },
      {
        id: `h5_${userId}`,
        userId,
        groupId: `grp_relacionamentos_${userId}`,
        name: 'Falar com calma',
        description: 'Tom de voz acolhedor nas conversas em família',
        type: 'positivo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        order: 5,
        archived: false,
        createdAt: today
      },
      {
        id: `h6_${userId}`,
        userId,
        groupId: `grp_eu_${userId}`,
        name: 'Comer doces em excesso',
        description: 'Evitar açúcar refinado à tarde e à noite',
        type: 'negativo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        order: 6,
        archived: false,
        createdAt: today
      },
      {
        id: `h7_${userId}`,
        userId,
        groupId: `grp_casa_${userId}`,
        name: 'Manter a pia limpa à noite',
        description: 'Organizar a cozinha antes de deitar',
        type: 'positivo',
        frequency: 'Diária',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '21:00',
        order: 7,
        archived: false,
        createdAt: today
      },
      {
        id: `h8_${userId}`,
        userId,
        groupId: `grp_trabalho_${userId}`,
        name: 'Encerrar o expediente no horário',
        description: 'Evitar levar demandas do trabalho para o jantar',
        type: 'negativo',
        frequency: 'Dias úteis',
        daysOfWeek: [1, 2, 3, 4, 5],
        reminderTime: '18:00',
        order: 8,
        archived: false,
        createdAt: today
      }
    ];
    this.data.habits = this.data.habits.filter(h => h.userId !== userId).concat(habits);

    // 3. Entradas Diárias de Hábitos (para hoje e últimos 7 dias)
    const habitEntries: HabitEntry[] = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);

      // Hoje: 8 positivos feitos, 2 negativos evitados
      habits.forEach(h => {
        let status: HabitEntryStatus = 'nao_respondido';
        if (h.type === 'positivo') {
          status = Math.random() > 0.15 ? 'concluido' : 'nao_concluido';
        } else {
          status = Math.random() > 0.2 ? 'evitado' : 'ocorrido';
        }

        // For today, force values matching the screen mockup
        if (dayOffset === 0) {
          if (h.id === `h1_${userId}`) status = 'concluido';
          if (h.id === `h2_${userId}`) status = 'concluido';
          if (h.id === `h3_${userId}`) status = 'concluido';
          if (h.id === `h4_${userId}`) status = 'evitado';
          if (h.id === `h5_${userId}`) status = 'concluido';
          if (h.id === `h6_${userId}`) status = 'evitado';
          if (h.id === `h7_${userId}`) status = 'concluido';
          if (h.id === `h8_${userId}`) status = 'evitado';
        }

        habitEntries.push({
          id: `entry_${h.id}_${dateStr}`,
          userId,
          habitId: h.id,
          date: dateStr,
          status,
          updatedAt: new Date().toISOString()
        });
      });
    }
    this.data.habitEntries = this.data.habitEntries.filter(e => e.userId !== userId).concat(habitEntries);

    // 4. Rotinas Diárias
    const routines: DailyRoutine[] = [
      {
        id: `rot_manha_${userId}`,
        userId,
        title: 'Rotina da manhã',
        description: 'Começar o dia com calma e clareza',
        startTime: '06:00',
        endTime: '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        category: 'Manhã',
        color: '#2D6A4F',
        notificationEnabled: true,
        reminderMinutes: 10,
        active: true,
        items: [
          { id: 'i1', routineId: `rot_manha_${userId}`, title: 'Acordar', completed: true, order: 1 },
          { id: 'i2', routineId: `rot_manha_${userId}`, title: 'Higiene pessoal', completed: true, order: 2 },
          { id: 'i3', routineId: `rot_manha_${userId}`, title: 'Café da manhã nutritivo', completed: true, order: 3 },
          { id: 'i4', routineId: `rot_manha_${userId}`, title: 'Organizar a casa', completed: true, order: 4 }
        ]
      },
      {
        id: `rot_trabalho_${userId}`,
        userId,
        title: 'Trabalho e Foco',
        description: 'Bloco de produtividade',
        startTime: '08:30',
        endTime: '12:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        category: 'Trabalho',
        color: '#2A9D8F',
        notificationEnabled: true,
        reminderMinutes: 15,
        active: true,
        items: [
          { id: 'i5', routineId: `rot_trabalho_${userId}`, title: 'Revisar pendências do dia', completed: true, order: 1 },
          { id: 'i6', routineId: `rot_trabalho_${userId}`, title: 'Executar tarefa principal', completed: false, order: 2 }
        ]
      },
      {
        id: `rot_almoco_${userId}`,
        userId,
        title: 'Almoço em família',
        description: 'Pausa para recarregar as energias',
        startTime: '12:00',
        endTime: '13:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        category: 'Saúde',
        color: '#E76F51',
        notificationEnabled: true,
        reminderMinutes: 5,
        active: true,
        items: [
          { id: 'i7', routineId: `rot_almoco_${userId}`, title: 'Almoçar sem telas', completed: false, order: 1 }
        ]
      },
      {
        id: `rot_tarde_${userId}`,
        userId,
        title: 'Tarde livre / Atividades',
        description: 'Acompanhamento escolar e compromissos',
        startTime: '13:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        category: 'Família',
        color: '#F4A261',
        notificationEnabled: false,
        reminderMinutes: 10,
        active: true,
        items: [
          { id: 'i8', routineId: `rot_tarde_${userId}`, title: 'Ajudar no dever de casa', completed: false, order: 1 },
          { id: 'i9', routineId: `rot_tarde_${userId}`, title: 'Lanche saudável', completed: false, order: 2 }
        ]
      },
      {
        id: `rot_noite_${userId}`,
        userId,
        title: 'Rotina da noite',
        description: 'Desacelerar e preparar para dormir',
        startTime: '19:00',
        endTime: '22:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        category: 'Noite',
        color: '#1B4332',
        notificationEnabled: true,
        reminderMinutes: 15,
        active: true,
        items: [
          { id: 'i10', routineId: `rot_noite_${userId}`, title: 'Jantar em família', completed: false, order: 1 },
          { id: 'i11', routineId: `rot_noite_${userId}`, title: 'Banho das crianças', completed: false, order: 2 },
          { id: 'i12', routineId: `rot_noite_${userId}`, title: 'Contar história antes de dormir', completed: false, order: 3 },
          { id: 'i13', routineId: `rot_noite_${userId}`, title: 'Desconectar aparelhos eletrônicos', completed: false, order: 4 }
        ]
      }
    ];
    this.data.dailyRoutines = this.data.dailyRoutines.filter(r => r.userId !== userId).concat(routines);

    // 5. Tarefas Recorrentes
    const tasks: RecurringTask[] = [
      {
        id: `tsk1_${userId}`,
        userId,
        title: 'Unhas',
        frequency: 'semanal',
        ruleDescription: 'Toda segunda-feira',
        nextDueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        daysRemaining: 2,
        status: 'pendente',
        createdAt: today
      },
      {
        id: `tsk2_${userId}`,
        userId,
        title: 'Pesar as crianças',
        frequency: 'trimestral',
        ruleDescription: 'A cada 3 meses',
        nextDueDate: new Date(Date.now() + 70 * 86400000).toISOString().slice(0, 10),
        daysRemaining: 70,
        status: 'pendente',
        createdAt: today
      },
      {
        id: `tsk3_${userId}`,
        userId,
        title: 'Consulta médica de rotina',
        frequency: 'mensal',
        ruleDescription: 'Todo dia 15',
        nextDueDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
        daysRemaining: 12,
        status: 'pendente',
        createdAt: today
      },
      {
        id: `tsk4_${userId}`,
        userId,
        title: 'Limpeza geral da casa',
        frequency: 'semanal',
        ruleDescription: 'Toda sexta-feira',
        nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        daysRemaining: 5,
        status: 'pendente',
        createdAt: today
      }
    ];
    this.data.recurringTasks = this.data.recurringTasks.filter(t => t.userId !== userId).concat(tasks);

    // 6. Membros da Família
    const family: FamilyMember[] = [
      {
        id: `fam_ana_${userId}`,
        userId,
        name: 'Ana',
        ageText: '8 anos',
        relationship: 'Filha',
        avatarUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=150&q=80',
        notes: 'Alergia a amendoim',
        createdAt: today
      },
      {
        id: `fam_pedro_${userId}`,
        userId,
        name: 'Pedro',
        ageText: '5 anos',
        relationship: 'Filho',
        avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
        notes: 'Gosta de futebol',
        createdAt: today
      },
      {
        id: `fam_lucas_${userId}`,
        userId,
        name: 'Lucas',
        ageText: '2 anos',
        relationship: 'Filho',
        avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=150&q=80',
        notes: 'Fase de introdução alimentar',
        createdAt: today
      }
    ];
    this.data.familyMembers = this.data.familyMembers.filter(m => m.userId !== userId).concat(family);

    // 7. Medicamentos
    const medications: Medication[] = [
      {
        id: `med_ana_${userId}`,
        userId,
        memberId: `fam_ana_${userId}`,
        name: 'Antitérmico / Paracetamol',
        dosage: '10ml',
        scheduleTimes: ['08:00', '12:00', '16:00'],
        instructions: 'Se apresentar febre acima de 37.8°C',
        notificationEnabled: true,
        active: true,
        createdAt: today
      },
      {
        id: `med_pedro_${userId}`,
        userId,
        memberId: `fam_pedro_${userId}`,
        name: 'Vitamina D',
        dosage: '4 gotas',
        scheduleTimes: ['08:00'],
        instructions: 'Tomar pela manhã com suco ou leite',
        notificationEnabled: true,
        active: true,
        createdAt: today
      },
      {
        id: `med_lucas_${userId}`,
        userId,
        memberId: `fam_lucas_${userId}`,
        name: 'Amoxicilina',
        dosage: '5ml',
        scheduleTimes: ['08:00', '20:00'],
        instructions: 'Após as refeições. Manter na geladeira.',
        notificationEnabled: true,
        active: true,
        createdAt: today
      }
    ];
    this.data.medications = this.data.medications.filter(m => m.userId !== userId).concat(medications);

    // 8. Doses de hoje (Hoje: Ana 2/3, Pedro 1/1, Lucas 0/2)
    const doses: MedicationDose[] = [
      {
        id: `dose_1`,
        userId,
        medicationId: `med_ana_${userId}`,
        memberId: `fam_ana_${userId}`,
        date: today,
        scheduledTime: '08:00',
        status: 'administrado',
        recordedAt: `${today}T08:05:00Z`,
        recordedBy: 'Brenda'
      },
      {
        id: `dose_2`,
        userId,
        medicationId: `med_ana_${userId}`,
        memberId: `fam_ana_${userId}`,
        date: today,
        scheduledTime: '12:00',
        status: 'administrado',
        recordedAt: `${today}T12:10:00Z`,
        recordedBy: 'Brenda'
      },
      {
        id: `dose_3`,
        userId,
        medicationId: `med_ana_${userId}`,
        memberId: `fam_ana_${userId}`,
        date: today,
        scheduledTime: '16:00',
        status: 'pendente'
      },
      {
        id: `dose_4`,
        userId,
        medicationId: `med_pedro_${userId}`,
        memberId: `fam_pedro_${userId}`,
        date: today,
        scheduledTime: '08:00',
        status: 'administrado',
        recordedAt: `${today}T08:15:00Z`,
        recordedBy: 'Brenda'
      },
      {
        id: `dose_5`,
        userId,
        medicationId: `med_lucas_${userId}`,
        memberId: `fam_lucas_${userId}`,
        date: today,
        scheduledTime: '08:00',
        status: 'pendente'
      },
      {
        id: `dose_6`,
        userId,
        medicationId: `med_lucas_${userId}`,
        memberId: `fam_lucas_${userId}`,
        date: today,
        scheduledTime: '20:00',
        status: 'pendente'
      }
    ];
    this.data.medicationDoses = this.data.medicationDoses.filter(d => d.userId !== userId).concat(doses);

    // 9. Notificações
    const notifications: AppNotification[] = [
      {
        id: `notif_1_${userId}`,
        userId,
        title: 'Hora de beber água!',
        message: 'Sua saúde agradece! Que tal um copo fresco agora?',
        time: '09:00',
        read: true,
        type: 'habito',
        createdAt: `${today}T09:00:00Z`
      },
      {
        id: `notif_2_${userId}`,
        userId,
        title: 'Reunião de trabalho',
        message: 'Faltam 30 minutos para seu alinhamento semanal.',
        time: '10:30',
        read: true,
        type: 'compromisso',
        createdAt: `${today}T10:00:00Z`
      },
      {
        id: `notif_3_${userId}`,
        userId,
        title: 'Hora do almoço',
        message: 'Vamos recarregar as energias com uma pausa tranquila.',
        time: '12:00',
        read: false,
        type: 'rotina',
        createdAt: `${today}T12:00:00Z`
      },
      {
        id: `notif_4_${userId}`,
        userId,
        title: 'Remédio das crianças',
        message: 'É hora de administrar a dose prescrita do Lucas!',
        time: '15:00',
        read: false,
        type: 'medicamento',
        createdAt: `${today}T15:00:00Z`
      },
      {
        id: `notif_5_${userId}`,
        userId,
        title: 'Rotina da noite',
        message: 'Você está quase lá! Prepare o descanso da casa.',
        time: '19:00',
        read: false,
        type: 'rotina',
        createdAt: `${today}T19:00:00Z`
      }
    ];
    this.data.notifications = this.data.notifications.filter(n => n.userId !== userId).concat(notifications);

    // 10. Preferências
    const pref: UserPreferences = {
      userId,
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      voiceVolume: 1.0,
      autoSpeak: true,
      theme: 'claro',
      soundEnabled: true,
      pushEnabled: true
    };
    this.data.preferences = this.data.preferences.filter(p => p.userId !== userId).concat([pref]);

    this.logAudit(userId, 'SEED_DEMO', 'Carregados dados demonstrativos da Brenda Silva');
    this.save();
  }
}

export const db = new DatabaseManager();
