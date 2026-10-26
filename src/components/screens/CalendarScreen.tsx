import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, Check } from 'lucide-react';
import { DailyRoutine, RecurringTask, ScreenId } from '../../types';

interface CalendarScreenProps {
  routines: DailyRoutine[];
  tasks: RecurringTask[];
  onNavigate: (screen: ScreenId) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  routines,
  tasks,
  onNavigate
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Outubro
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const dayTasks = [
    { id: '1', title: 'Rotina das crianças', time: '08:00', type: 'rotina' },
    { id: '2', title: 'Consulta médica', time: '16:00', type: 'compromisso' },
    { id: '3', title: 'Lavar roupas', time: '18:00', type: 'tarefa' },
    { id: '4', title: 'Jantar em família', time: '19:30', type: 'rotina' }
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold text-[#2C2824]">
          Agenda & Calendário
        </h1>
        <p className="text-xs text-[#7A7165] mt-0.5">
          Visão clara do mês e compromissos do dia
        </p>
      </div>

      {/* Calendar Card in Beige/White */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#F5EFE6] transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-bold font-display text-[#2C2824]">
            {months[currentMonthIndex]} 2024
          </span>

          <button
            onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#F5EFE6] transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((d, i) => (
            <span key={i} className="text-xs font-semibold text-[#8A8175] py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          <div />
          <div />

          {calendarDays.map((d) => {
            const isSelected = d === selectedDay;
            const hasEvent = d === 15 || d === 20 || d === 25;

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`h-9 w-9 mx-auto rounded-full text-xs font-medium flex flex-col items-center justify-center transition relative ${
                  isSelected
                    ? 'bg-[#2C2824] text-white font-bold shadow-xs'
                    : 'text-[#4A443D] hover:bg-[#F5EFE6]'
                }`}
              >
                <span>{d}</span>
                {hasEvent && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#8A8175] absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarefas do Dia */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-[#2C2824]">
            Tarefas do dia ({selectedDay} de {months[currentMonthIndex]})
          </h2>
          <span className="text-xs text-[#5C5446] font-semibold">
            {dayTasks.length} itens
          </span>
        </div>

        <div className="space-y-2">
          {dayTasks.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-[#EAE3D6] bg-white p-3.5 shadow-2xs flex items-center justify-between hover:border-[#DCD3C4] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#5C5446]" />
                <span className="text-xs font-semibold text-[#2C2824]">{t.title}</span>
              </div>
              <span className="text-xs font-medium text-[#5C5446] bg-[#F5EFE6] px-2.5 py-0.5 rounded-md tabular-nums">
                {t.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
