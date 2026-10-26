import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Plane, Heart, HelpCircle, Check, ShieldAlert } from 'lucide-react';
import { ExceptionalDay, ScreenId } from '../../types';

interface ExceptionalDayScreenProps {
  exceptionalDays: ExceptionalDay[];
  onSetExceptionalDay: (day: Partial<ExceptionalDay>) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const ExceptionalDayScreen: React.FC<ExceptionalDayScreenProps> = ({
  exceptionalDays,
  onSetExceptionalDay,
  onNavigate
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const existingToday = exceptionalDays.find(d => d.date === today);

  const [reason, setReason] = useState<'trabalho' | 'viagem' | 'compromisso' | 'outro'>(
    existingToday?.reason || 'viagem'
  );
  const [notes, setNotes] = useState(existingToday?.notes || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const reasons = [
    { id: 'trabalho' as const, label: 'Trabalho ou Viagem a negócios', icon: Briefcase },
    { id: 'viagem' as const, label: 'Viagem de férias / Passeio', icon: Plane },
    { id: 'compromisso' as const, label: 'Compromisso pessoal ou saúde', icon: Heart },
    { id: 'outro' as const, label: 'Outro motivo imprevisto', icon: HelpCircle },
  ];

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onSetExceptionalDay({
        date: today,
        reason,
        notes
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Dia Fora da Rotina
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Flexibilidade sem culpa ou perda de progresso
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
          <span>Dia excepcional confirmado! Os cálculos de hábitos para hoje foram suspensos com carinho.</span>
        </div>
      )}

      {/* Main Illustration Card */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-6 shadow-2xs text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center mb-3">
          <Plane className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold font-display text-[#2C2824]">
          Você pode pausar a contagem hoje
        </h2>
        <p className="text-xs text-[#7A7165] mt-1 max-w-xs leading-relaxed">
          Você pode cancelar a contagem do dia para os hábitos e rotinas. Isso não afetará negativamente sua taxa de sucesso.
        </p>
      </div>

      {/* Reason Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#7A7165] block mb-1">
          Selecione o motivo:
        </label>

        {reasons.map((r) => {
          const Icon = r.icon;
          const active = reason === r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                active
                  ? 'border-[#2C2824] bg-[#F5EFE6] shadow-2xs'
                  : 'border-[#EAE3D6] bg-white hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  active ? 'bg-[#2C2824] text-white' : 'bg-[#FAF7F2] text-[#5C5446]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs ${active ? 'text-[#2C2824] font-bold' : 'text-[#4A443D] font-medium'}`}>
                  {r.label}
                </span>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                active ? 'border-[#2C2824] bg-[#2C2824] text-white' : 'border-[#DCD3C4]'
              }`}>
                {active && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Note */}
      <div>
        <label className="text-xs font-medium text-[#4A443D] block mb-1">
          Observação opcional
        </label>
        <input
          type="text"
          placeholder="Ex: Viagem para o sítio com a família"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-11 rounded-xl border border-[#DCD3C4] px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824] bg-white"
        />
      </div>

      {/* Safety Notice */}
      <div className="rounded-2xl bg-white border border-[#EAE3D6] p-3.5 flex items-start gap-2.5 text-[11px] text-[#5C5446] leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-[#7A7165] shrink-0 mt-0.5" />
        <span>
          Lembrete importante: A pausa do dia <strong>não suspende</strong> os lembretes de medicamentos prescritos para seus dependentes, preservando o cuidado com a saúde.
        </span>
      </div>

      {/* Confirm Button */}
      <div className="pt-2">
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs disabled:opacity-75 cursor-pointer"
        >
          {saving ? 'Confirmando...' : 'Confirmar Dia Fora da Rotina'}
        </button>
      </div>
    </div>
  );
};
