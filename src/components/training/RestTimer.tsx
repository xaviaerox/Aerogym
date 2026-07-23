/**
 * RestTimer — Floating rest-period countdown timer.
 * Extracted from TrainingSession.tsx for SRP compliance.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer, X } from 'lucide-react';
import { sendRestTimerNotification, requestNotificationPermission } from '../../lib/notificationService';

// ─── Audio Helpers ────────────────────────────────────────────────────────────
function playBeep(freq: number, duration: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    console.warn('Audio Context blocked or unsupported');
  }
}

export function playMultipleBeeps(
  count: number,
  freq = 600,
  duration = 0.12,
  delayBetween = 180
) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => playBeep(freq, duration), i * delayBetween);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface RestTimerProps {
  startTime: number | null;
  onClear: () => void;
}

export default function RestTimer({ startTime, onClear }: RestTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const playedMilestonesRef = React.useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      playedMilestonesRef.current.clear();
      return;
    }

    playedMilestonesRef.current.clear();
    requestNotificationPermission();

    const interval = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);

      if (newElapsed >= 120 && !playedMilestonesRef.current.has(120)) {
        playedMilestonesRef.current.add(120);
        playMultipleBeeps(1, 650, 0.15);
        sendRestTimerNotification('Ejercicio', 120);
      } else if (newElapsed >= 180 && !playedMilestonesRef.current.has(180)) {
        playedMilestonesRef.current.add(180);
        playMultipleBeeps(2, 650, 0.15, 200);
        sendRestTimerNotification('Ejercicio', 180);
      } else if (newElapsed >= 300 && !playedMilestonesRef.current.has(300)) {
        playedMilestonesRef.current.add(300);
        playMultipleBeeps(3, 650, 0.15, 200);
        sendRestTimerNotification('Ejercicio', 300);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none max-w-md mx-auto"
    >
      <div className="glass-dark border border-brand-blue/30 p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-brand-blue/20 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Timer size={22} />
            </motion.div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Descanso</p>
            <p className="text-xl font-mono font-bold text-slate-50">
              {mins}:{secs.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-slate-400 transition-colors border border-white/5"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}
