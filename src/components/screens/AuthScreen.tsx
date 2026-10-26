import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { User as UserType } from '../../types';

interface AuthScreenProps {
  onSuccess: (user: UserType) => void;
  onBack: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onBack, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.loadDemo();
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de demonstração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main card */}
      <div className="my-auto py-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2C2824] text-[#FAF7F2] flex items-center justify-center shadow-sm mb-3">
            <Sparkles className="w-7 h-7 text-[#D8CFBF]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-[#2C2824]">
            {mode === 'login' ? 'Bem-vinda de volta!' : 'Crie sua conta'}
          </h2>
          <p className="text-xs text-[#7A7165] mt-1">
            {mode === 'login' ? 'Faça login para continuar sua rotina' : 'Comece a organizar seu dia com mais leveza'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#4A443D] mb-1">Seu nome ou apelido</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Como prefere ser chamada?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-[#DCD3C4] bg-white pl-10 pr-4 text-sm text-[#2C2824] placeholder:text-[#A89F93] focus:outline-hidden focus:border-[#2C2824] focus:ring-2 focus:ring-[#2C2824]/10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4A443D] mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-2xl border border-[#DCD3C4] bg-white pl-10 pr-4 text-sm text-[#2C2824] placeholder:text-[#A89F93] focus:outline-hidden focus:border-[#2C2824] focus:ring-2 focus:ring-[#2C2824]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A443D] mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-2xl border border-[#DCD3C4] bg-white pl-10 pr-4 text-sm text-[#2C2824] placeholder:text-[#A89F93] focus:outline-hidden focus:border-[#2C2824] focus:ring-2 focus:ring-[#2C2824]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#2C2824] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#433D37] transition mt-4 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        {/* Or continue with */}
        <div className="mt-6 text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-[#EAE3D6] w-full" />
            <span className="bg-[#FAF7F2] px-3 text-[11px] text-[#8A8175] uppercase tracking-wider">
              ou continue com
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDemo}
              className="h-11 rounded-xl border border-[#DCD3C4] bg-white hover:bg-[#F5EFE6] text-xs font-medium text-[#2C2824] flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleDemo}
              className="h-11 rounded-xl border border-[#DCD3C4] bg-white hover:bg-[#F5EFE6] text-xs font-medium text-[#2C2824] flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4 fill-current text-[#2C2824]" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.95 2.8 1.02.08 2.05-.51 2.68-1.26z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Switch */}
      <div className="pt-4 text-center border-t border-[#EAE3D6]">
        <button
          onClick={() => {
            setError(null);
            setMode(mode === 'login' ? 'register' : 'login');
          }}
          className="text-xs text-[#6C6354] hover:text-[#2C2824] transition"
        >
          {mode === 'login' ? (
            <>
              Não tem uma conta? <strong className="text-[#2C2824] underline decoration-[#DCD3C4]">Cadastre-se</strong>
            </>
          ) : (
            <>
              Já possui conta? <strong className="text-[#2C2824] underline decoration-[#DCD3C4]">Fazer login</strong>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
