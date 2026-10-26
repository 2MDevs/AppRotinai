import React, { useState } from 'react';
import {
  User, Bell, Mic, Palette, RefreshCw, Shield, HelpCircle, LogOut,
  ChevronRight, ArrowLeft, Download, ShieldAlert, Sparkles, Check
} from 'lucide-react';
import { ScreenId, User as UserType } from '../../types';
import { api } from '../../services/api';
import { VoiceStudioCard } from '../VoiceStudioCard';
import { AccountLinkCard } from '../AccountLinkCard';

interface SettingsScreenProps {
  user: UserType;
  onNavigate: (screen: ScreenId) => void;
  onLogout: () => void;
  onLoadDemo: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onNavigate,
  onLogout,
  onLoadDemo
}) => {
  const [exporting, setExporting] = useState(false);
  const [demoLoadedMsg, setDemoLoadedMsg] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rotinapp_dados_${user.email}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao exportar dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleLoadDemoClick = async () => {
    await onLoadDemo();
    setDemoLoadedMsg(true);
    setTimeout(() => setDemoLoadedMsg(false), 3000);
  };

  const menuItems = [
    { id: 'profile' as ScreenId, label: 'Minha conta', icon: User, desc: user.email },
    { id: 'notifications' as ScreenId, label: 'Notificações', icon: Bell, desc: 'Lembretes e avisos' },
    { id: 'exceptional-day' as ScreenId, label: 'Dia fora da rotina', icon: ShieldAlert, desc: 'Pausar contagem sem culpa' },
    { id: 'monthly-reports' as ScreenId, label: 'Relatórios mensais', icon: RefreshCw, desc: 'Histórico e taxas' },
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold text-[#2C2824]">
          Configurações
        </h1>
        <p className="text-xs text-[#7A7165] mt-0.5">
          Preferências, privacidade e personalização
        </p>
      </div>

      {demoLoadedMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Dados demonstrativos da Brenda Silva carregados com sucesso!</span>
        </div>
      )}

      {/* Profile quick banner */}
      <div
        onClick={() => onNavigate('profile')}
        className="rounded-3xl border border-[#EAE3D6] bg-white p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#DCD3C4] hover:bg-[#FAF7F2] transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5EFE6] flex items-center justify-center text-[#2C2824] font-bold text-base ring-2 ring-[#EAE3D6]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#2C2824]">{user.name}</h2>
            <p className="text-[11px] text-[#7A7165]">{user.email}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#A89F93]" />
      </div>

      {/* Voice Studio Card for Testing Locutora Voice */}
      <VoiceStudioCard />

      {/* Account Linking & Shared Routines */}
      <AccountLinkCard />

      {/* Menu List */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white shadow-2xs overflow-hidden divide-y divide-[#EAE3D6]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF7F2] transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#4A443D] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2C2824]">{item.label}</div>
                  <div className="text-[11px] text-[#7A7165]">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A89F93]" />
            </button>
          );
        })}
      </div>

      {/* LGPD & Data Export */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7165]">
          Privacidade & Dados (LGPD)
        </h3>
        <p className="text-[11px] text-[#7A7165] leading-relaxed">
          Seus dados de rotina e saúde são estritamente privados. Você pode exportar uma cópia completa a qualquer momento.
        </p>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="w-full h-11 rounded-xl border border-[#DCD3C4] bg-[#FAF7F2] text-[#2C2824] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#F5EFE6] transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#5C5446]" />
          <span>{exporting ? 'Exportando...' : 'Exportar todos os meus dados (JSON)'}</span>
        </button>
      </div>

      {/* Demo loader button in warm beige */}
      <div className="rounded-3xl border border-[#EAE3D6] bg-[#F5EFE6] p-4 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[#2C2824]">Demonstração da Brenda</div>
          <div className="text-[11px] text-[#7A7165] mt-0.5">Preencher as 20 telas com dados de exemplo</div>
        </div>
        <button
          onClick={handleLoadDemoClick}
          className="px-3.5 py-1.5 rounded-xl bg-[#2C2824] text-white text-xs font-semibold hover:bg-[#433D37] transition shadow-2xs cursor-pointer"
        >
          Carregar
        </button>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full h-12 rounded-2xl border border-rose-200 bg-white text-rose-800 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-50 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
};
