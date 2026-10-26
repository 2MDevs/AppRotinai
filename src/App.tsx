/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Habit, HabitGroup, HabitEntry, DailyRoutine, RecurringTask,
  FamilyMember, Medication, MedicationDose, AppNotification, ExceptionalDay, ScreenId
} from './types';
import { api, getStoredToken } from './services/api';
import { BottomNav, DesktopSidebar } from './components/Navigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/screens/SplashScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { HabitsScreen } from './components/screens/HabitsScreen';
import { VoiceHabitModal } from './components/screens/VoiceHabitModal';
import { HabitGroupsScreen } from './components/screens/HabitGroupsScreen';
import { HabitChartsScreen } from './components/screens/HabitChartsScreen';
import { RoutinesScreen } from './components/screens/RoutinesScreen';
import { RoutineDetailScreen } from './components/screens/RoutineDetailScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { RecurringTasksScreen } from './components/screens/RecurringTasksScreen';
import { FamilyMedicationsScreen } from './components/screens/FamilyMedicationsScreen';
import { MedicationDetailScreen } from './components/screens/MedicationDetailScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { AssistantScreen } from './components/screens/AssistantScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { FamilyDashboardScreen } from './components/screens/FamilyDashboardScreen';
import { MonthlyReportsScreen } from './components/screens/MonthlyReportsScreen';
import { ExceptionalDayScreen } from './components/screens/ExceptionalDayScreen';
import { ExactTimeAlarmWatcher } from './components/ExactTimeAlarmWatcher';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<HabitGroup[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [exceptionalDays, setExceptionalDays] = useState<ExceptionalDay[]>([]);

  // Selected item states
  const [selectedRoutine, setSelectedRoutine] = useState<DailyRoutine | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  // Load all user data
  const loadUserData = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [
        habitsRes,
        entriesRes,
        routinesRes,
        tasksRes,
        familyRes,
        medsRes,
        notifsRes,
        expRes
      ] = await Promise.all([
        api.getHabits().catch(() => ({ groups: [], habits: [] })),
        api.getHabitEntries(today).catch(() => ({ date: today, entries: [] })),
        api.getRoutines().catch(() => ({ routines: [] })),
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getFamily().catch(() => ({ members: [] })),
        api.getMeds().catch(() => ({ medications: [], doses: [], date: today })),
        api.getNotifications().catch(() => ({ notifications: [] })),
        api.getExceptionalDays().catch(() => ({ exceptionalDays: [] }))
      ]);

      setHabits(habitsRes.habits || []);
      setGroups(habitsRes.groups || []);
      setEntries(entriesRes.entries || []);
      setRoutines(routinesRes.routines || []);
      setTasks(tasksRes.tasks || []);
      setFamily(familyRes.members || []);
      setMeds(medsRes.medications || []);
      setDoses(medsRes.doses || []);
      setNotifications(notifsRes.notifications || []);
      setExceptionalDays(expRes.exceptionalDays || []);
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await api.me();
          if (res.user) {
            setUser(res.user);
            await loadUserData();
            setCurrentScreen('dashboard');
          }
        } catch (e) {
          api.logout();
          setCurrentScreen('splash');
        }
      } else {
        setCurrentScreen('splash');
      }
      setLoading(false);
    }

    initSession();
  }, [loadUserData]);

  // Auth Handlers
  const handleAuthSuccess = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    await loadUserData();
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentScreen('splash');
  };

  const handleLoadDemo = async () => {
    try {
      const res = await api.loadDemo();
      setUser(res.user);
      await loadUserData();
      setCurrentScreen('dashboard');
    } catch (e) {
      console.error('Failed to load demo:', e);
    }
  };

  // Toggle Habit Status (Positive: Concluído / Não concluído; Negative: Evitado / Ocorrido)
  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().slice(0, 10);
    const existingEntry = entries.find(e => e.habitId === habitId && e.date === today);

    let nextStatus: string;
    if (habit.type === 'positivo') {
      nextStatus = existingEntry?.status === 'concluido' ? 'nao_concluido' : 'concluido';
    } else {
      nextStatus = existingEntry?.status === 'evitado' ? 'ocorrido' : 'evitado';
    }

    // Optimistic update
    setEntries(prev => {
      const idx = prev.findIndex(e => e.habitId === habitId && e.date === today);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], status: nextStatus as any, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [
        ...prev,
        {
          id: `entry_${Date.now()}`,
          userId: user?.id || '',
          habitId,
          date: today,
          status: nextStatus as any,
          updatedAt: new Date().toISOString()
        }
      ];
    });

    try {
      await api.setHabitEntry(habitId, today, nextStatus);
    } catch (e) {
      console.error('Error saving habit entry:', e);
    }
  };

  // Create Habit
  const handleCreateHabit = async (habitData: Partial<Habit>) => {
    const res = await api.createHabit(habitData);
    setHabits(prev => [...prev, res.habit]);
  };

  // Create Group
  const handleCreateGroup = async (groupData: { name: string; icon?: string; color?: string }) => {
    const res = await api.createGroup(groupData);
    setGroups(prev => [...prev, res.group]);
  };

  // Create Routine
  const handleCreateRoutine = async (routineData: Partial<DailyRoutine>) => {
    const res = await api.createRoutine(routineData);
    setRoutines(prev => [...prev, res.routine]);
  };

  // Toggle Routine Item
  const handleToggleRoutineItem = async (routineId: string, itemId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return {
        ...r,
        items: r.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
      };
    }));

    if (selectedRoutine && selectedRoutine.id === routineId) {
      setSelectedRoutine(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
        };
      });
    }

    try {
      await api.toggleRoutineItem(routineId, itemId);
    } catch (e) {
      console.error('Error toggling routine item:', e);
    }
  };

  // Create Task
  const handleCreateTask = async (taskData: Partial<RecurringTask>) => {
    const res = await api.createTask(taskData);
    setTasks(prev => [...prev, res.task]);
  };

  // Complete Task
  const handleCompleteTask = async (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'concluida' } : t));
    try {
      await api.completeTask(taskId);
    } catch (e) {
      console.error('Error completing task:', e);
    }
  };

  // Family & Meds
  const handleCreateMember = async (memberData: Partial<FamilyMember>) => {
    const res = await api.createFamilyMember(memberData);
    setFamily(prev => [...prev, res.member]);
  };

  const handleCreateMed = async (medData: Partial<Medication>) => {
    const res = await api.createMed(medData);
    setMeds(prev => [...prev, res.medication]);
  };

  const handleRecordDose = async (medId: string, scheduledTime: string, status: string = 'administrado') => {
    const res = await api.recordDose(medId, scheduledTime, status);
    setDoses(prev => {
      const idx = prev.findIndex(d => d.medicationId === medId && d.scheduledTime === scheduledTime);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = res.dose;
        return copy;
      }
      return [...prev, res.dose];
    });
  };

  // Notifications
  const handleMarkNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch (e) {}
  };

  const handleClearNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.clearNotifications();
    } catch (e) {}
  };

  // Exceptional Days
  const handleSetExceptionalDay = async (dayData: Partial<ExceptionalDay>) => {
    const res = await api.setExceptionalDay(dayData);
    setExceptionalDays(prev => {
      const idx = prev.findIndex(d => d.date === res.exceptionalDay.date);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = res.exceptionalDay;
        return copy;
      }
      return [...prev, res.exceptionalDay];
    });
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2C2824] text-[#FAF7F2] flex items-center justify-center animate-pulse shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none">
              <path
                d="M256 120 C 320 160, 340 240, 280 290 C 230 240, 240 160, 256 120 Z"
                fill="#C4B9A5"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-[#2C2824] font-display">RotinAPP</span>
        </div>
      </div>
    );
  }

  // Not logged in screens
  if (!user || currentScreen === 'splash' || currentScreen === 'auth') {
    if (currentScreen === 'auth') {
      return (
        <AuthScreen
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onBack={() => setCurrentScreen('splash')}
        />
      );
    }

    return (
      <SplashScreen
        onStart={() => {
          setAuthMode('register');
          setCurrentScreen('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setCurrentScreen('auth');
        }}
        onDemo={handleLoadDemo}
      />
    );
  }

  // Logged in application
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2824]">
      <OfflineIndicator />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        unreadNotificationsCount={unreadNotifsCount}
      />

      {/* Main Content Viewport */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-2xl mx-auto min-h-screen bg-[#FAF7F2] md:border-x md:border-[#EAE3D6] shadow-2xs">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              user={user}
              habits={habits}
              entries={entries}
              routines={routines}
              onNavigate={setCurrentScreen}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onToggleHabit={handleToggleHabit}
            />
          )}

          {currentScreen === 'habits' && (
            <HabitsScreen
              habits={habits}
              groups={groups}
              entries={entries}
              onToggleHabit={handleToggleHabit}
              onCreateHabit={handleCreateHabit}
              onNavigate={setCurrentScreen}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />
          )}

          {currentScreen === 'habit-groups' && (
            <HabitGroupsScreen
              groups={groups}
              habits={habits}
              onNavigate={setCurrentScreen}
              onCreateGroup={handleCreateGroup}
            />
          )}

          {currentScreen === 'habit-charts' && (
            <HabitChartsScreen
              habits={habits}
              entries={entries}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'routines' && (
            <RoutinesScreen
              routines={routines}
              onSelectRoutine={(r) => {
                setSelectedRoutine(r);
                setCurrentScreen('routine-detail');
              }}
              onCreateRoutine={handleCreateRoutine}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'routine-detail' && (
            <RoutineDetailScreen
              routine={selectedRoutine || routines[0]}
              onBack={() => setCurrentScreen('routines')}
              onToggleItem={handleToggleRoutineItem}
            />
          )}

          {currentScreen === 'calendar' && (
            <CalendarScreen
              routines={routines}
              tasks={tasks}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'recurring-tasks' && (
            <RecurringTasksScreen
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onCreateTask={handleCreateTask}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'family-meds' && (
            <FamilyMedicationsScreen
              members={family}
              medications={meds}
              doses={doses}
              onSelectMedication={(m) => {
                setSelectedMed(m);
                setCurrentScreen('medication-detail');
              }}
              onCreateMember={handleCreateMember}
              onCreateMed={handleCreateMed}
              onRecordDose={(medId, time) => handleRecordDose(medId, time, 'administrado')}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'medication-detail' && (
            <MedicationDetailScreen
              medication={selectedMed || meds[0]}
              member={family.find(f => f.id === (selectedMed?.memberId || meds[0]?.memberId))}
              doses={doses}
              onBack={() => setCurrentScreen('family-meds')}
              onRecordDose={handleRecordDose}
            />
          )}

          {currentScreen === 'notifications' && (
            <NotificationsScreen
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onClearAll={handleClearNotifications}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'assistant' && (
            <AssistantScreen
              user={user}
              onNavigate={setCurrentScreen}
              onActionCompleted={loadUserData}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              user={user}
              onNavigate={setCurrentScreen}
              onLogout={handleLogout}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              user={user}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'family-dashboard' && (
            <FamilyDashboardScreen
              members={family}
              medications={meds}
              routines={routines}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'monthly-reports' && (
            <MonthlyReportsScreen
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'exceptional-day' && (
            <ExceptionalDayScreen
              exceptionalDays={exceptionalDays}
              onSetExceptionalDay={handleSetExceptionalDay}
              onNavigate={setCurrentScreen}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        unreadNotificationsCount={unreadNotifsCount}
      />

      {/* Voice Habit Recording Modal */}
      <VoiceHabitModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onRecorded={loadUserData}
      />

      {/* Exact Time Alarm & Locutora Watcher */}
      <ExactTimeAlarmWatcher routines={routines} medications={meds} />
    </div>
  );
}
