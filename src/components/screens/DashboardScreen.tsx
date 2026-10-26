import React from 'react';
import { Sparkles, Bell, Mic, Plus, Check, ArrowRight, Heart, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { User, Habit, HabitEntry, DailyRoutine, ScreenId } from '../../types';

interface DashboardScreenProps {
  user: User;
  habits: Habit[];
  entries: HabitEntry[];
  routines: DailyRoutine[];
  onNavigate: (screen: ScreenId) => void;
  onOpenVoiceModal: () => void;
  onToggleHabit: (habitId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  habits,
  entries,
  routines,
  onNavigate,
  onOpenVoiceModal,
  onToggleHabit
}) => {
  // Calculations
  const today = new Date().toISOString().slice(0, 10);
  const positiveHabits = habits.filter(h => h.type === 'positivo');
  const negativeHabits = habits.filter(h => h.type === 'negativo');

  const positiveCompleted = entries.filter(e => {
    const habit = habits.find(h => h.id === e.habitId);
    return habit?.type === 'positivo' && e.status === 'concluido';
  }).length;

  const negativeAvoided = entries.filter(e => {
    const habit = habits.find(h => h.id === e.habitId);
    return habit?.type === 'negativo' && e.status === 'evitado';
  }).length;

  const totalHabitsCount = habits.length;
  const answeredCount = entries.filter(e => e.status !== 'nao_respondido' && e.status !== 'nao_aplica').length;
  const percentage = answeredCount > 0
    ? Math.round(((positiveCompleted + negativeAvoided) / (totalHabitsCount || answeredCount)) * 100)
    : 0;

  // Next commitments
  const nextRoutines = routines.slice(0, 2);

  // SVG Progress Ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824] flex items-center gap-2">
            <span>Olá, {user.name.split(' ')[0]}!</span>
            <span className="text-amber-600 text-lg">☀️</span>
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Que bom te ver por aqui!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('notifications')}
            className="w-10 h-10 rounded-full border border-[#EAE3D6] bg-white flex items-center justify-center text-[#4A443D] hover:text-[#2C2824] hover:bg-[#F5EFE6] transition shadow-2xs"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="w-10 h-10 rounded-full bg-[#2C2824] text-[#FAF7F2] flex items-center justify-center hover:bg-[#433D37] transition shadow-2xs"
            title="Assistente IA"
          >
            <Sparkles className="w-4 h-4 text-[#D8CFBF]" />
          </button>
        </div>
      </div>

      {/* Main Progress Ring Card (Warm Dark Stone with Green ONLY for the completed progress circle) */}
      <div className="rounded-3xl bg-[#2C2824] text-[#FAF7F2] p-6 shadow-sm flex items-center justify-between border border-[#3E3832]">
        <div>
          <span className="text-xs font-semibold text-[#C4B9A5] uppercase tracking-wider block mb-1">
            Seu dia de hoje
          </span>
          <div className="text-3xl font-display font-bold tabular-nums text-white">
            {percentage}%
          </div>
          <p className="text-xs text-[#D8CFBF] mt-1 max-w-[140px] leading-tight">
            {percentage >= 60 ? 'Excelente ritmo! Siga com tranquilidade.' : 'Dê o primeiro passo com carinho.'}
          </p>
          <button
            onClick={() => onNavigate('habit-charts')}
            className="mt-3 text-[11px] font-semibold text-[#E0D7C6] hover:text-white flex items-center gap-1 transition"
          >
            <span>Ver evolução semanal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Green strictly for the completed percentage! */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#2D6A4F"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold font-display tabular-nums text-white">{percentage}%</span>
            <span className="text-[9px] text-[#C4B9A5]">concluído</span>
          </div>
        </div>
      </div>

      {/* Two Metric Cards in Beige */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => onNavigate('habits')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 text-left transition hover:bg-[#FAF7F2] shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            {/* Green reserved for completed count */}
            <span className="text-2xl font-bold font-display text-emerald-800 tabular-nums">
              {positiveCompleted || positiveHabits.length}
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xs font-semibold text-[#2C2824]">Hábitos positivos</div>
          <div className="text-[11px] text-[#7A7165] mt-0.5">cumpridos hoje</div>
        </button>

        <button
          onClick={() => onNavigate('habits')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 text-left transition hover:bg-[#FAF7F2] shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold font-display text-rose-800 tabular-nums">
              {negativeAvoided || negativeHabits.length}
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-semibold text-[#2C2824]">Hábitos a melhorar</div>
          <div className="text-[11px] text-[#7A7165] mt-0.5">prevenção consciente</div>
        </button>
      </div>

      {/* Voice Check-in Banner in Beige */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-[#F5EFE6] p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenVoiceModal}
            className="w-12 h-12 rounded-2xl bg-[#2C2824] text-[#FAF7F2] flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
          >
            <Mic className="w-6 h-6 text-[#D8CFBF]" />
          </button>
          <div>
            <div className="text-xs font-bold text-[#2C2824]">Registrar com voz</div>
            <p className="text-[11px] text-[#7A7165]">Diga o que você fez ou evitou hoje</p>
          </div>
        </div>
        <button
          onClick={onOpenVoiceModal}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DCD3C4] text-[#2C2824] text-xs font-semibold hover:bg-[#FAF7F2] transition"
        >
          Falar agora
        </button>
      </div>

      {/* Próximos Compromissos & Rotinas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-[#2C2824]">
            Próximos compromissos
          </h2>
          <button
            onClick={() => onNavigate('routines')}
            className="text-xs text-[#5C5446] font-semibold hover:text-[#2C2824]"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-2">
          {nextRoutines.length > 0 ? (
            nextRoutines.map((rot) => (
              <div
                key={rot.id}
                onClick={() => onNavigate('routine-detail')}
                className="rounded-2xl border border-[#EAE3D6] bg-white p-3.5 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2C2824]">{rot.title}</div>
                    <div className="text-[11px] text-[#7A7165] mt-0.5">
                      {rot.startTime} - {rot.endTime} · {rot.category}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#4A443D] bg-[#F5EFE6] px-2.5 py-0.5 rounded-md">
                  {rot.startTime}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] text-center text-xs text-[#7A7165]">
              Nenhuma rotina agendada para hoje.
            </div>
          )}
        </div>
      </div>

      {/* Hábitos de Destaque Hoje (Green ONLY when completed!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-[#2C2824]">
            Hábitos de hoje
          </h2>
          <button
            onClick={() => onNavigate('habits')}
            className="text-xs text-[#5C5446] font-semibold hover:text-[#2C2824]"
          >
            Gerenciar
          </button>
        </div>

        <div className="space-y-2">
          {habits.slice(0, 4).map((h) => {
            const entry = entries.find(e => e.habitId === h.id);
            const isDone = h.type === 'positivo' ? entry?.status === 'concluido' : entry?.status === 'evitado';

            return (
              <div
                key={h.id}
                className="rounded-2xl border border-[#EAE3D6] bg-white p-3.5 shadow-2xs flex items-center justify-between hover:border-[#DCD3C4] transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleHabit(h.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      isDone
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'border-2 border-[#DCD3C4] text-transparent hover:border-[#2C2824]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-[#2C2824]">{h.name}</div>
                    <div className="text-[10px] text-[#7A7165] mt-0.5">
                      {h.type === 'positivo' ? (
                        <span className="text-[#5C5446]">Positivo</span>
                      ) : (
                        <span className="text-rose-700">Negativo a evitar</span>
                      )}
                    </div>
                  </div>
                </div>

                {isDone && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {h.type === 'positivo' ? 'Concluído' : 'Evitado'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
