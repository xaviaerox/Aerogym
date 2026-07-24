import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import type { Routine, RoutineExercise } from '../../infrastructure/supabase/types';

interface NextRoutineCardProps {
  nextRoutine?: Routine & { exercises: RoutineExercise[] };
  onStartSession: (routine?: Routine & { exercises: RoutineExercise[] }) => void;
  onOpenSelector: () => void;
}

export default function NextRoutineCard({
  nextRoutine,
  onStartSession,
  onOpenSelector,
}: NextRoutineCardProps) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
          Siguiente Sesión
        </h2>
        <button
          onClick={onOpenSelector}
          className="text-[10px] text-brand-blue font-bold uppercase tracking-wider hover:underline transition-all"
        >
          Elegir otra ⇄
        </button>
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartSession(nextRoutine)}
        className="w-full glass bg-brand-blue/20 border-brand-blue/30 rounded-3xl p-6 text-left relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-brand-blue/20 transition-all" />

        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-50">
              {nextRoutine?.name || 'Entrenamiento Libre'}
            </h3>
            <p className="text-slate-400 font-medium text-sm line-clamp-1 max-w-[200px]">
              {nextRoutine?.description || 'Sesión sin rutina fija'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-brand-blue text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                TURNO ACTUAL
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {nextRoutine?.exercises?.length || 0} Ejercicios
              </span>
            </div>
          </div>

          <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
        </div>
      </motion.button>
    </section>
  );
}
