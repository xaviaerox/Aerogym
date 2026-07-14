import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Dumbbell } from 'lucide-react';
import { findGifForExercise } from '../lib/exerciseGifService';

interface ExerciseMediaProps {
  exerciseName: string;
  primaryMuscle: string;
  className?: string;
  localGifUrl?: string | null;
}

type State = 'loading' | 'loaded' | 'error';

export default function ExerciseMedia({ exerciseName, primaryMuscle, className = '', localGifUrl = null }: ExerciseMediaProps) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [state, setState] = useState<State>('loading');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (localGifUrl) {
      setGifUrl(localGifUrl);
      setState('loaded');
      return;
    }

    setState('loading');
    setGifUrl(null);

    findGifForExercise(exerciseName, primaryMuscle)
      .then(url => {
        if (!mountedRef.current) return;
        if (url) {
          setGifUrl(url);
          setState('loaded');
        } else {
          setState('error');
        }
      })
      .catch(() => {
        if (mountedRef.current) setState('error');
      });

    return () => { mountedRef.current = false; };
  }, [exerciseName, primaryMuscle, localGifUrl]);

  return (
    <div className={`relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-slate-950 ${className}`}>
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            {/* Skeleton shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 animate-[shimmer_1.5s_infinite]"
              style={{ backgroundSize: '200% 100%' }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-brand-blue" size={22} />
              <span className="text-slate-500 text-[10px] tracking-widest uppercase font-bold">Cargando ejercicio…</span>
            </div>
          </motion.div>
        )}

        {state === 'loaded' && gifUrl && (
          <motion.div
            key="gif"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={gifUrl}
              alt={exerciseName}
              className="w-full h-full object-cover"
              onError={() => setState('error')}
            />
            {/* Source badge */}
            <div className="absolute bottom-2 right-3 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
              {localGifUrl ? 'Base de Datos Local' : 'ExerciseDB'}
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center">
              <Dumbbell className="text-slate-600" size={24} />
            </div>
            <p className="text-slate-600 text-xs tracking-wide">Vista previa no disponible</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
