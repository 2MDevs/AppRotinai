import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechVoiceProps {
  onTranscript?: (transcript: string) => void;
  defaultVoice?: 'Sulafat' | 'Achird';
}

export function useSpeechVoice({ onTranscript, defaultVoice = 'Sulafat' }: UseSpeechVoiceProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<'Sulafat' | 'Achird'>(defaultVoice);
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Always keep ref updated with latest callback without re-running recognition effect
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setMicError('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
          if (onTranscriptRef.current) {
            onTranscriptRef.current(currentTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Permissão do microfone negada. Verifique as configurações do navegador.');
        } else if (event.error === 'no-speech') {
          // Soft error - no speech detected yet
        } else if (event.error === 'network') {
          setMicError('Erro de conexão ao transcrever voz.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
    } catch (err) {
      console.warn('Error setting up speech recognition:', err);
      setIsSupported(false);
      setMicError('Não foi possível iniciar o microfone.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    setMicError(null);
    setTranscript('');

    // Request microphone permission explicitly first if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Clean up test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Microphone permission rejected or error:', err);
        setMicError('Microfone bloqueado. Permita o uso do microfone no navegador.');
      }
    }

    if (!recognitionRef.current) {
      setMicError('Reconhecimento de voz não disponível.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      // If already started, stop and restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (err) {
            console.warn('Retry start failed:', err);
          }
        }, 100);
      } catch (err) {
        console.warn('Start listening exception:', e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      setIsListening(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingVoice(false);
  }, []);

  const speak = useCallback(async (
    text: string,
    options: { voice?: 'Sulafat' | 'Achird'; context?: string } = {}
  ) => {
    if (!text || !text.trim()) return;

    stopSpeaking();
    setIsLoadingVoice(true);

    const voiceToUse = options.voice || currentVoice;
    const contextToUse = options.context || 'lembrete';

    try {
      const res = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceToUse,
          context: contextToUse
        })
      });

      if (!res.ok) throw new Error('Falha ao obter síntese de voz');
      const data = await res.json();

      let src = '';
      if (data.audioUrl) {
        src = data.audioUrl;
      } else if (data.audioBase64) {
        src = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      }

      if (!src) throw new Error('Áudio não retornado');

      const audio = new Audio(src);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        setIsLoadingVoice(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        activeAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn('Erro ao reproduzir áudio TTS:', e);
        setIsSpeaking(false);
        setIsLoadingVoice(false);
        activeAudioRef.current = null;
        fallbackBrowserSpeak(text);
      };

      await audio.play();
    } catch (err) {
      console.warn('Erro no Gemini TTS, usando fallback do navegador:', err);
      setIsLoadingVoice(false);
      fallbackBrowserSpeak(text);
    }
  }, [currentVoice, stopSpeaking]);

  const fallbackBrowserSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt')) || null;
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return {
    isListening,
    transcript,
    setTranscript,
    isSpeaking,
    isLoadingVoice,
    currentVoice,
    setCurrentVoice,
    isSupported,
    micError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
