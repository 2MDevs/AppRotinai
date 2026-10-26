import React, { useState } from 'react';
import { ArrowLeft, Plus, ChevronRight, Home, User, Heart, Users, Briefcase, Activity, X, Folder } from 'lucide-react';
import { HabitGroup, Habit, ScreenId } from '../../types';

interface HabitGroupsScreenProps {
  groups: HabitGroup[];
  habits: Habit[];
  onNavigate: (screen: ScreenId) => void;
  onCreateGroup: (group: { name: string; icon?: string; color?: string }) => Promise<void>;
}

export const HabitGroupsScreen: React.FC<HabitGroupsScreenProps> = ({
  groups,
  habits,
  onNavigate,
  onCreateGroup
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4A443D');
  const [saving, setSaving] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'home':
      case 'casa':
        return Home;
      case 'user':
      case 'eu':
        return User;
      case 'heart':
      case 'maternidade':
        return Heart;
      case 'users':
      case 'relacionamentos':
        return Users;
      case 'briefcase':
      case 'trabalho':
        return Briefcase;
      default:
        return Activity;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreateGroup({ name: name.trim(), color, icon: 'Activity' });
      setName('');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 bg-[#FAF7F2]">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('habits')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-[#2C2824]">
            Grupos de Hábitos
          </h1>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Organize suas áreas de foco e bem-estar
          </p>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-2.5 pt-2">
        {groups.map((grp) => {
          const Icon = getIcon(grp.icon || grp.name);
          const count = habits.filter(h => h.groupId === grp.id).length;

          return (
            <div
              key={grp.id}
              onClick={() => onNavigate('habits')}
              className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#DCD3C4] hover:bg-[#FAF7F2] transition"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: grp.color || '#4A443D' }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2C2824]">{grp.name}</h3>
                  <p className="text-[11px] text-[#7A7165] mt-0.5">
                    {count} {count === 1 ? 'hábito cadastrado' : 'hábitos cadastrados'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#5C5446] bg-[#F5EFE6] px-2.5 py-0.5 rounded-full">
                  Ver no menu
                </span>
                <ChevronRight className="w-4 h-4 text-[#A89F93]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Button in Dark Stone / Beige */}
      <div className="pt-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D8CFBF]" />
          <span>Criar novo grupo</span>
        </button>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="text-sm font-bold font-display text-[#2C2824]">Novo Grupo de Hábitos</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7165] hover:bg-[#EAE3D6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1">Nome do grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Finanças, Estudos, Espiritualidade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-white px-3.5 text-xs text-[#2C2824] focus:outline-hidden focus:border-[#2C2824]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A443D] mb-1.5">Cor de identificação</label>
                <div className="flex items-center gap-2.5">
                  {['#4A443D', '#6B5E4F', '#8C7B68', '#C4B9A5', '#7D5A50', '#555B6E'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${color === c ? 'scale-125 ring-2 ring-[#2C2824] ring-offset-2' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition cursor-pointer"
                >
                  {saving ? 'Criando...' : 'Salvar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
