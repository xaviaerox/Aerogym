/**
 * ExerciseGuideModal — Full-screen exercise guide overlay.
 * Shows media, muscle group badges, and step-by-step instructions.
 * Extracted from TrainingSession.tsx for SRP compliance.
 */
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import ExerciseMedia from '../ExerciseMedia';
import { TRANSLATE_MUSCLE, TRANSLATE_CATEGORY } from '../../lib/muscleWikiService';
import type { MuscleWikiExercise } from '../../lib/muscleWikiService';

interface ExerciseGuideModalProps {
  isOpen: boolean;
  isLoading: boolean;
  exerciseData: MuscleWikiExercise | null;
  onClose: () => void;
}

export default function ExerciseGuideModal({
  isOpen,
  isLoading,
  exerciseData,
  onClose,
}: ExerciseGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] overflow-y-auto px-4 py-8"
        >
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-slate-400 text-xs font-bold"
              >
                <ArrowLeft size={16} /> Cerrar Guía
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-brand-blue" size={32} />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                  Cargando guía...
                </p>
              </div>
            ) : exerciseData ? (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-slate-50">{exerciseData.name}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {TRANSLATE_MUSCLE[exerciseData.primary_muscles[0]] || exerciseData.primary_muscles[0]}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {TRANSLATE_CATEGORY[exerciseData.category] || exerciseData.category}
                    </span>
                    {exerciseData.difficulty && (
                      <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {exerciseData.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <ExerciseMedia
                  exerciseName={exerciseData.name}
                  primaryMuscle={exerciseData.primary_muscles[0]}
                />

                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} className="text-brand-blue" /> Paso a Paso
                  </h3>
                  <div className="space-y-3">
                    {exerciseData.steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-4 glass p-4 rounded-2xl border border-white/5 items-start">
                        <div className="w-5 h-5 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center font-black text-[9px] text-brand-blue flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass p-8 rounded-3xl text-center text-slate-400">
                No se pudo cargar la guía para este ejercicio.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
