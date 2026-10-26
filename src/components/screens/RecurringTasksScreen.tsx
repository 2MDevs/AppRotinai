import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Clock, Calendar, Sparkles, X } from 'lucide-react';
import { RecurringTask, ScreenId } from '../../types';

interface RecurringTasksScreenProps {
  tasks: RecurringTask[];
  onCompleteTask: (id: string) => Promise<void>;
  onCreateTask: (task: Partial<RecurringTask>) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const RecurringTasksScreen: React.FC<RecurringTasksScreenProps> = ({
  tasks,
  onCompleteTask,
  onCreateTask,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'todas' | 'concluidas' | 'pendentes'>('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'diaria' | 'semanal' | 'mensal' | 'trimestral' | 'anual'>('semanal');
  const [ruleDescription, setRuleDescription] = useState('Toda segunda-feira');
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [saving, setSaving] = useState(false);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'concluidas') return t.status === 'concluida';
    if (filter === 'pendentes') return t.status === 'pendente';
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onCreateTask({
        title: title.trim(),
        frequency,
        ruleDescription: ruleDescription.trim() || 'Personalizado',
        daysRemaining: Number(daysRemaining) || 7
      });
      setTitle('');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('routines')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Tarefas Recorrentes
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Compromissos periódicos sem esquecimento
          </p>
        </div>
      </div>

      {/* Tabs in Beige */}
      <div className="flex items-center p-1 bg-[#F5EFE6] border border-[#EAE3D6] rounded-2xl">
        <button
          onClick={() => setFilter('todas')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            filter === 'todas' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('concluidas')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            filter === 'concluidas' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Concluídas
        </button>
        <button
          onClick={() => setFilter('pendentes')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            filter === 'pendentes' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Pendentes
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 pt-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => {
            const isDone = t.status === 'concluida';

            return (
              <div
                key={t.id}
                className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs flex items-center justify-between hover:border-[#DCD3C4] transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold text-[#2C2824] ${isDone ? 'line-through text-stone-400' : ''}`}>
                      {t.title}
                    </h3>
                    <div className="text-[11px] text-[#7A7165] mt-0.5">
                      {t.ruleDescription}
                    </div>
                    <div className="mt-1">
                      {/* Green strictly when completed! */}
                      {isDone ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          ✓ Concluída nesta rodada
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#6C6354] bg-[#F5EFE6] px-2.5 py-0.5 rounded-full tabular-nums">
                          Falta {t.daysRemaining} {t.daysRemaining === 1 ? 'dia' : 'dias'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onCompleteTask(t.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    isDone
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'border-2 border-[#DCD3C4] text-transparent hover:border-[#2C2824]'
                  }`}
                  title={isDone ? 'Concluída' : 'Marcar como concluída'}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-[#EAE3D6] text-center text-xs text-[#7A7165]">
            Nenhuma tarefa encontrada neste filtro.
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar rotina recorrente</span>
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Nova Tarefa Recorrente</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pesar as crianças, Trocar filtro de água"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">A cada 3 meses (Trimestral)</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Regra descritiva</label>
                <input
                  type="text"
                  placeholder="Ex: Todo dia 15, Toda sexta-feira, A cada 3 meses"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Dias restantes até a próxima</label>
                <input
                  type="number"
                  min={1}
                  value={daysRemaining}
                  onChange={(e) => setDaysRemaining(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
                >
                  {saving ? 'Criando...' : 'Salvar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
