import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Loader2, Dumbbell, Sparkles } from 'lucide-react';
import { MuscleWikiService, TRANSLATE_MUSCLE, TRANSLATE_CATEGORY, type MuscleWikiExercise } from '../lib/muscleWikiService';
import { BASE_EXERCISES } from '../constants/exercises';
import ExerciseMedia from './ExerciseMedia';

interface ExerciseGuideModalProps {
  exerciseId: string | null;
  exerciseName?: string;
  muscleGroup?: string;
  onClose: () => void;
}

export default function ExerciseGuideModal({
  exerciseId,
  exerciseName,
  muscleGroup,
  onClose,
}: ExerciseGuideModalProps) {
  const [guideData, setGuideData] = useState<MuscleWikiExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setGuideData(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    MuscleWikiService.getExerciseDetails(exerciseId)
      .then((details) => {
        if (!isMounted) return;
        if (details) {
          setGuideData(details);
        } else {
          // Fallback para ejercicios base locales si no están en la lista de MuscleWiki
          const baseEx = BASE_EXERCISES.find((e) => e.id === exerciseId);
          const fallbackName = exerciseName || baseEx?.name || exerciseId;
          const fallbackMuscle = muscleGroup || baseEx?.muscleGroup || 'Musculación';

          setGuideData({
            id: exerciseId,
            name: fallbackName,
            category: baseEx?.type || 'Barbell',
            primary_muscles: [fallbackMuscle],
            secondary_muscles: [],
            steps: [
              'Adopta una postura firme y equilibrada manteniendo la alineación biomecánica correcta.',
              'Ejecuta la fase excéntrica con control absoluto de la carga, sintiendo el estiramiento objetivo.',
              'Pausa brevemente en el punto de máxima tensión antes de iniciar la contracción concéntrica.',
              'Mantén la respiración coordinada: inhala en el descenso y exhala durante el esfuerzo principal.',
            ],
            videos: [],
          });
        }
      })
      .catch((err) => {
        console.error('Error cargando guía de ejercicio:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [exerciseId, exerciseName, muscleGroup]);

  if (!exerciseId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] overflow-y-auto px-4 py-6 flex justify-center items-start"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md my-auto glass-dark border border-white/10 p-5 rounded-3xl space-y-5 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <ArrowLeft size={16} /> Volver a la Rutina
            </button>

            <span className="text-[10px] text-brand-blue font-black uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Guía Local
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                Cargando guía técnica...
              </p>
            </div>
          ) : guideData ? (
            <div className="space-y-5">
              {/* Title & Badges */}
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-50 tracking-tight">{guideData.name}</h2>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-brand-blue/20 text-brand-blue border border-brand-blue/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    {TRANSLATE_MUSCLE[guideData.primary_muscles[0]] || guideData.primary_muscles[0] || 'Musculación'}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-white/5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {TRANSLATE_CATEGORY[guideData.category] || guideData.category || 'General'}
                  </span>
                  {guideData.difficulty && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 border border-white/5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {guideData.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Media Demonstration */}
              <ExerciseMedia
                exerciseName={guideData.name}
                primaryMuscle={guideData.primary_muscles[0]}
                className="rounded-2xl shadow-inner border border-white/10"
              />

              {/* Step by Step Guide */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={15} className="text-brand-blue" /> Técnica & Ejecución Paso a Paso
                </h3>
                <div className="space-y-2.5">
                  {guideData.steps.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 items-start"
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center font-black text-[10px] text-brand-blue shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed flex-1 font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Dumbbell className="mx-auto text-slate-600" size={32} />
              <p className="text-xs text-slate-400 font-bold">Guía técnica no encontrada</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
