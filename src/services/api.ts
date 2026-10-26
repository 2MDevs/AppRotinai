import { User, Habit, HabitGroup, HabitEntry, DailyRoutine, RecurringTask, FamilyMember, Medication, MedicationDose, AppNotification, ExceptionalDay, AccountLink } from '../types';

const TOKEN_KEY = 'rotinapp_token';
const OFFLINE_QUEUE_KEY = 'rotinapp_offline_queue';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // Check if offline
    if (!navigator.onLine) {
      console.warn('Network offline, returning fallback or queueing mutation');
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async me(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async loadDemo(): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/demo', {
      method: 'POST'
    });
    setStoredToken(data.token);
    return data;
  },

  logout(): void {
    setStoredToken(null);
  },

  // Habits
  async getHabits(): Promise<{ groups: HabitGroup[]; habits: Habit[] }> {
    return request<{ groups: HabitGroup[]; habits: Habit[] }>('/api/habits');
  },

  async createHabit(habitData: Partial<Habit>): Promise<{ habit: Habit }> {
    return request<{ habit: Habit }>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habitData)
    });
  },

  async updateHabit(id: string, habitData: Partial<Habit>): Promise<{ habit: Habit }> {
    return request<{ habit: Habit }>(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habitData)
    });
  },

  async deleteHabit(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/habits/${id}`, {
      method: 'DELETE'
    });
  },

  async createGroup(groupData: { name: string; icon?: string; color?: string }): Promise<{ group: HabitGroup }> {
    return request<{ group: HabitGroup }>('/api/habits/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },

  async getHabitEntries(date?: string): Promise<{ date: string; entries: HabitEntry[] }> {
    const q = date ? `?date=${date}` : '';
    return request<{ date: string; entries: HabitEntry[] }>(`/api/habits/entries${q}`);
  },

  async setHabitEntry(habitId: string, date: string, status: string, notes?: string): Promise<{ entry: HabitEntry }> {
    return request<{ entry: HabitEntry }>('/api/habits/entries', {
      method: 'POST',
      body: JSON.stringify({ habitId, date, status, notes })
    });
  },

  // Exceptional Days
  async getExceptionalDays(): Promise<{ exceptionalDays: ExceptionalDay[] }> {
    return request<{ exceptionalDays: ExceptionalDay[] }>('/api/exceptional-days');
  },

  async setExceptionalDay(dayData: Partial<ExceptionalDay>): Promise<{ exceptionalDay: ExceptionalDay }> {
    return request<{ exceptionalDay: ExceptionalDay }>('/api/exceptional-days', {
      method: 'POST',
      body: JSON.stringify(dayData)
    });
  },

  async deleteExceptionalDay(date: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/exceptional-days/${date}`, {
      method: 'DELETE'
    });
  },

  // Routines
  async getRoutines(): Promise<{ routines: DailyRoutine[] }> {
    return request<{ routines: DailyRoutine[] }>('/api/routines');
  },

  async createRoutine(routineData: Partial<DailyRoutine>): Promise<{ routine: DailyRoutine }> {
    return request<{ routine: DailyRoutine }>('/api/routines', {
      method: 'POST',
      body: JSON.stringify(routineData)
    });
  },

  async toggleRoutineItem(routineId: string, itemId: string): Promise<{ routine: DailyRoutine }> {
    return request<{ routine: DailyRoutine }>(`/api/routines/${routineId}/items/${itemId}/toggle`, {
      method: 'POST'
    });
  },

  // Tasks
  async getTasks(): Promise<{ tasks: RecurringTask[] }> {
    return request<{ tasks: RecurringTask[] }>('/api/tasks');
  },

  async createTask(taskData: Partial<RecurringTask>): Promise<{ task: RecurringTask }> {
    return request<{ task: RecurringTask }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async completeTask(id: string): Promise<{ task: RecurringTask }> {
    return request<{ task: RecurringTask }>(`/api/tasks/${id}/complete`, {
      method: 'POST'
    });
  },

  // Family & Meds
  async getFamily(): Promise<{ members: FamilyMember[] }> {
    return request<{ members: FamilyMember[] }>('/api/family');
  },

  async createFamilyMember(memberData: Partial<FamilyMember>): Promise<{ member: FamilyMember }> {
    return request<{ member: FamilyMember }>('/api/family', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  async getMeds(): Promise<{ medications: Medication[]; doses: MedicationDose[]; date: string }> {
    return request<{ medications: Medication[]; doses: MedicationDose[]; date: string }>('/api/meds');
  },

  async createMed(medData: Partial<Medication>): Promise<{ medication: Medication }> {
    return request<{ medication: Medication }>('/api/meds', {
      method: 'POST',
      body: JSON.stringify(medData)
    });
  },

  async recordDose(medId: string, scheduledTime: string, status: string): Promise<{ dose: MedicationDose }> {
    return request<{ dose: MedicationDose }>(`/api/meds/${medId}/dose`, {
      method: 'POST',
      body: JSON.stringify({ scheduledTime, status })
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    return request<{ notifications: AppNotification[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  },

  async clearNotifications(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/clear', {
      method: 'POST'
    });
  },

  // AI Assistant
  async sendAssistantMessage(message: string): Promise<{ reply: string; actions: string[] }> {
    return request<{ reply: string; actions: string[] }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Voice Processing
  async processVoiceTranscript(transcript: string): Promise<{ result: any }> {
    return request<{ result: any }>('/api/voice/process', {
      method: 'POST',
      body: JSON.stringify({ transcript })
    });
  },

  // Export
  async exportData(): Promise<any> {
    return request<any>('/api/user/export');
  },

  // Account Linking & Shared Routines
  async getAccountLinks(): Promise<{ links: AccountLink[] }> {
    return request<{ links: AccountLink[] }>('/api/account/links');
  },

  async linkAccount(linkedEmail: string): Promise<{ link: AccountLink }> {
    return request<{ link: AccountLink }>('/api/account/link', {
      method: 'POST',
      body: JSON.stringify({ linkedEmail })
    });
  }
};
