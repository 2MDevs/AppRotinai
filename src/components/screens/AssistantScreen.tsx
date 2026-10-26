import React, { useState } from 'react';
import { ArrowLeft, Mic, Send, Sparkles, Bot, User, Volume2, Loader2, Check } from 'lucide-react';
import { User as UserType, ScreenId } from '../../types';
import { useSpeechVoice } from '../../hooks/useSpeechVoice';
import { api } from '../../services/api';

interface AssistantScreenProps {
  user: UserType;
  onNavigate: (screen: ScreenId) => void;
  onActionCompleted?: () => void;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  actions?: string[];
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  user,
  onNavigate,
  onActionCompleted
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Olá, ${user.name.split(' ')[0]}! Como posso te ajudar hoje? Posso criar hábitos, consultar seu progresso ou agendar suas rotinas com leveza.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { isListening, transcript, startListening, stopListening, speak, isSpeaking } = useSpeechVoice({
    onTranscript: (t) => {
      setInput(t);
    }
  });

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendAssistantMessage(query);
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        actions: res.actions
      };
      setMessages((prev) => [...prev, botMsg]);
      speak(res.reply);
      if (res.actions && res.actions.length > 0 && onActionCompleted) {
        onActionCompleted();
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Não consegui processar no momento. Verifique sua conexão e tente novamente.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chips = [
    'Criar o hábito de beber água',
    'Mostrar meu progresso deste mês',
    'Adicionar uma rotina da noite',
    'Lembre-me de algo'
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto flex flex-col h-[calc(100vh-80px)] bg-[#FAF7F2]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A7165] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-display font-bold text-[#2C2824] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C4B9A5]" />
              <span>Assistente RotinAI</span>
            </h1>
            <p className="text-[11px] text-[#7A7165]">
              Comandos em linguagem natural por texto ou voz
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {messages.map((m) => {
          const isMe = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isMe ? 'bg-[#2C2824] text-white' : 'bg-[#EAE3D6] text-[#2C2824]'
                }`}
              >
                {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[82%] text-xs leading-relaxed shadow-2xs ${
                  isMe
                    ? 'bg-[#2C2824] text-white rounded-tr-xs'
                    : 'bg-white text-[#2C2824] rounded-tl-xs border border-[#EAE3D6]'
                }`}
              >
                <p>{m.text}</p>
                {/* Actions Completed: Green is properly used here! */}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                    {m.actions.map((act, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#7A7165] pl-10">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2824]" />
            <span>RotinAI está pensando com carinho...</span>
          </div>
        )}
      </div>

      {/* Quick Chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full border border-[#DCD3C4] bg-white hover:bg-[#F5EFE6] text-[#4A443D] text-[11px] font-medium whitespace-nowrap transition shadow-2xs cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Voice Bar & Input */}
      <div className="pt-2 shrink-0 space-y-2">
        {isListening && (
          <div className="px-3 py-1.5 rounded-xl bg-[#2C2824] text-white text-[11px] font-medium flex items-center gap-2 animate-pulse">
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>Escutando áudio... Fale seu comando agora.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isListening ? 'Fale agora... (transcrevendo áudio)' : 'Digite ou toque no microfone...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className={`flex-1 h-12 rounded-2xl border px-4 text-xs text-[#2C2824] placeholder:text-[#A89F93] focus:outline-hidden bg-white shadow-2xs transition ${
              isListening ? 'border-[#2C2824] ring-2 ring-[#EAE3D6]' : 'border-[#DCD3C4] focus:border-[#2C2824]'
            }`}
          />

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-2xs cursor-pointer ${
              isListening ? 'bg-[#2C2824] text-white ring-4 ring-[#EAE3D6] animate-pulse' : 'bg-[#F5EFE6] border border-[#DCD3C4] text-[#4A443D] hover:bg-[#EAE3D6]'
            }`}
            title={isListening ? 'Parar gravação' : 'Falar comando'}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-[#2C2824] text-white flex items-center justify-center hover:bg-[#433D37] transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#D8CFBF]" />
          </button>
        </div>
      </div>
    </div>
  );
};
