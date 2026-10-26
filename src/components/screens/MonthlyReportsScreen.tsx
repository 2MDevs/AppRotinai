import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, Check, Shield, AlertTriangle } from 'lucide-react';
import { ScreenId } from '../../types';

interface MonthlyReportsScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MonthlyReportsScreen: React.FC<MonthlyReportsScreenProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'mensal' | 'semanal'>('mensal');
  const [monthName, setMonthName] = useState('Novembro 2024');

  // Ring 1: 82% Hábitos positivos (completed)
  // Ring 2: 76% Evitados (negativos evitados)
  // Ring 3: 12% Negativos (ocorridos)
  const posRate = 82;
  const avoidRate = 76;
  const negRate = 12;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  const monthlyHistory = [
    { month: 'Ago', pos: 75, ev: 65, neg: 20 },
    { month: 'Set', pos: 80, ev: 70, neg: 15 },
    { month: 'Out', pos: 84, ev: 74, neg: 14 },
    { month: 'Nov', pos: 88, ev: 78, neg: 12 }
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-6 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Relatórios Mensais
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Visão aprofundada de consistência e equilíbrio
          </p>
        </div>
      </div>

      {/* Toggle Mensal / Semanal in Beige */}
      <div className="flex items-center p-1 bg-[#F5EFE6] border border-[#EAE3D6] rounded-2xl">
        <button
          onClick={() => setMode('mensal')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
            mode === 'mensal' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setMode('semanal')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
            mode === 'semanal' ? 'bg-white text-[#2C2824] shadow-2xs' : 'text-[#7A7165]'
          }`}
        >
          Semanal
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-2">
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#F5EFE6] transition cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold font-display text-[#2C2824]">
          {monthName}
        </span>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#F5EFE6] transition cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Resumo do Mês: 3 Donut Rings */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
          Resumo do mês
        </h2>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Ring 1: Green strictly for completed positive habits! */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} stroke="#F5EFE6" strokeWidth="6" fill="transparent" />
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  stroke="#2D6A4F"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (posRate / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold font-display text-[#2C2824] tabular-nums">
                {posRate}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#2C2824] mt-1">Hábitos positivos</span>
          </div>

          {/* Ring 2: Neutral stone for avoided */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} stroke="#F5EFE6" strokeWidth="6" fill="transparent" />
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  stroke="#8A8175"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (avoidRate / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold font-display text-[#2C2824] tabular-nums">
                {avoidRate}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#2C2824] mt-1">Evitados</span>
          </div>

          {/* Ring 3: Soft red for negative occurred */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} stroke="#F5EFE6" strokeWidth="6" fill="transparent" />
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  stroke="#E63946"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (negRate / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold font-display text-rose-950 tabular-nums">
                {negRate}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#2C2824] mt-1">Ocorridos</span>
          </div>
        </div>
      </div>

      {/* Evolução Mensal Bar Chart */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
            Evolução mensal
          </h2>
          <div className="flex items-center gap-3 text-[10px] text-[#7A7165]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-700" /> Positivos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#8A8175]" /> Evitados
            </span>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <div className="grid grid-cols-4 gap-4 items-end h-32 px-4">
            {monthlyHistory.map((m, i) => (
              <div key={i} className="flex flex-col items-center h-full justify-end">
                <div className="w-7 flex flex-col items-center gap-0.5 justify-end h-full">
                  <div
                    className="w-full bg-[#8A8175] rounded-xs"
                    style={{ height: `${(m.ev / 100) * 100}%` }}
                    title={`Evitados: ${m.ev}%`}
                  />
                  <div
                    className="w-full bg-emerald-700 rounded-t-xs"
                    style={{ height: `${(m.pos / 100) * 100}%` }}
                    title={`Positivos: ${m.pos}%`}
                  />
                </div>
                <span className="text-xs font-medium text-[#7A7165] mt-2">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
