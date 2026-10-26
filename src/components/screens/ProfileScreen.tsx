import React from 'react';
import { ArrowLeft, User, Target, Award, Crown, ChevronRight, Sparkles } from 'lucide-react';
import { User as UserType, ScreenId } from '../../types';

interface ProfileScreenProps {
  user: UserType;
  onNavigate: (screen: ScreenId) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate }) => {
  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-6 bg-[#FAF7F2]">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold text-[#2C2824]">
          Perfil da Usuária
        </h1>
      </div>

      {/* User Card */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-6 shadow-2xs text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F5EFE6] flex items-center justify-center text-[#2C2824] font-bold text-2xl mb-3 shadow-2xs ring-4 ring-[#EAE3D6]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{user.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <h2 className="text-base font-bold font-display text-[#2C2824]">{user.name}</h2>
        <p className="text-xs text-[#7A7165] mt-0.5">{user.email}</p>
        <span className="mt-2 text-[10px] font-semibold text-[#5C5446] bg-[#F5EFE6] px-3 py-1 rounded-full">
          Plano Vitalício Familiar
        </span>
      </div>

      {/* Profile Sections */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white shadow-2xs overflow-hidden divide-y divide-[#EAE3D6]">
        <div className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Editar perfil</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A89F93]" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Objetivos e Metas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A89F93]" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Conquistas & Frequência</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A89F93]" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Assinatura (Premium Ativo)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A89F93]" />
        </div>
      </div>

      {/* Motivational Card in Warm Dark Stone */}
      <div className="rounded-3xl bg-[#2C2824] text-white p-5 shadow-xs flex items-center gap-4 border border-[#3D3730]">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-[#D8CFBF]" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white">Você já evoluiu muito!</h3>
          <p className="text-[11px] text-[#D8CFBF] mt-0.5 leading-relaxed">
            Pequenos hábitos diários constroem grandes transformações. Continue com leveza e calma.
          </p>
        </div>
      </div>
    </div>
  );
};
