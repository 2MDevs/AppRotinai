import React, { useState } from 'react';
import {
  Plus, Check, Mic, Layers, Clock, X, ChevronDown, ChevronUp,
  Home, User, Heart, Users, Briefcase, Activity, Folder, Sparkles
} from 'lucide-react';
import { Habit, HabitGroup, HabitEntry, HabitType, ScreenId } from '../../types';

interface HabitsScreenProps {
  habits: Habit[];
  groups: HabitGroup[];
  entries: HabitEntry[];
  onToggleHabit: (habitId: string) => void;
  onCreateHabit: (habit: Partial<Habit>) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
  onOpenVoiceModal: () => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  habits,
  groups,
  entries,
  onToggleHabit,
  onCreateHabit,
  onNavigate,
  onOpenVoiceModal
}) => {
  // Each group serves as a dropdown menu / accordion
  // Default first two groups open, user can toggle any group by clicking
  const [openGroupIds, setOpenGroupIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((g, idx) => {
      initial[g.id] = idx === 0 || idx === 1;
    });
    return initial;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitGroupId, setNewHabitGroupId] = useState(groups[0]?.id || '');
  const [newHabitType, setNewHabitType] = useState<HabitType>('positivo');
  const [newHabitReminder, setNewHabitReminder] = useState('08:00');
  const [saving, setSaving] = useState(false);

  const toggleGroup = (groupId: string) => {
    setOpenGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    groups.forEach(g => { allOpen[g.id] = true; });
    setOpenGroupIds(allOpen);
  };

  const collapseAll = () => {
    setOpenGroupIds({});
  };

  const getGroupIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('casa') || lower.includes('lar')) return Home;
    if (lower.includes('eu') || lower.includes('auto') || lower.includes('pessoal')) return User;
    if (lower.includes('matern') || lower.includes('filho') || lower.includes('amor')) return Heart;
    if (lower.includes('relacion') || lower.includes('casal') || lower.includes('amig')) return Users;
    if (lower.includes('trab') || lower.includes('foco') || lower.includes('carreira')) return Briefcase;
    if (lower.includes('saud') || lower.includes('corpo') || lower.includes('fitness')) return Activity;
    return Folder;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setSaving(true);
    try {
      const targetGroup = newHabitGroupId || groups[0]?.id;
      await onCreateHabit({
        name: newHabitName.trim(),
        description: newHabitDesc.trim(),
        groupId: targetGroup,
        type: newHabitType,
        reminderTime: newHabitReminder,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        frequency: 'Diária'
      });
      if (targetGroup) {
        setOpenGroupIds(prev => ({ ...prev, [targetGroup]: true }));
      }
      setNewHabitName('');
      setNewHabitDesc('');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  const ungroupedHabits = habits.filter(
    h => !groups.some(g => g.id === h.groupId)
  );

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Hábitos
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Acompanhe suas pequenas vitórias de hoje
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('habit-groups')}
            className="h-9 px-3 rounded-xl border border-[#DCD3C4] bg-white text-[#2C2824] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5EFE6] transition shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#5C5446]" />
            <span>Gerenciar Grupos</span>
          </button>
          <button
            onClick={onOpenVoiceModal}
            className="w-9 h-9 rounded-xl bg-[#2C2824] text-white flex items-center justify-center hover:bg-[#433D37] transition shadow-2xs cursor-pointer"
            title="Registrar por voz"
          >
            <Mic className="w-4 h-4 text-[#D8CFBF]" />
          </button>
        </div>
      </div>

      {/* Control bar: Light beige palette with Expand / Collapse actions */}
      <div className="flex items-center justify-between px-1 py-1 text-xs text-[#7A7165]">
        <span className="font-medium text-[11px] text-[#5C5446]">
          Grupos como menus suspensos ({groups.length})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] font-semibold text-[#5C5446] hover:text-[#2C2824] px-2 py-0.5 rounded-lg hover:bg-[#EAE3D6]/60 transition cursor-pointer"
          >
            Expandir todos
          </button>
          <span className="text-[#DCD3C4]">·</span>
          <button
            onClick={collapseAll}
            className="text-[11px] font-semibold text-[#5C5446] hover:text-[#2C2824] px-2 py-0.5 rounded-lg hover:bg-[#EAE3D6]/60 transition cursor-pointer"
          >
            Recolher todos
          </button>
        </div>
      </div>

      {/* Accordion / Dropdown Menus for each group */}
      <div className="space-y-3">
        {groups.map((grp) => {
          const groupHabits = habits.filter(h => h.groupId === grp.id);
          const isOpen = !!openGroupIds[grp.id];
          const GroupIcon = getGroupIcon(grp.name);

          // Calculate completed for today (green is strictly for completed!)
          const completedCount = groupHabits.filter(h => {
            const entry = entries.find(e => e.habitId === h.id);
            return h.type === 'positivo' ? entry?.status === 'concluido' : entry?.status === 'evitado';
          }).length;

          return (
            <div
              key={grp.id}
              className="rounded-3xl border border-[#EAE3D6] bg-white shadow-2xs overflow-hidden transition-all duration-200"
            >
              {/* Group Dropdown Trigger Header (Light warm beige) */}
              <button
                type="button"
                onClick={() => toggleGroup(grp.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <GroupIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold font-display text-[#2C2824]">
                        {grp.name}
                      </h2>
                      <span className="text-[10px] font-semibold text-[#5C5446] bg-[#F5EFE6] px-2 py-0.5 rounded-full tabular-nums">
                        {groupHabits.length} {groupHabits.length === 1 ? 'hábito' : 'hábitos'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#7A7165] mt-0.5">
                      {groupHabits.length > 0 ? (
                        <span>
                          {completedCount > 0 ? (
                            <strong className="text-emerald-800 font-semibold">{completedCount}</strong>
                          ) : (
                            '0'
                          )}{' '}
                          de {groupHabits.length} cumpridos hoje
                        </span>
                      ) : (
                        'Nenhum hábito cadastrado neste grupo'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center transition-transform">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Content: Habits belonging to this group */}
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-[#EAE3D6] bg-[#FAF7F2]/60">
                  {groupHabits.length > 0 ? (
                    groupHabits.map((habit) => {
                      const entry = entries.find(e => e.habitId === habit.id);
                      const isCompleted = habit.type === 'positivo'
                        ? entry?.status === 'concluido'
                        : entry?.status === 'evitado';

                      return (
                        <div
                          key={habit.id}
                          className="rounded-2xl border border-[#EAE3D6] bg-white p-3.5 shadow-2xs flex items-center justify-between hover:border-[#DCD3C4] transition"
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkmark Button: GREEN STRICTLY WHEN COMPLETED! */}
                            <button
                              type="button"
                              onClick={() => onToggleHabit(habit.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-[#2D6A4F] text-white shadow-2xs scale-105'
                                  : 'border-2 border-[#DCD3C4] text-transparent hover:border-[#2C2824]'
                              }`}
                              title={isCompleted ? 'Desmarcar' : 'Concluir'}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <div>
                              <h3 className={`text-xs font-semibold ${isCompleted ? 'text-[#2C2824]' : 'text-[#2C2824]'}`}>
                                {habit.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                <span
                                  className={`font-medium ${
                                    habit.type === 'positivo'
                                      ? 'text-[#5C5446]'
                                      : 'text-rose-700'
                                  }`}
                                >
                                  {habit.type === 'positivo' ? 'Positivo' : 'Negativo a evitar'}
                                </span>
                                {habit.reminderTime && (
                                  <>
                                    <span className="text-[#DCD3C4]">·</span>
                                    <span className="text-[#7A7165] flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5 inline" /> {habit.reminderTime}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge: GREEN STRICTLY WHEN COMPLETED! */}
                          {isCompleted ? (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                              ✓ {habit.type === 'positivo' ? 'Concluído' : 'Evitado'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleHabit(habit.id)}
                              className="text-[11px] text-[#7A7165] hover:text-[#2C2824] font-medium transition cursor-pointer"
                            >
                              Pendente
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-[#7A7165]">
                        Nenhum hábito cadastrado em {grp.name}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewHabitGroupId(grp.id);
                          setShowAddModal(true);
                        }}
                        className="mt-1.5 text-xs text-[#2C2824] hover:text-[#4A443D] font-semibold underline decoration-[#DCD3C4] cursor-pointer"
                      >
                        + Adicionar primeiro hábito aqui
                      </button>
                    </div>
                  )}

                  {/* Quick Add inside group */}
                  {groupHabits.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewHabitGroupId(grp.id);
                        setShowAddModal(true);
                      }}
                      className="w-full py-2 rounded-xl border border-dashed border-[#DCD3C4] text-[11px] font-medium text-[#5C5446] hover:text-[#2C2824] hover:bg-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar hábito em {grp.name}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Ungrouped Habits if any */}
        {ungroupedHabits.length > 0 && (
          <div className="rounded-3xl border border-[#EAE3D6] bg-white p-4 space-y-2">
            <h2 className="text-xs font-bold text-[#2C2824]">Outros Hábitos</h2>
            {ungroupedHabits.map((habit) => {
              const entry = entries.find(e => e.habitId === habit.id);
              const isCompleted = habit.type === 'positivo' ? entry?.status === 'concluido' : entry?.status === 'evitado';
              return (
                <div
                  key={habit.id}
                  className="rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] p-3.5 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isCompleted ? 'bg-[#2D6A4F] text-white' : 'border-2 border-[#DCD3C4]'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <div>
                      <h3 className="text-xs font-semibold text-[#2C2824]">{habit.name}</h3>
                      <span className="text-[10px] text-[#7A7165]">{habit.type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Habit Button: Warm Dark Stone (Green strictly for completed status) */}
      <div className="pt-2">
        <button
          onClick={() => {
            setNewHabitGroupId(groups[0]?.id || '');
            setShowAddModal(true);
          }}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-[#433D37] transition active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D8CFBF]" />
          <span>Adicionar hábito</span>
        </button>
      </div>

      {/* Add Habit Modal in Warm Beige */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Novo Hábito</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Nome do hábito</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beber 2L de água, Meditar 10min"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Descrição ou motivação (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Para mais energia e foco"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              {/* Positive vs Negative Switch */}
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1.5">Natureza do hábito</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewHabitType('positivo')}
                    className={`h-11 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      newHabitType === 'positivo'
                        ? 'border-[#2C2824] bg-[#F5EFE6] text-[#2C2824] font-bold shadow-2xs'
                        : 'border-[#DCD3C4] bg-white text-[#7A7165] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>Positivo (Praticar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewHabitType('negativo')}
                    className={`h-11 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      newHabitType === 'negativo'
                        ? 'border-rose-400 bg-rose-50 text-rose-900 font-bold shadow-2xs'
                        : 'border-[#DCD3C4] bg-white text-[#7A7165] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>Negativo (Evitar)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Grupo / Categoria</label>
                <select
                  value={newHabitGroupId}
                  onChange={(e) => setNewHabitGroupId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Horário do lembrete</label>
                <input
                  type="time"
                  value={newHabitReminder}
                  onChange={(e) => setNewHabitReminder(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
