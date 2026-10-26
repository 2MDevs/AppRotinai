import React, { useState } from 'react';
import { ArrowLeft, Clock, Check, Bell, Plus, Edit2 } from 'lucide-react';
import { DailyRoutine } from '../../types';

interface RoutineDetailScreenProps {
  routine: DailyRoutine;
  onBack: () => void;
  onToggleItem: (routineId: string, itemId: string) => void;
}

export const RoutineDetailScreen: React.FC<RoutineDetailScreenProps> = ({
  routine,
  onBack,
  onToggleItem
}) => {
  const [notifActive, setNotifActive] = useState(routine.notificationEnabled);

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold text-[#2C2824]">
          {routine.title}
        </h1>
      </div>

      {/* Routine Time Header Card */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#2C2824]">
              {routine.startTime} - {routine.endTime}
            </div>
            <div className="text-xs text-[#7A7165] mt-0.5">
              Todos os dias
            </div>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#5C5446] bg-[#F5EFE6] px-3 py-1 rounded-full">
          {routine.category}
        </span>
      </div>

      {/* Sub-activities Checklist */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
            Passo a passo da rotina
          </h2>
          <span className="text-xs text-[#2C2824] font-semibold">
            {routine.items.filter(i => i.completed).length} de {routine.items.length}
          </span>
        </div>

        <div className="space-y-2">
          {routine.items.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(routine.id, item.id)}
              className="flex items-center justify-between p-3 rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] hover:bg-white cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                {/* Green strictly when item is completed! */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                    item.completed
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'border-2 border-[#DCD3C4] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className={`text-xs font-medium ${item.completed ? 'text-stone-400 line-through' : 'text-[#2C2824]'}`}>
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Toggle Card */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#5C5446]" />
            <span className="text-xs font-bold text-[#2C2824]">Notificação e lembrete</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifActive}
              onChange={() => setNotifActive(!notifActive)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#EAE3D6] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2C2824]" />
          </label>
        </div>

        {notifActive && (
          <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between text-xs text-[#5C5446]">
            <span>Aviso de antecedência</span>
            <span className="font-semibold text-[#2C2824] bg-[#F5EFE6] px-2 py-0.5 rounded-md">
              {routine.reminderMinutes} min antes
            </span>
          </div>
        )}
      </div>

      {/* Edit Action Button */}
      <div className="pt-2">
        <button
          onClick={onBack}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Salvar alterações</span>
        </button>
      </div>
    </div>
  );
};
