import React from 'react';
import { ArrowLeft, Plus, Clock, Pill, Heart, Calendar, Users, ChevronRight } from 'lucide-react';
import { FamilyMember, Medication, DailyRoutine, ScreenId } from '../../types';

interface FamilyDashboardScreenProps {
  members: FamilyMember[];
  medications: Medication[];
  routines: DailyRoutine[];
  onNavigate: (screen: ScreenId) => void;
}

export const FamilyDashboardScreen: React.FC<FamilyDashboardScreenProps> = ({
  members,
  medications,
  routines,
  onNavigate
}) => {
  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-6 bg-[#FAF7F2]">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('family-meds')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Minha Família
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Visão integrada da rotina de quem você ama
          </p>
        </div>
      </div>

      {/* Family Members Row */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
            Membros ({members.length})
          </h2>
          <button
            onClick={() => onNavigate('family-meds')}
            className="text-xs text-[#5C5446] font-semibold hover:text-[#2C2824] underline decoration-[#DCD3C4] cursor-pointer"
          >
            Gerenciar
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center min-w-[72px]">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5EFE6] flex items-center justify-center text-[#2C2824] font-bold text-sm mb-1 ring-2 ring-[#EAE3D6]">
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{m.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-bold text-[#2C2824] truncate max-w-[68px]">{m.name}</span>
              <span className="text-[10px] text-[#7A7165]">{m.ageText}</span>
            </div>
          ))}

          <button
            onClick={() => onNavigate('family-meds')}
            className="flex flex-col items-center justify-center min-w-[72px] h-[88px] rounded-2xl border-2 border-dashed border-[#DCD3C4] hover:border-[#2C2824] text-[#7A7165] hover:text-[#2C2824] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-medium">Adicionar</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        <div
          onClick={() => onNavigate('routines')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs hover:border-[#DCD3C4] hover:bg-[#FAF7F2] cursor-pointer transition space-y-3"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#7A7165]">Rotinas da família</div>
            <div className="text-base font-bold font-display text-[#2C2824] mt-0.5">
              {routines.length || 5} hoje
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('family-meds')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs hover:border-[#DCD3C4] hover:bg-[#FAF7F2] cursor-pointer transition space-y-3"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#7A7165]">Medicamentos</div>
            <div className="text-base font-bold font-display text-[#2C2824] mt-0.5">
              {medications.length || 3} hoje
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('habits')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs hover:border-[#DCD3C4] hover:bg-[#FAF7F2] cursor-pointer transition space-y-3"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#7A7165]">Hábitos em grupo</div>
            <div className="text-base font-bold font-display text-[#2C2824] mt-0.5">
              7 ativos
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('calendar')}
          className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs hover:border-[#DCD3C4] hover:bg-[#FAF7F2] cursor-pointer transition space-y-3"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#7A7165]">Compromissos</div>
            <div className="text-base font-bold font-display text-[#2C2824] mt-0.5">
              2 próximos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
