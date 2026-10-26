import React from 'react';
import { Home, CheckCircle2, Clock, Users, Menu, Sparkles, Bell, Calendar, BarChart3, Settings, ShieldAlert, Bot } from 'lucide-react';
import { ScreenId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadNotificationsCount?: number;
}

export const BottomNav: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  unreadNotificationsCount = 0
}) => {
  const tabs = [
    { id: 'dashboard' as ScreenId, label: 'Início', icon: Home },
    { id: 'habits' as ScreenId, label: 'Hábitos', icon: CheckCircle2 },
    { id: 'routines' as ScreenId, label: 'Rotinas', icon: Clock },
    { id: 'family-meds' as ScreenId, label: 'Família', icon: Users },
    { id: 'settings' as ScreenId, label: 'Mais', icon: Menu },
  ];

  const isTabActive = (tabId: ScreenId) => {
    if (tabId === 'dashboard' && currentScreen === 'dashboard') return true;
    if (tabId === 'habits' && (currentScreen === 'habits' || currentScreen === 'habit-groups' || currentScreen === 'habit-charts')) return true;
    if (tabId === 'routines' && (currentScreen === 'routines' || currentScreen === 'routine-detail' || currentScreen === 'recurring-tasks')) return true;
    if (tabId === 'family-meds' && (currentScreen === 'family-meds' || currentScreen === 'family-dashboard' || currentScreen === 'medication-detail')) return true;
    if (tabId === 'settings' && (currentScreen === 'settings' || currentScreen === 'profile' || currentScreen === 'notifications' || currentScreen === 'calendar' || currentScreen === 'monthly-reports' || currentScreen === 'exceptional-day' || currentScreen === 'assistant')) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#EAE3D6] pb-safe md:hidden shadow-xs">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
                active ? 'text-[#2C2824]' : 'text-[#8A8175] hover:text-[#2C2824]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {tab.id === 'settings' && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#8A8175]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${active ? 'font-bold text-[#2C2824]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  unreadNotificationsCount = 0
}) => {
  const navSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as ScreenId, label: 'Visão Geral (Hoje)', icon: Home },
        { id: 'habits' as ScreenId, label: 'Hábitos do Dia', icon: CheckCircle2 },
        { id: 'habit-groups' as ScreenId, label: 'Grupos de Hábitos', icon: Menu },
        { id: 'habit-charts' as ScreenId, label: 'Gráficos de Sucesso', icon: BarChart3 },
      ]
    },
    {
      title: 'Tempo & Rotinas',
      items: [
        { id: 'routines' as ScreenId, label: 'Rotinas Diárias', icon: Clock },
        { id: 'recurring-tasks' as ScreenId, label: 'Tarefas Recorrentes', icon: Calendar },
        { id: 'calendar' as ScreenId, label: 'Agenda & Calendário', icon: Calendar },
        { id: 'exceptional-day' as ScreenId, label: 'Dia Fora da Rotina', icon: ShieldAlert },
      ]
    },
    {
      title: 'Família & Saúde',
      items: [
        { id: 'family-meds' as ScreenId, label: 'Família & Medicamentos', icon: Users },
        { id: 'family-dashboard' as ScreenId, label: 'Dashboard Familiar', icon: Users },
      ]
    },
    {
      title: 'Inteligência & Ajustes',
      items: [
        { id: 'assistant' as ScreenId, label: 'Assistente RotinAI', icon: Bot },
        { id: 'notifications' as ScreenId, label: 'Notificações', icon: Bell, badge: unreadNotificationsCount },
        { id: 'monthly-reports' as ScreenId, label: 'Relatórios Mensais', icon: BarChart3 },
        { id: 'settings' as ScreenId, label: 'Configurações', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[#EAE3D6] bg-[#F5EFE6] z-30 p-5 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EAE3D6]">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2C2824] text-[#F5EFE6] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#E0D7C6]" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-[#2C2824] tracking-tight leading-none">
              RotinAPP
            </div>
            <div className="text-[11px] text-[#7A7165] mt-0.5">
              Sua rotina, com mais leveza
            </div>
          </div>
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-6 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#8A8175] px-3 mb-2">
              {sec.title}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#2C2824] text-white shadow-2xs font-semibold'
                        : 'text-[#4A443D] hover:text-[#2C2824] hover:bg-[#EAE3D6]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#7A7165]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-[#4A443D] text-white' : 'bg-[#EAE3D6] text-[#2C2824] font-semibold'}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer install & account */}
      <div className="pt-4 border-t border-[#EAE3D6] flex items-center justify-between">
        <PWAInstallButton />
        <button
          onClick={() => onNavigate('profile')}
          className="text-xs text-[#5C5446] hover:text-[#2C2824] font-medium"
        >
          Meu Perfil
        </button>
      </div>
    </aside>
  );
};
