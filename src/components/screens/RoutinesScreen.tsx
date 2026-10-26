import React, { useState } from 'react';
import { Plus, Check, Clock, Calendar, ChevronRight, X } from 'lucide-react';
import { DailyRoutine, RoutineItem, ScreenId } from '../../types';

interface RoutinesScreenProps {
  routines: DailyRoutine[];
  onSelectRoutine: (routine: DailyRoutine) => void;
  onCreateRoutine: (routine: Partial<DailyRoutine>) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const RoutinesScreen: React.FC<RoutinesScreenProps> = ({
  routines,
  onSelectRoutine,
  onCreateRoutine,
  onNavigate
}) => {
  const [tab, setTab] = useState<'hoje' | 'calendario' | 'todas'>('hoje');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [category, setCategory] = useState('Manhã');
  const [itemsText, setItemsText] = useState('Acordar\nCafé da manhã');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const items: RoutineItem[] = itemsText
        .split('\n')
        .filter(t => t.trim().length > 0)
        .map((t, idx) => ({
          id: `item_${Date.now()}_${idx}`,
          routineId: '',
          title: t.trim(),
          completed: false,
          order: idx + 1
        }));

      await onCreateRoutine({
        title: title.trim(),
        startTime,
        endTime,
        category,
        items
      });
      setTitle('');
      setItemsText('');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Rotinas
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Do despertar ao sono com harmonia
          </p>
        </div>

        <button
          onClick={() => onNavigate('recurring-tasks')}
          className="h-9 px-3 rounded-xl border border-[#DCD3C4] bg-white text-[#2C2824] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5EFE6] transition shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-[#5C5446]" />
          <span>Recorrentes</span>
        </button>
      </div>

      {/* Tabs in Beige */}
      <div className="flex items-center p-1 bg-[#F5EFE6] border border-[#EAE3D6] rounded-2xl">
        <button
          onClick={() => setTab('hoje')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            tab === 'hoje' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => onNavigate('calendar')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            tab === 'calendario' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Calendário
        </button>
        <button
          onClick={() => setTab('todas')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            tab === 'todas' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Routine Timeline Cards in Beige */}
      <div className="space-y-3 pt-1">
        {routines.map((rot) => {
          const completedCount = rot.items.filter(i => i.completed).length;
          const isDone = rot.items.length > 0 && completedCount === rot.items.length;
          const isInProgress = completedCount > 0 && !isDone;

          return (
            <div
              key={rot.id}
              onClick={() => onSelectRoutine(rot)}
              className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#DCD3C4] transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#2C2824] group-hover:text-[#4A443D] transition">
                    {rot.title}
                  </h3>
                  <div className="text-[11px] text-[#7A7165] mt-0.5">
                    {rot.startTime} - {rot.endTime}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {/* Green strictly when completed! */}
                    {isDone ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Concluída
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[10px] font-semibold text-[#5C5446] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                        Em andamento ({completedCount}/{rot.items.length})
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#7A7165] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  isDone ? 'bg-emerald-800 text-white shadow-2xs' : 'border-2 border-[#DCD3C4] text-transparent'
                }`}>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Routine Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar rotina</span>
        </button>
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Nova Rotina Diária</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Título da rotina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rotina de estudos, Sono reparador"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A443D] mb-1">Início</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A443D] mb-1">Término</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Atividades (uma por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Alongar&#10;Café com calma&#10;Revisar compromissos"
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  className="w-full rounded-xl border border-[#DCD3C4] bg-white p-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
                >
                  {saving ? 'Criando...' : 'Salvar Rotina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
