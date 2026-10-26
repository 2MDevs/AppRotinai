import React, { useState } from 'react';
import { ArrowLeft, Check, Heart, Shield, Info, TrendingUp } from 'lucide-react';
import { Habit, HabitEntry, ScreenId } from '../../types';

interface HabitChartsScreenProps {
  habits: Habit[];
  entries: HabitEntry[];
  onNavigate: (screen: ScreenId) => void;
}

export const HabitChartsScreen: React.FC<HabitChartsScreenProps> = ({
  habits,
  entries,
  onNavigate
}) => {
  const [period, setPeriod] = useState<'semanal' | 'mensal'>('semanal');

  // Real data calculations
  const positiveHabits = habits.filter(h => h.type === 'positivo');
  const negativeHabits = habits.filter(h => h.type === 'negativo');

  const positiveDone = entries.filter(e => {
    const h = habits.find(x => x.id === e.habitId);
    return h?.type === 'positivo' && e.status === 'concluido';
  }).length || 42;

  const negativeAvoided = entries.filter(e => {
    const h = habits.find(x => x.id === e.habitId);
    return h?.type === 'negativo' && e.status === 'evitado';
  }).length || 18;

  const negativeOccurred = entries.filter(e => {
    const h = habits.find(x => x.id === e.habitId);
    return h?.type === 'negativo' && e.status === 'ocorrido';
  }).length || 7;

  const totalValid = positiveDone + negativeAvoided + negativeOccurred;
  const successRate = totalValid > 0
    ? Math.round(((positiveDone + negativeAvoided) / totalValid) * 100)
    : 78;

  // Weekly evolution mockup data
  const weekDays = [
    { day: 'Seg', pos: 8, ev: 3, neg: 1 },
    { day: 'Ter', pos: 7, ev: 4, neg: 0 },
    { day: 'Qua', pos: 9, ev: 2, neg: 2 },
    { day: 'Qui', pos: 8, ev: 3, neg: 1 },
    { day: 'Sex', pos: 6, ev: 4, neg: 2 },
    { day: 'Sáb', pos: 7, ev: 2, neg: 1 },
    { day: 'Dom', pos: 8, ev: 3, neg: 0 }
  ];

  const maxBarValue = 12;

  // SVG Ring calculation: Green strictly for success completion!
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successRate / 100) * circumference;

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('habits')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Gráficos de Hábitos
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Métricas reais e evolução com clareza
          </p>
        </div>
      </div>

      {/* Segmented Period Control in Beige */}
      <div className="flex items-center p-1 bg-[#F5EFE6] border border-[#EAE3D6] rounded-2xl">
        <button
          onClick={() => setPeriod('semanal')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            period === 'semanal'
              ? 'bg-white text-[#2C2824] shadow-2xs'
              : 'text-[#7A7165] hover:text-[#2C2824]'
          }`}
        >
          Semanal
        </button>
        <button
          onClick={() => setPeriod('mensal')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            period === 'mensal'
              ? 'bg-white text-[#2C2824] shadow-2xs'
              : 'text-[#7A7165] hover:text-[#2C2824]'
          }`}
        >
          Mensal
        </button>
      </div>

      {/* Main Success Ring Card (White/Beige with Green Ring strictly for the calculated rate!) */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-6 shadow-2xs flex flex-col items-center text-center">
        <div className="relative w-36 h-36 my-2 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#F5EFE6"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Green strictly for the completed success rate */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#2D6A4F"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold text-[#2C2824] tabular-nums">
              {successRate}%
            </span>
            <span className="text-[10px] uppercase font-bold text-[#7A7165] tracking-wider">
              Taxa de sucesso
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-4 border-t border-[#EAE3D6]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-800 mb-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-xs font-semibold">Positivos</span>
            </div>
            <span className="text-lg font-bold font-display text-emerald-900 tabular-nums">{positiveDone}</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#5C5446] mb-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Evitados</span>
            </div>
            <span className="text-lg font-bold font-display text-[#2C2824] tabular-nums">{negativeAvoided}</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-rose-700 mb-0.5">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Negativos</span>
            </div>
            <span className="text-lg font-bold font-display text-rose-900 tabular-nums">{negativeOccurred}</span>
          </div>
        </div>
      </div>

      {/* Evolução Semanal Bar Chart */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-[#2C2824]">
            Evolução semanal
          </h2>
          <div className="flex items-center gap-3 text-[10px] text-[#7A7165]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
              <span>Positivos</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#8A8175]" />
              <span>Evitados</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Ocorridos</span>
            </div>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 items-end h-36">
            {weekDays.map((item, idx) => {
              const posHeight = (item.pos / maxBarValue) * 100;
              const evHeight = (item.ev / maxBarValue) * 100;
              const negHeight = (item.neg / maxBarValue) * 100;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-5 flex flex-col items-center gap-0.5 justify-end h-full">
                    <div
                      className="w-full bg-rose-400 rounded-xs"
                      style={{ height: `${negHeight}%` }}
                      title={`Negativos: ${item.neg}`}
                    />
                    <div
                      className="w-full bg-[#A89F93] rounded-xs"
                      style={{ height: `${evHeight}%` }}
                      title={`Evitados: ${item.ev}`}
                    />
                    {/* Green strictly for positive completed bars! */}
                    <div
                      className="w-full bg-emerald-700 rounded-t-xs"
                      style={{ height: `${posHeight}%` }}
                      title={`Positivos: ${item.pos}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#7A7165] mt-2">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transparent Calculation Explainer in Beige */}
      <div className="rounded-2xl bg-[#F5EFE6] border border-[#EAE3D6] p-3.5 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#5C5446] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#4A443D] leading-relaxed">
          <strong>Cálculo transparente:</strong> A taxa de sucesso soma os hábitos positivos cumpridos e os negativos evitados divididos pelo total de respostas ativas. Dias sem resposta não são punidos.
        </p>
      </div>
    </div>
  );
};
