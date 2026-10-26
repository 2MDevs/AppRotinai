import React, { useState } from 'react';
import { Plus, Check, Pill, Users, ChevronRight, AlertCircle, X } from 'lucide-react';
import { FamilyMember, Medication, MedicationDose, ScreenId } from '../../types';

interface FamilyMedicationsScreenProps {
  members: FamilyMember[];
  medications: Medication[];
  doses: MedicationDose[];
  onSelectMedication: (med: Medication) => void;
  onCreateMember: (member: Partial<FamilyMember>) => Promise<void>;
  onCreateMed: (med: Partial<Medication>) => Promise<void>;
  onRecordDose: (medId: string, time: string) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const FamilyMedicationsScreen: React.FC<FamilyMedicationsScreenProps> = ({
  members,
  medications,
  doses,
  onSelectMedication,
  onCreateMember,
  onCreateMed,
  onRecordDose,
  onNavigate
}) => {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);

  // New member form
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('');
  const [memberRel, setMemberRel] = useState('Filho(a)');

  // New med form
  const [medName, setMedName] = useState('');
  const [medMemberId, setMedMemberId] = useState(members[0]?.id || '');
  const [medDosage, setMedDosage] = useState('5ml');
  const [medTimes, setMedTimes] = useState('08:00, 20:00');
  const [medInstructions, setMedInstructions] = useState('Após as refeições');

  const [saving, setSaving] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    setSaving(true);
    try {
      await onCreateMember({
        name: memberName.trim(),
        ageText: memberAge.trim(),
        relationship: memberRel
      });
      setMemberName('');
      setMemberAge('');
      setShowMemberModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    setSaving(true);
    try {
      const times = medTimes.split(',').map(t => t.trim()).filter(Boolean);
      await onCreateMed({
        name: medName.trim(),
        memberId: medMemberId || members[0]?.id,
        dosage: medDosage.trim(),
        scheduleTimes: times,
        instructions: medInstructions.trim(),
        notificationEnabled: true
      });
      setMedName('');
      setShowMedModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-6 bg-[#FAF7F2]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Família & Medicamentos
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Cuidado e saúde compartilhados com atenção
          </p>
        </div>

        <button
          onClick={() => onNavigate('family-dashboard')}
          className="h-9 px-3 rounded-xl border border-[#DCD3C4] bg-white text-[#2C2824] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5EFE6] transition shadow-2xs"
        >
          <Users className="w-3.5 h-3.5 text-[#5C5446]" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Family Members Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
            Dependentes & Cuidadores
          </h2>
          <button
            onClick={() => setShowMemberModal(true)}
            className="text-xs text-[#2C2824] font-semibold hover:underline decoration-[#DCD3C4]"
          >
            + Adicionar membro
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center min-w-[76px] p-2.5 rounded-2xl bg-white border border-[#EAE3D6] shadow-2xs"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5EFE6] flex items-center justify-center text-[#2C2824] font-bold text-sm mb-1.5 ring-2 ring-[#EAE3D6]">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{member.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-bold text-[#2C2824] truncate max-w-[70px]">{member.name}</span>
              <span className="text-[10px] text-[#7A7165]">{member.ageText}</span>
            </div>
          ))}

          <button
            onClick={() => setShowMemberModal(true)}
            className="flex flex-col items-center justify-center min-w-[76px] h-[98px] rounded-2xl border-2 border-dashed border-[#DCD3C4] hover:border-[#2C2824] bg-white transition text-[#7A7165] hover:text-[#2C2824]"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Novo</span>
          </button>
        </div>
      </div>

      {/* Medications Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
            Medicamentos de Hoje
          </h2>
          <span className="text-xs text-[#5C5446] font-semibold">
            {medications.length} planos ativos
          </span>
        </div>

        <div className="space-y-2.5">
          {medications.map((med) => {
            const member = members.find(m => m.id === med.memberId);
            const medDoses = doses.filter(d => d.medicationId === med.id);
            const administeredCount = medDoses.filter(d => d.status === 'administrado').length;
            const totalScheduled = med.scheduleTimes.length;
            const isAllDone = totalScheduled > 0 && administeredCount === totalScheduled;

            return (
              <div
                key={med.id}
                onClick={() => onSelectMedication(med)}
                className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#DCD3C4] transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#2C2824] group-hover:text-[#4A443D] transition">
                      {member?.name || 'Familiar'} — {med.name}
                    </h3>
                    <div className="text-[11px] text-[#7A7165] mt-0.5">
                      {med.scheduleTimes.join(' · ')} · {med.dosage}
                    </div>
                    {/* Green strictly when administered! */}
                    <div className={`text-[11px] font-semibold mt-1 ${isAllDone ? 'text-emerald-800' : 'text-[#6C6354]'}`}>
                      Hoje: {administeredCount}/{totalScheduled} {isAllDone ? '(Concluído)' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    isAllDone ? 'bg-emerald-800 text-white shadow-2xs' : 'border-2 border-[#DCD3C4] text-transparent'
                  }`}>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Medication Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowMedModal(true)}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar medicamento</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl bg-white border border-[#EAE3D6] p-3 text-[10px] text-[#7A7165] leading-relaxed text-center">
        O RotinAPP é uma ferramenta de apoio à organização familiar e não substitui prescrições, consultas ou diagnósticos médicos.
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Novo Membro Familiar</h3>
              <button onClick={() => setShowMemberModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sofia, Lucas, Vovó Helena"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Idade ou descrição</label>
                <input
                  type="text"
                  placeholder="Ex: 4 anos, Idoso, Bebê"
                  value={memberAge}
                  onChange={(e) => setMemberAge(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Salvar Membro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Novo Medicamento</h3>
              <button onClick={() => setShowMedModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMed} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Nome do medicamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amoxicilina, Vitamina C"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Para quem é?</label>
                <select
                  value={medMemberId}
                  onChange={(e) => setMedMemberId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.ageText})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A443D] mb-1">Dosagem</label>
                  <input
                    type="text"
                    placeholder="Ex: 5ml, 1 comprimido"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A443D] mb-1">Horários (separar por vírgula)</label>
                  <input
                    type="text"
                    placeholder="08:00, 20:00"
                    value={medTimes}
                    onChange={(e) => setMedTimes(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Instruções prescritas</label>
                <input
                  type="text"
                  placeholder="Ex: Tomar com água após o almoço"
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Salvar Medicamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
