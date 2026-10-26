import React, { useState } from 'react';
import { ArrowLeft, Bell, Check, Clock, ShieldCheck, CheckCheck } from 'lucide-react';
import { AppNotification, ScreenId } from '../../types';

interface NotificationsScreenProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onMarkRead,
  onClearAll,
  onNavigate
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [msg, setMsg] = useState<string | null>(null);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      setMsg('Notificações push não são suportadas neste navegador.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        setMsg('Permissão concedida! Os lembretes chegarão na hora programada.');
        new Notification('RotinAPP', {
          body: 'Notificações ativadas com sucesso!',
          icon: '/icon.svg'
        });
      } else {
        setMsg('Permissão não concedida. Você pode alterar nas configurações do navegador.');
      }
    } catch (e) {
      setMsg('Não foi possível ativar notificações no momento.');
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5 bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-[#2C2824]">
              Notificações
            </h1>
            <p className="text-xs text-[#7A7165] mt-0.5">
              Lembretes suaves para manter seu dia no rumo
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-[#5C5446] font-semibold hover:text-[#2C2824] underline decoration-[#DCD3C4] cursor-pointer"
          >
            Marcar lidas
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onMarkRead(notif.id)}
            className={`rounded-3xl border p-4 shadow-2xs flex items-start gap-3.5 transition cursor-pointer ${
              notif.read
                ? 'bg-white border-[#EAE3D6] opacity-80'
                : 'bg-[#F5EFE6] border-[#DCD3C4]'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              notif.read ? 'bg-[#EAE3D6] text-[#7A7165]' : 'bg-[#2C2824] text-white shadow-2xs'
            }`}>
              <Clock className="w-4 h-4" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C2824]">{notif.title}</span>
                <span className="text-[11px] font-semibold text-[#5C5446] bg-white px-2 py-0.5 rounded-md border border-[#EAE3D6] tabular-nums">
                  {notif.time}
                </span>
              </div>
              <p className="text-xs text-[#7A7165] mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Configure Notifications Button */}
      <div className="pt-2">
        <button
          onClick={requestNotificationPermission}
          className="w-full h-12 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[#D8CFBF]" />
          <span>Configurar notificações e Web Push</span>
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-[#EAE3D6] p-3 text-[10px] text-[#7A7165] leading-relaxed text-center">
        Status das notificações do navegador: <strong>{permissionStatus === 'granted' ? 'Ativadas ✓' : permissionStatus === 'denied' ? 'Bloqueadas pelo navegador' : 'Aguardando permissão'}</strong>. Notificações web e alarmes dependem das permissões do sistema operacional.
      </div>
    </div>
  );
};
