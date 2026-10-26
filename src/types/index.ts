export interface User {
  id: string;
  name: string;
  email: string;
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

export type HabitType = 'positivo' | 'negativo';
export type HabitEntryStatus = 'concluido' | 'nao_concluido' | 'evitado' | 'ocorrido' | 'nao_aplica' | 'nao_respondido';

export interface Habit {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  description?: string;
  type: HabitType;
  frequency: string;
  daysOfWeek: number[];
  reminderTime?: string;
  order: number;
  archived: boolean;
  createdAt: string;
}

export interface HabitEntry {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  status: HabitEntryStatus;
  notes?: string;
  updatedAt: string;
}

export interface ExceptionalDay {
  id: string;
  userId: string;
  date: string;
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
  startTime: string;
  endTime: string;
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
  nextDueDate: string;
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
  scheduleTimes: string[];
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
  date: string;
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

export interface AccountLink {
  id: string;
  userId: string;
  linkedEmail: string;
  linkedUserId?: string;
  status: 'ativo' | 'pendente';
  createdAt: string;
}

export type ScreenId =
  | 'splash'
  | 'auth'
  | 'dashboard'
  | 'habits'
  | 'habit-groups'
  | 'habit-charts'
  | 'routines'
  | 'routine-detail'
  | 'calendar'
  | 'recurring-tasks'
  | 'family-meds'
  | 'medication-detail'
  | 'notifications'
  | 'assistant'
  | 'settings'
  | 'profile'
  | 'family-dashboard'
  | 'monthly-reports'
  | 'exceptional-day';
