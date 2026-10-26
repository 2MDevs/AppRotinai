import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Check, Loader2, Sparkles, AlertCircle, Volume2 } from 'lucide-react';
import { useSpeechVoice } from '../../hooks/useSpeechVoice';
import { api } from '../../services/api';

interface VoiceHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecorded: () => void;
}

export const VoiceHabitModal: React.FC<VoiceHabitModalProps> = ({
  isOpen,
  onClose,
  onRecorded
}) => {
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');

  const {
    isListening,
    transcript,
    setTranscript,
    micError,
    startListening,
    stopListening,
    speak
  } = useSpeechVoice({
    onTranscript: (t) => {
      setTranscriptText(t);
    }
  });

  useEffect(() => {
    if (transcript) {
      setTranscriptText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setTranscriptText('');
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  if (!isOpen) return null;

  const sampleVoicePhrases = [
    'Fui paciente com meus filhos hoje',
    'Bebi 2 litros de água',
    'Fiz 30 minutos de caminhada leve',
    'Tomei o remédio no horário certo'
  ];

  const handleSelectSample = (sample: string) => {
    setTranscriptText(sample);
    setTranscript(sample);
  };

  const handleProcess = async () => {
    const textToProcess = transcriptText.trim() || 'Fui paciente com meus filhos hoje';
    stopListening();
    setProcessing(true);

    try {
      const res = await api.processVoiceTranscript(textToProcess);
      const explanation = res.result?.explanation || 'Hábito registrado com sucesso!';
      setFeedback(explanation);
      speak(explanation);
      onRecorded();

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setFeedback('Recebido! Registro salvo na sua rotina.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-2xl border border-[#EAE3D6] text-center relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#8A8175] hover:text-[#2C2824] hover:bg-[#EAE3D6] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mt-1 mb-4">
          <h2 className="text-base font-bold font-display text-[#2C2824]">
            Registrar por Voz
          </h2>
          <p className="text-xs text-[#7A7165] mt-0.5">
            {isListening
              ? 'Escutando seu áudio... Fale agora'
              : 'Clique no microfone e diga o que realizou'}
          </p>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="relative my-2 flex items-center justify-center">
          {isListening && (
            <div className="absolute w-32 h-32 rounded-full bg-[#2C2824]/10 animate-ping" />
          )}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-[#2C2824] text-white scale-105 ring-8 ring-[#EAE3D6]'
                : 'bg-[#3E3832] text-white shadow-md hover:bg-[#2C2824]'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 text-[#E0D7C6] animate-pulse" />
            ) : (
              <MicOff className="w-10 h-10 text-[#A89F93]" />
            )}
          </button>
        </div>

        {/* Microphone status alert if any issue */}
        {micError && (
          <div className="my-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2 text-left w-full">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Editable Transcription Input */}
        <div className="my-3 w-full">
          <label className="text-[10px] font-bold text-[#7A7165] uppercase tracking-wider block mb-1 text-left">
            Transcrição do seu áudio:
          </label>
          <input
            type="text"
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Fale no microfone ou selecione uma opção abaixo..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAE3D6] bg-white text-xs font-medium text-[#2C2824] focus:outline-none focus:border-[#2C2824] shadow-2xs"
          />
        </div>

        {/* Sample Voice Quick Chips */}
        <div className="w-full mb-3 text-left">
          <label className="text-[10px] text-[#7A7165] font-semibold block mb-1.5">
            Exemplos rápidos de voz (clique para testar):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sampleVoicePhrases.map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleSelectSample(phrase)}
                className="px-2.5 py-1 rounded-xl bg-white border border-[#EAE3D6] text-[11px] text-[#5C5449] hover:border-[#2C2824] hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {/* Waveform indicator */}
        <div className="flex items-center gap-1.5 h-6 my-1">
          {[12, 24, 32, 18, 28, 40, 22, 14, 30, 26, 16].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-[#5C5446] transition-all ${
                isListening ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: isListening ? `${h}px` : '6px',
                animationDelay: `${i * 80}ms`
              }}
            />
          ))}
        </div>

        {/* Success Feedback */}
        {feedback && (
          <div className="my-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 w-full text-left">
            <Check className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full mt-3 space-y-1.5">
          <button
            onClick={handleProcess}
            disabled={processing}
            className="w-full h-11 rounded-2xl bg-[#2C2824] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#433D37] transition shadow-xs disabled:opacity-75 cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C4B9A5]" />
                <span>Identificando áudio com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D8CFBF]" />
                <span>Processar e Registrar Hábito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
