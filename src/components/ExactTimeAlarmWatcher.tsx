import React, { useEffect, useRef } from 'react';
import { useSpeechVoice } from '../hooks/useSpeechVoice';
import { DailyRoutine, Medication } from '../types';

interface ExactTimeAlarmWatcherProps {
  routines: DailyRoutine[];
  medications: Medication[];
}

export const ExactTimeAlarmWatcher: React.FC<ExactTimeAlarmWatcherProps> = ({
  routines,
  medications
}) => {
  const { speak } = useSpeechVoice();
  const alertedTimesRef = useRef<Set<string>>(new Set());

  // Play pleasant chime using Web Audio API
  const playAlarmChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Play 3 gentle chime notes
      [0, 0.25, 0.5].forEach((delay, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 523.25 : idx === 1 ? 659.25 : 783.99, now + delay); // C5, E5, G5

        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.4);
      });
    } catch (e) {
      console.warn('AudioContext chime error:', e);
    }
  };

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      const todayDate = now.toISOString().slice(0, 10);
      const dayOfWeek = now.getDay(); // 0 = Dom

      // Check routines
      routines.forEach((routine) => {
        if (!routine.active || !routine.notificationEnabled) return;
        if (!routine.daysOfWeek.includes(dayOfWeek)) return;

        const alarmKey = `routine_${routine.id}_${todayDate}_${currentTime}`;
        if (routine.startTime === currentTime && !alertedTimesRef.current.has(alarmKey)) {
          alertedTimesRef.current.add(alarmKey);
          playAlarmChime();

          // Speak after alarm chime
          setTimeout(() => {
            const speechText = `Oi! Está na hora da rotina ${routine.title}. Vamos começar?`;
            speak(speechText, { context: 'bom_dia' });
          }, 800);
        }
      });

      // Check medications
      medications.forEach((med) => {
        if (!med.active || !med.notificationEnabled) return;

        med.scheduleTimes.forEach((timeStr) => {
          const alarmKey = `med_${med.id}_${todayDate}_${currentTime}_${timeStr}`;
          if (timeStr === currentTime && !alertedTimesRef.current.has(alarmKey)) {
            alertedTimesRef.current.add(alarmKey);
            playAlarmChime();

            // Speak after alarm chime
            setTimeout(() => {
              const speechText = `Está na hora do medicamento ${med.name}. Dosagem: ${med.dosage}. ${med.instructions || 'Confira as instruções cadastradas e tome com um copo de água.'}`;
              speak(speechText, { context: 'medicamento' });
            }, 800);
          }
        });
      });
    };

    const interval = setInterval(checkAlarms, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [routines, medications, speak]);

  return null;
};
