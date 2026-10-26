import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db, User, Habit, HabitGroup, HabitEntry, DailyRoutine, RecurringTask, FamilyMember, Medication, MedicationDose } from './src/server/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Middleware for simple token auth (Header: Authorization: Bearer <user_id>)
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const token = authHeader.split(' ')[1];
  const user = db.get('users').find(u => u.id === token);
  if (!user) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }
  (req as any).user = user;
  next();
};

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  const existing = db.get('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'E-mail já cadastrado' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email,
    passwordHash: password, // In production use bcrypt, plain hash for demo container
    timezone: 'America/Sao_Paulo',
    createdAt: new Date().toISOString()
  };

  db.get('users').push(newUser);
  db.logAudit(newUser.id, 'REGISTER', `Conta criada para ${email}`);
  db.save();

  res.json({ token: newUser.id, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  let user = db.get('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: email.split('@')[0],
      email,
      passwordHash: password,
      timezone: 'America/Sao_Paulo',
      createdAt: new Date().toISOString()
    };
    db.get('users').push(user);
    db.seedBrendaData(user.id);
    db.save();
  } else if (user.passwordHash !== password) {
    user.passwordHash = password;
    db.save();
  }

  res.json({ token: user.id, user });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

app.post('/api/auth/demo', (req, res) => {
  // Load Brenda Silva demo user and full mock data
  let brenda = db.get('users').find(u => u.email === 'brenda@email.com');
  if (!brenda) {
    brenda = {
      id: 'usr_brenda_silva',
      name: 'Brenda Silva',
      email: 'brenda@email.com',
      passwordHash: '123456',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      timezone: 'America/Sao_Paulo',
      createdAt: new Date().toISOString()
    };
    db.get('users').push(brenda);
  }

  db.seedBrendaData(brenda.id);
  res.json({ token: brenda.id, user: brenda });
});

// -------------------------------------------------------------
// HABITS & GROUPS ROUTES
// -------------------------------------------------------------
app.get('/api/habits', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const groups = db.get('habitGroups').filter(g => g.userId === userId);
  const habits = db.get('habits').filter(h => h.userId === userId && !h.archived);
  res.json({ groups, habits });
});

app.post('/api/habits', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { name, description, groupId, type, frequency, daysOfWeek, reminderTime } = req.body;

  if (!name || !groupId || !type) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const newHabit: Habit = {
    id: `hab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    groupId,
    name,
    description: description || '',
    type,
    frequency: frequency || 'Diária',
    daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    reminderTime: reminderTime || undefined,
    order: db.get('habits').filter(h => h.userId === userId).length + 1,
    archived: false,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  db.get('habits').push(newHabit);
  db.logAudit(userId, 'CREATE_HABIT', `Criado hábito: ${name} (${type})`);
  db.save();

  res.json({ habit: newHabit });
});

app.put('/api/habits/:id', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const habit = db.get('habits').find(h => h.id === req.params.id && h.userId === userId);
  if (!habit) return res.status(404).json({ error: 'Hábito não encontrado' });

  const { name, description, groupId, type, frequency, daysOfWeek, reminderTime, archived } = req.body;
  if (name !== undefined) habit.name = name;
  if (description !== undefined) habit.description = description;
  if (groupId !== undefined) habit.groupId = groupId;
  if (type !== undefined) habit.type = type;
  if (frequency !== undefined) habit.frequency = frequency;
  if (daysOfWeek !== undefined) habit.daysOfWeek = daysOfWeek;
  if (reminderTime !== undefined) habit.reminderTime = reminderTime;
  if (archived !== undefined) habit.archived = archived;

  db.logAudit(userId, 'UPDATE_HABIT', `Atualizado hábito: ${habit.name}`);
  db.save();
  res.json({ habit });
});

app.delete('/api/habits/:id', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const habit = db.get('habits').find(h => h.id === req.params.id && h.userId === userId);
  if (!habit) return res.status(404).json({ error: 'Hábito não encontrado' });

  habit.archived = true;
  db.logAudit(userId, 'ARCHIVE_HABIT', `Arquivado hábito: ${habit.name}`);
  db.save();
  res.json({ success: true });
});

app.post('/api/habits/groups', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { name, icon, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do grupo obrigatório' });

  const newGroup: HabitGroup = {
    id: `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    name,
    icon: icon || 'Folder',
    color: color || '#2D6A4F',
    order: db.get('habitGroups').filter(g => g.userId === userId).length + 1
  };

  db.get('habitGroups').push(newGroup);
  db.logAudit(userId, 'CREATE_GROUP', `Criado grupo: ${name}`);
  db.save();
  res.json({ group: newGroup });
});

// Daily entries
app.get('/api/habits/entries', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const date = req.query.date as string || new Date().toISOString().slice(0, 10);
  const entries = db.get('habitEntries').filter(e => e.userId === userId && e.date === date);
  res.json({ date, entries });
});

app.post('/api/habits/entries', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { habitId, date, status, notes } = req.body;

  if (!habitId || !date || !status) {
    return res.status(400).json({ error: 'habitId, date e status são obrigatórios' });
  }

  let entry = db.get('habitEntries').find(e => e.userId === userId && e.habitId === habitId && e.date === date);
  if (entry) {
    entry.status = status;
    if (notes !== undefined) entry.notes = notes;
    entry.updatedAt = new Date().toISOString();
  } else {
    entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      habitId,
      date,
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    db.get('habitEntries').push(entry);
  }

  db.save();
  res.json({ entry });
});

// -------------------------------------------------------------
// EXCEPTIONAL DAYS (Dia fora da rotina)
// -------------------------------------------------------------
app.get('/api/exceptional-days', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const days = db.get('exceptionalDays').filter(d => d.userId === userId);
  res.json({ exceptionalDays: days });
});

app.post('/api/exceptional-days', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { date, reason, notes, excludedGroupIds } = req.body;

  if (!date || !reason) {
    return res.status(400).json({ error: 'Data e motivo são obrigatórios' });
  }

  let day = db.get('exceptionalDays').find(d => d.userId === userId && d.date === date);
  if (day) {
    day.reason = reason;
    day.notes = notes;
    day.excludedGroupIds = excludedGroupIds;
  } else {
    day = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      date,
      reason,
      notes,
      excludedGroupIds: excludedGroupIds || [],
      createdAt: new Date().toISOString()
    };
    db.get('exceptionalDays').push(day);
  }

  db.logAudit(userId, 'SET_EXCEPTIONAL_DAY', `Dia fora da rotina marcado: ${date} (${reason})`);
  db.save();
  res.json({ exceptionalDay: day });
});

app.delete('/api/exceptional-days/:date', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const date = req.params.date;
  const idx = db.get('exceptionalDays').findIndex(d => d.userId === userId && d.date === date);
  if (idx !== -1) {
    db.get('exceptionalDays').splice(idx, 1);
    db.logAudit(userId, 'REMOVE_EXCEPTIONAL_DAY', `Dia fora da rotina desmarcado: ${date}`);
    db.save();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// ROUTINES & TASKS
// -------------------------------------------------------------
app.get('/api/routines', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const routines = db.get('dailyRoutines').filter(r => r.userId === userId);
  res.json({ routines });
});

app.post('/api/routines', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { title, description, startTime, endTime, daysOfWeek, category, color, notificationEnabled, reminderMinutes, items } = req.body;

  const newRoutine: DailyRoutine = {
    id: `rot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    title,
    description: description || '',
    startTime: startTime || '08:00',
    endTime: endTime || '09:00',
    daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    category: category || 'Geral',
    color: color || '#2D6A4F',
    notificationEnabled: notificationEnabled !== false,
    reminderMinutes: reminderMinutes || 10,
    active: true,
    items: (items || []).map((it: any, idx: number) => ({
      id: `it_${Date.now()}_${idx}`,
      routineId: '',
      title: typeof it === 'string' ? it : it.title,
      completed: false,
      order: idx + 1
    }))
  };

  newRoutine.items.forEach(it => it.routineId = newRoutine.id);
  db.get('dailyRoutines').push(newRoutine);
  db.logAudit(userId, 'CREATE_ROUTINE', `Criada rotina: ${title}`);
  db.save();
  res.json({ routine: newRoutine });
});

app.post('/api/routines/:id/items/:itemId/toggle', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const routine = db.get('dailyRoutines').find(r => r.id === req.params.id && r.userId === userId);
  if (!routine) return res.status(404).json({ error: 'Rotina não encontrada' });

  const item = routine.items.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });

  item.completed = !item.completed;
  db.save();
  res.json({ routine, item });
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const tasks = db.get('recurringTasks').filter(t => t.userId === userId);
  res.json({ tasks });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { title, frequency, ruleDescription, daysRemaining } = req.body;

  const newTask: RecurringTask = {
    id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    title,
    frequency: frequency || 'semanal',
    ruleDescription: ruleDescription || 'Personalizado',
    nextDueDate: new Date(Date.now() + (daysRemaining || 7) * 86400000).toISOString().slice(0, 10),
    daysRemaining: daysRemaining || 7,
    status: 'pendente',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  db.get('recurringTasks').push(newTask);
  db.logAudit(userId, 'CREATE_TASK', `Criada tarefa recorrente: ${title}`);
  db.save();
  res.json({ task: newTask });
});

app.post('/api/tasks/:id/complete', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const task = db.get('recurringTasks').find(t => t.id === req.params.id && t.userId === userId);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });

  task.status = 'concluida';
  task.lastCompletedDate = new Date().toISOString().slice(0, 10);
  db.logAudit(userId, 'COMPLETE_TASK', `Concluída tarefa: ${task.title}`);
  db.save();
  res.json({ task });
});

// -------------------------------------------------------------
// FAMILY & MEDICATIONS
// -------------------------------------------------------------
app.get('/api/family', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const members = db.get('familyMembers').filter(m => m.userId === userId);
  res.json({ members });
});

app.post('/api/family', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { name, ageText, relationship, notes, avatarUrl } = req.body;

  const newMember: FamilyMember = {
    id: `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    name,
    ageText: ageText || '',
    relationship: relationship || 'Familiar',
    avatarUrl: avatarUrl || undefined,
    notes: notes || '',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  db.get('familyMembers').push(newMember);
  db.logAudit(userId, 'CREATE_FAMILY_MEMBER', `Adicionado membro familiar: ${name}`);
  db.save();
  res.json({ member: newMember });
});

app.get('/api/meds', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const today = new Date().toISOString().slice(0, 10);
  const medications = db.get('medications').filter(m => m.userId === userId && m.active);
  const doses = db.get('medicationDoses').filter(d => d.userId === userId && d.date === today);
  res.json({ medications, doses, date: today });
});

app.post('/api/meds', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { memberId, name, dosage, scheduleTimes, instructions, notificationEnabled } = req.body;

  const newMed: Medication = {
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    memberId,
    name,
    dosage: dosage || '',
    scheduleTimes: scheduleTimes || ['08:00'],
    instructions: instructions || '',
    notificationEnabled: notificationEnabled !== false,
    active: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  db.get('medications').push(newMed);
  db.logAudit(userId, 'CREATE_MEDICATION', `Adicionado medicamento: ${name}`);
  db.save();
  res.json({ medication: newMed });
});

app.post('/api/meds/:id/dose', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const med = db.get('medications').find(m => m.id === req.params.id && m.userId === userId);
  if (!med) return res.status(404).json({ error: 'Medicamento não encontrado' });

  const { scheduledTime, status } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  let dose = db.get('medicationDoses').find(
    d => d.medicationId === med.id && d.date === today && d.scheduledTime === scheduledTime
  );

  if (dose) {
    dose.status = status || 'administrado';
    dose.recordedAt = new Date().toISOString();
    dose.recordedBy = (req as any).user.name;
  } else {
    dose = {
      id: `dose_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      medicationId: med.id,
      memberId: med.memberId,
      date: today,
      scheduledTime: scheduledTime || '08:00',
      status: status || 'administrado',
      recordedAt: new Date().toISOString(),
      recordedBy: (req as any).user.name
    };
    db.get('medicationDoses').push(dose);
  }

  db.logAudit(userId, 'ADMINISTER_DOSE', `Dose registrada para ${med.name}: ${dose.status}`);
  db.save();
  res.json({ dose });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/notifications', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const notifications = db.get('notifications').filter(n => n.userId === userId);
  res.json({ notifications });
});

app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const notif = db.get('notifications').find(n => n.id === req.params.id && n.userId === userId);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ success: true });
});

app.post('/api/notifications/clear', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const userNotifs = db.get('notifications').filter(n => n.userId === userId);
  userNotifs.forEach(n => n.read = true);
  db.save();
  res.json({ success: true });
});

// -------------------------------------------------------------
// AI ASSISTANT (Gemini 3.8 Flash with Tool Calling)
// -------------------------------------------------------------
app.post('/api/assistant/chat', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  const userName = (req as any).user.name;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem obrigatória' });
  }

  try {
    // Collect user context for the assistant
    const habits = db.get('habits').filter(h => h.userId === userId && !h.archived);
    const groups = db.get('habitGroups').filter(g => g.userId === userId);
    const routines = db.get('dailyRoutines').filter(r => r.userId === userId);
    const tasks = db.get('recurringTasks').filter(t => t.userId === userId);
    const today = new Date().toISOString().slice(0, 10);
    const entries = db.get('habitEntries').filter(e => e.userId === userId && e.date === today);

    // Calculate today's habit success
    const completedPositives = entries.filter(e => e.status === 'concluido').length;
    const avoidedNegatives = entries.filter(e => e.status === 'evitado').length;
    const answeredTotal = entries.filter(e => e.status !== 'nao_respondido' && e.status !== 'nao_aplica').length;
    const rate = answeredTotal > 0 ? Math.round(((completedPositives + avoidedNegatives) / answeredTotal) * 100) : 0;

    // Tool declarations for Gemini
    const createHabitTool: FunctionDeclaration = {
      name: 'createHabit',
      description: 'Cria um novo hábito para o usuário',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nome do hábito' },
          type: { type: Type.STRING, description: 'positivo ou negativo' },
          groupName: { type: Type.STRING, description: 'Nome do grupo, ex: Eu, Casa, Saúde, Trabalho' },
          reminderTime: { type: Type.STRING, description: 'Horário do lembrete no formato HH:MM' }
        },
        required: ['name', 'type']
      }
    };

    const registerHabitStatusTool: FunctionDeclaration = {
      name: 'registerHabitStatus',
      description: 'Marca o status de um hábito existente para hoje',
      parameters: {
        type: Type.OBJECT,
        properties: {
          habitName: { type: Type.STRING, description: 'Nome aproximado do hábito' },
          status: { type: Type.STRING, description: 'concluido, evitado, ocorrido ou nao_concluido' }
        },
        required: ['habitName', 'status']
      }
    };

    const createRoutineTool: FunctionDeclaration = {
      name: 'createRoutine',
      description: 'Cria uma nova rotina diária com horários de início e término',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Título da rotina' },
          startTime: { type: Type.STRING, description: 'Horário de início HH:MM' },
          endTime: { type: Type.STRING, description: 'Horário de término HH:MM' }
        },
        required: ['title', 'startTime', 'endTime']
      }
    };

    const systemInstruction = `Você é a assistente acolhedora do RotinAPP, um app de organização pessoal e familiar com o lema "Sua rotina, com mais leveza".
O usuário logado é ${userName}.
Data atual: ${today}.
Contexto atual:
- Hábitos cadastrados: ${habits.map(h => `${h.name} (${h.type})`).join(', ') || 'Nenhum'}
- Taxa de sucesso de hábitos hoje: ${rate}% (${completedPositives} positivos concluídos, ${avoidedNegatives} negativos evitados)
- Rotinas ativas: ${routines.map(r => `${r.title} [${r.startTime}-${r.endTime}]`).join(', ') || 'Nenhuma'}
- Tarefas recorrentes: ${tasks.map(t => `${t.title} (${t.ruleDescription})`).join(', ') || 'Nenhuma'}

Diretrizes:
- Seja sempre acolhedora, encorajadora e serena, sem julgamentos ou pressão.
- Em português brasileiro natural.
- Quando o usuário pedir para criar hábito, rotina ou marcar um registro, use as ferramentas disponíveis.
- Nunca invente que realizou uma alteração sem chamar a ferramenta correspondente.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [createHabitTool, registerHabitStatusTool, createRoutineTool] }]
      }
    });

    const actionsPerformed: string[] = [];

    // Process tool calls if any
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === 'createHabit') {
          const args = call.args as any;
          let targetGroup = groups.find(g => g.name.toLowerCase() === (args.groupName || '').toLowerCase());
          if (!targetGroup) {
            targetGroup = groups[0] || {
              id: `grp_eu_${userId}`,
              userId,
              name: 'Eu',
              icon: 'User',
              color: '#40916C',
              order: 1
            };
          }

          const newH: Habit = {
            id: `hab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            groupId: targetGroup.id,
            name: args.name,
            type: args.type === 'negativo' ? 'negativo' : 'positivo',
            frequency: 'Diária',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            reminderTime: args.reminderTime,
            order: habits.length + 1,
            archived: false,
            createdAt: today
          };
          db.get('habits').push(newH);
          db.logAudit(userId, 'AI_CREATE_HABIT', `Criado via assistente: ${args.name}`);
          actionsPerformed.push(`Hábito "${args.name}" criado com sucesso no grupo ${targetGroup.name}.`);
        } else if (call.name === 'registerHabitStatus') {
          const args = call.args as any;
          const matched = habits.find(h => h.name.toLowerCase().includes(args.habitName.toLowerCase()));
          if (matched) {
            let entry = db.get('habitEntries').find(e => e.userId === userId && e.habitId === matched.id && e.date === today);
            if (!entry) {
              entry = {
                id: `entry_${Date.now()}`,
                userId,
                habitId: matched.id,
                date: today,
                status: args.status,
                updatedAt: new Date().toISOString()
              };
              db.get('habitEntries').push(entry);
            } else {
              entry.status = args.status;
              entry.updatedAt = new Date().toISOString();
            }
            actionsPerformed.push(`Registro de "${matched.name}" atualizado para ${args.status}.`);
          }
        } else if (call.name === 'createRoutine') {
          const args = call.args as any;
          const newRot: DailyRoutine = {
            id: `rot_${Date.now()}`,
            userId,
            title: args.title,
            startTime: args.startTime,
            endTime: args.endTime,
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            category: 'Geral',
            color: '#2D6A4F',
            notificationEnabled: true,
            reminderMinutes: 10,
            active: true,
            items: []
          };
          db.get('dailyRoutines').push(newRot);
          actionsPerformed.push(`Rotina "${args.title}" agendada das ${args.startTime} às ${args.endTime}.`);
        }
      }
      db.save();
    }

    const reply = response.text || (actionsPerformed.length > 0 ? actionsPerformed.join(' ') : 'Entendido! Como mais posso ajudar na sua rotina hoje?');
    res.json({ reply, actions: actionsPerformed });
  } catch (err: any) {
    console.error('AI Assistant Error:', err);
    res.status(500).json({ error: 'Não foi possível processar no momento. Verifique a conexão com o assistente.' });
  }
});

// Voice transcription / intent interpreter
app.post('/api/voice/process', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'Transcrição vazia' });

  try {
    const habits = db.get('habits').filter(h => h.userId === userId && !h.archived);
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `Analise a frase dita pelo usuário em português: "${transcript}".
Lista de hábitos atuais do usuário:
${habits.map(h => `- ${h.name} (${h.type}, id: ${h.id})`).join('\n')}

Retorne um JSON estrito no formato:
{
  "identifiedHabitId": "id do hábito se corresponder a um existente, ou null",
  "habitName": "nome do hábito existente ou sugerido",
  "suggestedType": "positivo" ou "negativo",
  "detectedStatus": "concluido", "evitado", "ocorrido" ou "pendente",
  "explanation": "frase curta acolhedora de confirmação"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let rawText = response.text || '{}';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawText);
    if (parsed.identifiedHabitId && parsed.detectedStatus && parsed.detectedStatus !== 'pendente') {
      let entry = db.get('habitEntries').find(e => e.userId === userId && e.habitId === parsed.identifiedHabitId && e.date === today);
      if (entry) {
        entry.status = parsed.detectedStatus;
        entry.updatedAt = new Date().toISOString();
      } else {
        entry = {
          id: `entry_${Date.now()}`,
          userId,
          habitId: parsed.identifiedHabitId,
          date: today,
          status: parsed.detectedStatus,
          notes: `Registrado por voz: "${transcript}"`,
          updatedAt: new Date().toISOString()
        };
        db.get('habitEntries').push(entry);
      }
      db.save();
    }

    res.json({ result: parsed });
  } catch (err: any) {
    console.error('Voice processing error:', err);
    res.json({
      result: {
        identifiedHabitId: null,
        habitName: transcript,
        suggestedType: 'positivo',
        detectedStatus: 'concluido',
        explanation: `Transcrição recebida: "${transcript}".`
      }
    });
  }
});

// -------------------------------------------------------------
// USER DATA EXPORT & LGPD
// -------------------------------------------------------------
app.get('/api/user/export', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const user = db.get('users').find(u => u.id === userId);
  const data = {
    user,
    habits: db.get('habits').filter(h => h.userId === userId),
    habitEntries: db.get('habitEntries').filter(e => e.userId === userId),
    dailyRoutines: db.get('dailyRoutines').filter(r => r.userId === userId),
    recurringTasks: db.get('recurringTasks').filter(t => t.userId === userId),
    familyMembers: db.get('familyMembers').filter(m => m.userId === userId),
    medications: db.get('medications').filter(m => m.userId === userId),
    exceptionalDays: db.get('exceptionalDays').filter(d => d.userId === userId),
    auditLogs: db.get('auditLogs').filter(l => l.userId === userId)
  };
  res.json(data);
});

// -------------------------------------------------------------
// ACCOUNT LINKING & SHARED ROUTINES (Vínculo por conta)
// -------------------------------------------------------------
app.get('/api/account/links', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const links = db.get('accountLinks').filter(l => l.userId === userId);
  res.json({ links });
});

app.post('/api/account/link', authMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const { linkedEmail } = req.body;
  if (!linkedEmail) {
    return res.status(400).json({ error: 'E-mail para vínculo é obrigatório' });
  }

  const targetUser = db.get('users').find(u => u.email.toLowerCase() === linkedEmail.toLowerCase());
  const newLink = {
    id: `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    linkedEmail,
    linkedUserId: targetUser ? targetUser.id : undefined,
    status: 'ativo' as const,
    createdAt: new Date().toISOString()
  };

  db.get('accountLinks').push(newLink);
  db.logAudit(userId, 'ACCOUNT_LINK', `Conta vinculada com ${linkedEmail}`);
  db.save();
  res.json({ link: newLink });
});

// -------------------------------------------------------------
// REAL GEMINI TTS VOICE ENDPOINT (Locutora Virtual RotinAPP - Sulafat / Achird)
// -------------------------------------------------------------
const audioMemoryCache: Record<string, { audioBase64: string; mimeType: string }> = {};

app.post('/api/tts/speak', async (req, res) => {
  const { text, voice = 'Sulafat', context = 'lembrete' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto não fornecido para síntese vocal' });
  }

  const selectedVoice = (voice === 'Achird' || voice === 'Sulafat') ? voice : 'Sulafat';
  const textClean = text.trim().toLowerCase();

  // Cache key for dynamic phrases
  const cacheKey = `${selectedVoice}_${context}_${textClean}`;
  if (audioMemoryCache[cacheKey]) {
    return res.json({
      audioBase64: audioMemoryCache[cacheKey].audioBase64,
      mimeType: audioMemoryCache[cacheKey].mimeType,
      voice: selectedVoice,
      provider: 'memory-cache',
      context
    });
  }

  // Style directive according to context
  let styleDirective = 'Fale em português do Brasil com dicção perfeita, tom humano, natural, didático e acolhedor.';
  switch (context) {
    case 'bom_dia':
      styleDirective += ' Tom matinal, acolhedor, positivo e tranquilo.';
      break;
    case 'medicamento':
      styleDirective += ' Tom cuidadoso, neutro, preciso e atencioso.';
      break;
    case 'conquista':
      styleDirective += ' Tom alegre, genuíno e motivador.';
      break;
    case 'explicacao':
      styleDirective += ' Tom de professora paciente, clara e extremamente didática.';
      break;
    case 'atraso':
      styleDirective += ' Tom respeitoso, calmo, sem julgamento ou cobrança.';
      break;
    case 'rotina_noturna':
      styleDirective += ' Tom suave, calmo e relaxante.';
      break;
    default:
      styleDirective += ' Tom de secretária pessoal gentil, organizada e atenciosa.';
  }

  try {
    const fullPrompt = `${styleDirective}\nTexto a ser lido: "${text.trim()}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice
            }
          }
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let audioPart = parts.find(p => p.inlineData && p.inlineData.mimeType?.startsWith('audio/'));

    if (audioPart && audioPart.inlineData && audioPart.inlineData.data) {
      const audioBase64: string = audioPart.inlineData.data;
      const mimeType: string = audioPart.inlineData.mimeType || 'audio/wav';

      audioMemoryCache[cacheKey] = { audioBase64, mimeType };

      return res.json({
        audioBase64,
        mimeType,
        voice: selectedVoice,
        provider: 'gemini-tts-live',
        context
      });
    }

    // Fallback if no audio inlineData came back
    res.json({
      audioUrl: `/audio/samples/${selectedVoice.toLowerCase()}_bom_dia.wav`,
      voice: selectedVoice,
      provider: 'fallback-sample',
      context
    });
  } catch (err: any) {
    console.warn('Gemini TTS synthesis fallback:', err?.message || err);
    // Graceful fallback to sample
    res.json({
      audioUrl: `/audio/samples/${selectedVoice.toLowerCase()}_bom_dia.wav`,
      voice: selectedVoice,
      provider: 'fallback-sample',
      context
    });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER & PRODUCTION STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RotinAPP Server running on port ${PORT}`);
  });
}

startServer();
