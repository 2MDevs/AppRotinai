import React, { useState, useEffect } from 'react';
import { Users, Link as LinkIcon, Check, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { AccountLink } from '../types';
import { api } from '../services/api';

export const AccountLinkCard: React.FC = () => {
  const [links, setLinks] = useState<AccountLink[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await api.getAccountLinks();
      setLinks(res.links || []);
    } catch (e) {
      console.warn('Error loading account links:', e);
    }
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setSuccessMsg(null);
    try {
      await api.linkAccount(emailInput.trim());
      setSuccessMsg(`Conta de ${emailInput.trim()} vinculada com sucesso! Rotinas agora são compartilhadas.`);
      setEmailInput('');
      loadLinks();
    } catch (err: any) {
      alert(err.message || 'Erro ao vincular conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] text-[#2C2824] flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#2C2824] flex items-center gap-1.5">
            Vínculo por Conta & Rotina Compartilhada
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Ativo
            </span>
          </h3>
          <p className="text-[11px] text-[#7A7165]">
            Compartilhe rotinas, hábitos e medicamentos com familiares ou parceiros vinculados.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Linked Accounts List */}
      {links.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#7A7165] uppercase tracking-wider block">
            Contas Vinculadas ({links.length})
          </label>
          <div className="space-y-1.5">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-semibold text-[#2C2824]">{link.linkedEmail}</span>
                    <span className="block text-[10px] text-[#7A7165]">Sincronização de rotinas e alertas ativa</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#EAE3D6] text-[10px] font-medium text-[#2C2824]">
                  Compartilhado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Link Form */}
      <form onSubmit={handleLinkAccount} className="space-y-2 pt-1 border-t border-[#EAE3D6]">
        <label className="text-[10px] font-bold text-[#7A7165] uppercase tracking-wider block">
          Vincular Novo E-mail de Familiar ou Parceiro(a)
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="email.do.familiar@exemplo.com"
            className="flex-1 px-3.5 py-2.5 rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] text-xs text-[#2C2824] placeholder-[#A89F93] focus:outline-none focus:border-[#2C2824]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-[#2C2824] text-white text-xs font-medium hover:bg-[#3D3730] disabled:opacity-55 transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
            <span>Vincular</span>
          </button>
        </div>
      </form>
    </div>
  );
};
