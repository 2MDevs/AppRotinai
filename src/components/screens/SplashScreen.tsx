import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Clock } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onLogin, onDemo }) => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Brand Logo */}
      <div className="pt-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#2C2824] text-[#FAF7F2] flex items-center justify-center shadow-md mb-4 transform hover:scale-105 transition-transform">
          <svg className="w-12 h-12" viewBox="0 0 512 512" fill="none">
            <path
              d="M256 100 C 340 100, 400 160, 400 240 C 400 320, 330 390, 240 390 C 170 390, 120 340, 120 270 C 120 200, 170 150, 230 150 C 290 150, 320 190, 320 235 C 320 270, 290 300, 255 300 C 230 300, 210 280, 210 255"
              stroke="#D8CFBF"
              strokeWidth="32"
              strokeLinecap="round"
            />
            <circle cx="256" cy="256" r="22" fill="#EAE3D6" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#2C2824] tracking-tight">
          RotinAPP
        </h1>
        <p className="text-sm font-medium text-[#7A7165] mt-1">
          Sua rotina, com mais leveza.
        </p>
      </div>

      {/* Hero Description & Values */}
      <div className="my-auto py-8 text-center space-y-6">
        <p className="text-[#5C5446] text-sm leading-relaxed max-w-xs mx-auto">
          Hábitos, rotinas, família, lembretes e muito mais. Tudo em um só lugar acolhedor e sem sobrecarga.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-white border border-[#EAE3D6] rounded-2xl p-3 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5C5446] flex items-center justify-center mb-1.5">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Organize</span>
            <span className="text-[10px] text-[#7A7165] mt-0.5">Sem pressão</span>
          </div>

          <div className="bg-white border border-[#EAE3D6] rounded-2xl p-3 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5C5446] flex items-center justify-center mb-1.5">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Conquiste</span>
            <span className="text-[10px] text-[#7A7165] mt-0.5">Paz mental</span>
          </div>

          <div className="bg-white border border-[#EAE3D6] rounded-2xl p-3 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5C5446] flex items-center justify-center mb-1.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#2C2824]">Melhor versão</span>
            <span className="text-[10px] text-[#7A7165] mt-0.5">Um dia a dia</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pb-safe">
        <button
          onClick={onStart}
          className="w-full h-13 rounded-2xl bg-[#2C2824] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#433D37] transition active:scale-[0.99]"
        >
          <span>Criar minha conta</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onLogin}
          className="w-full h-12 rounded-2xl border border-[#DCD3C4] bg-white text-[#2C2824] font-medium text-sm flex items-center justify-center hover:bg-[#FAF7F2] transition"
        >
          Já tenho uma conta
        </button>

        <button
          onClick={onDemo}
          className="w-full py-2 text-center text-xs font-semibold text-[#6C6354] hover:text-[#2C2824] transition underline decoration-[#DCD3C4]"
        >
          Ou experimentar demonstração guiada da Brenda Silva ✨
        </button>
      </div>
    </div>
  );
};
