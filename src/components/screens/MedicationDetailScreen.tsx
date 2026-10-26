import React, { useState } from 'react';
import { ArrowLeft, Pill, User, Clock, Bell, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Medication, FamilyMember, MedicationDose } from '../../types';

interface MedicationDetailScreenProps {
  medication: Medication;
  member?: FamilyMember;
  doses: MedicationDose[];
  onBack: () => void;
  onRecordDose: (medId: string, time: string, status: string) => Promise<void>;
}

export const MedicationDetailScreen: React.FC<MedicationDetailScreenProps> = ({
  medication,
  member,
  doses,
  onBack,
  onRecordDose
}) => {
  const [selectedTime, setSelectedTime] = useState(medication.scheduleTimes[0] || '08:00');
  const [recording, setRecording] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const medDoses = doses.filter(d => d.medicationId === medication.id);
  const administeredCount = medDoses.filter(d => d.status === 'administrado').length;
  const totalCount = medication.scheduleTimes.length;

  const handleAdminister = async () => {
    setRecording(true);
    setSuccessMsg(null);
    try {
      await onRecordDose(medication.id, selectedTime, 'administrado');
      setSuccessMsg(`Dose das ${selectedTime} registrada com sucesso!`);
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold text-[#2C2824]">
          {medication.name}
        </h1>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
        {/* Recipient */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A7165] block mb-1">
            Para quem é
          </label>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F5EFE6] border border-[#EAE3D6]">
            <User className="w-4 h-4 text-[#4A443D]" />
            <span className="text-xs font-semibold text-[#2C2824]">
              {member?.name || 'Familiar'} {member?.ageText ? `(${member.ageText})` : ''}
            </span>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A7165] block mb-1">
            Horários prescritos
          </label>
          <div className="flex items-center gap-2">
            {medication.scheduleTimes.map((t) => {
              const dose = medDoses.find(d => d.scheduledTime === t);
              const isDone = dose?.status === 'administrado';

              return (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedTime === t
                      ? 'border-[#2C2824] bg-[#F5EFE6] text-[#2C2824] shadow-2xs font-bold'
                      : 'border-[#EAE3D6] bg-white text-[#5C5446] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t}</span>
                  {/* Green strictly when administered */}
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dosage */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A7165] block mb-1">
            Dosagem
          </label>
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs font-medium text-[#2C2824]">
            {medication.dosage}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A7165] block mb-1">
            Instruções prescritas
          </label>
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs text-[#5C5446] leading-relaxed">
            {medication.instructions || 'Tomar conforme orientação médica.'}
          </div>
        </div>

        {/* Notification toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D6]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#5C5446]" />
            <span className="text-xs font-semibold text-[#2C2824]">Lembrete de notificação</span>
          </div>
          <span className="text-xs font-semibold text-[#5C5446] bg-[#F5EFE6] px-2.5 py-0.5 rounded-md">
            Ativo
          </span>
        </div>

        {/* Status today */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D6]">
          <span className="text-xs text-[#7A7165]">Status de hoje:</span>
          <span className="text-xs font-bold text-[#2C2824] tabular-nums">
            {administeredCount} de {totalCount} doses administradas
          </span>
        </div>
      </div>

      {/* Action Button: Registrar dose in stone/espresso */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleAdminister}
          disabled={recording}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs disabled:opacity-75 cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#D8CFBF]" />
          <span>Registrar administração ({selectedTime})</span>
        </button>

        <button
          onClick={onBack}
          className="w-full h-11 rounded-2xl border border-[#DCD3C4] bg-white text-[#2C2824] text-xs font-semibold hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          Voltar
        </button>
      </div>

      {/* Health Disclaimer */}
      <div className="rounded-2xl bg-white border border-[#EAE3D6] p-3 flex items-start gap-2 text-[10px] text-[#7A7165] leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#7A7165] shrink-0 mt-0.5" />
        <span>
          Atenção: Registre apenas doses que já foram efetivamente dadas ao paciente para manter o histórico seguro. Em caso de dúvidas médicas, contate seu pediatra ou médico de confiança.
        </span>
      </div>
    </div>
  );
};
