import React, { useState } from 'react';
import { Volume2, Play, Square, Loader2, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useSpeechVoice } from '../hooks/useSpeechVoice';

export const VoiceStudioCard: React.FC = () => {
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isLoadingVoice,
    currentVoice,
    setCurrentVoice
  } = useSpeechVoice();

  const [activeTestIndex, setActiveTestIndex] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');

  const testPhrases = [
    {
      title: 'Bom dia & Organização',
      context: 'bom_dia',
      text: 'Bom dia! Vamos organizar seu dia? Às nove horas, você tem uma atividade programada. Faltam cinco minutos para começar. Se precisar de mais tempo, tudo bem. Você pode ajustar sua rotina quando quiser.'
    },
    {
      title: 'Lembrete de Medicamento',
      context: 'medicamento',
      text: 'Está na hora do medicamento programado para o Pedro. Confira as instruções cadastradas antes de administrar.'
    },
    {
      title: 'Conquista de Atividades',
      context: 'conquista',
      text: 'Você concluiu suas atividades de hoje. Muito bem! Amanhã, podemos organizar tudo novamente, no seu ritmo.'
    }
  ];

  const handlePlayTest = (index: number) => {
    if (isSpeaking && activeTestIndex === index) {
      stopSpeaking();
      setActiveTestIndex(null);
      return;
    }
    setActiveTestIndex(index);
    const item = testPhrases[index];
    speak(item.text, { voice: currentVoice, context: item.context });
  };

  const handlePlayCustom = () => {
    if (!customText.trim()) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setActiveTestIndex(-1);
    speak(customText, { voice: currentVoice, context: 'explicacao' });
  };

  return (
    <div className="rounded-3xl border border-[#EAE3D6] bg-white p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] text-[#2C2824] flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2C2824] flex items-center gap-1.5">
              Voz Oficial RotinAPP
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5EFE6] text-[#7A7165]">
                Locutora Natural
              </span>
            </h3>
            <p className="text-[11px] text-[#7A7165]">
              Síntese neural Gemini (Modelo: Gemini TTS / Voz: {currentVoice})
            </p>
          </div>
        </div>

        {/* Voice selector */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl p-1">
          <button
            onClick={() => setCurrentVoice('Sulafat')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer ${
              currentVoice === 'Sulafat'
                ? 'bg-[#2C2824] text-white shadow-2xs'
                : 'text-[#7A7165] hover:text-[#2C2824]'
            }`}
          >
            Sulafat
          </button>
          <button
            onClick={() => setCurrentVoice('Achird')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer ${
              currentVoice === 'Achird'
                ? 'bg-[#2C2824] text-white shadow-2xs'
                : 'text-[#7A7165] hover:text-[#2C2824]'
            }`}
          >
            Achird
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-[11px] text-[#5C5449] leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#8C8273] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#2C2824]">Locutora Virtual Humana & Didática:</strong> Voz feminina brasileira com dicção clara, cadência tranquila e tom didático sem efeito metálico ou robótico.
        </div>
      </div>

      {/* Official Test Sentences */}
      <div className="space-y-2.5 pt-1">
        <label className="text-[11px] font-bold text-[#2C2824] uppercase tracking-wider block">
          Frases Oficiais de Teste Vocal
        </label>

        {testPhrases.map((item, idx) => {
          const isPlayingThis = isSpeaking && activeTestIndex === idx;
          const isLoadingThis = isLoadingVoice && activeTestIndex === idx;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition ${
                isPlayingThis
                  ? 'border-[#2C2824] bg-[#FAF7F2]'
                  : 'border-[#EAE3D6] bg-white hover:border-[#DCD3C4]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-xs font-semibold text-[#2C2824]">
                  {item.title}
                </span>

                <button
                  onClick={() => handlePlayTest(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    isPlayingThis
                      ? 'bg-[#2C2824] text-white'
                      : 'bg-[#F5EFE6] text-[#2C2824] hover:bg-[#EAE3D6]'
                  }`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : isPlayingThis ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Parar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ouvir Voz</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#7A7165] italic leading-snug">
                "{item.text}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Custom Text Playground */}
      <div className="pt-2 border-t border-[#EAE3D6] space-y-2">
        <label className="text-[11px] font-bold text-[#2C2824] uppercase tracking-wider block">
          Testar Qualquer Texto Personalizado
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Digite qualquer aviso para a locutora ler..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] text-xs text-[#2C2824] placeholder-[#A89F93] focus:outline-none focus:border-[#2C2824]"
          />
          <button
            onClick={handlePlayCustom}
            disabled={!customText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-[#2C2824] text-white text-xs font-medium hover:bg-[#3D3730] disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isSpeaking && activeTestIndex === -1 ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>Falar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
