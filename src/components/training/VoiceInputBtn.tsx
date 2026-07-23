/**
 * VoiceInputBtn.tsx — Animated Mic Button for Hands-Free Set Recording.
 *
 * Renders a pulsing mic button that triggers speech recognition and feeds
 * parsed weight/reps into the active exercise set.
 */
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoiceInput, type ParsedVoiceResult } from '../../lib/hooks/useVoiceInput';
import { cn } from '../../lib/utils';
import { vibrateSuccess } from '../../lib/haptics';

interface VoiceInputBtnProps {
  onParsedInput: (result: ParsedVoiceResult) => void;
}

export default function VoiceInputBtn({ onParsedInput }: VoiceInputBtnProps) {
  const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceInput((res) => {
    vibrateSuccess();
    onParsedInput(res);
  });

  if (!isSupported) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Detener escucha' : 'Dictar peso y repeticiones por voz (ej. 80 kg 10 reps)'}
        className={cn(
          'p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold',
          isListening
            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
            : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20'
        )}
      >
        {isListening ? (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <Mic size={14} className="text-red-400" />
            </motion.div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Escuchando...</span>
          </>
        ) : (
          <>
            <Mic size={14} />
            <span className="text-[10px] uppercase tracking-wider font-bold hidden sm:inline">Dictar</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 bottom-full mb-2 bg-slate-900/90 backdrop-blur-md border border-brand-blue/30 text-slate-200 text-[11px] px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none"
          >
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
