import React from 'react';
import { Check, Trophy, BookOpen, Sparkles, Plus, TrendingUp } from 'lucide-react';

import { cn } from '../../lib/utils';
import { calculateE1RM } from '../../lib/engine';
import { MuscleWikiService } from '../../lib/muscleWikiService';
import { BASE_EXERCISES } from '../../constants/exercises';
import { useWorkoutStore, type ActiveSet, type ActiveExercise } from '../../application/stores/useWorkoutStore';
import type { WorkoutSet } from '../../infrastructure/supabase/types';
import { progressiveOverloadEngine } from '../../lib/progressiveOverloadEngine';
import VoiceInputBtn from './VoiceInputBtn';

interface ExerciseBlockProps extends React.Attributes {
  exercise: ActiveExercise;
  workoutSetsHistory: WorkoutSet[];
  onGuideOpen: (exerciseId: string) => void;
  onToggleSet: (exerciseId: string, setIndex: number, set: ActiveSet) => void;
}

export default function ExerciseBlock({
  exercise: ex,
  workoutSetsHistory,
  onGuideOpen,
  onToggleSet,
}: ExerciseBlockProps) {
  const { addSetToActive, updateActiveExercise } = useWorkoutStore();

  const exerciseInfo =
    BASE_EXERCISES.find((e) => e.id === ex.exercise_id) ||
    (ex.exercise_id.startsWith('mw-')
      ? MuscleWikiService.getCachedExerciseInfo(ex.exercise_id)
      : undefined);

  const isCardio = exerciseInfo?.muscleGroup === 'Cardio';

  const bestE1RM = isCardio
    ? 0
    : workoutSetsHistory
        .filter((s) => s.exercise_id === ex.exercise_id && s.is_completed)
        .reduce((max, s) => Math.max(max, Number(s.e1rm_kg) || 0), 0);

  const recommendation = !isCardio
    ? progressiveOverloadEngine.getRecommendation(ex.exercise_id, workoutSetsHistory)
    : null;

  const isPR = (weight: number, reps: number) => {
    const currentE1RM = calculateE1RM(weight, reps);
    return currentE1RM > bestE1RM && weight > 0 && reps > 0;
  };

  const handleVoiceInput = (result: { weightKg?: number; reps?: number; action?: 'complete' | 'add_set' }) => {
    const targetSetIndex = ex.sets.findIndex((s) => !s.is_completed);
    const activeIndex = targetSetIndex !== -1 ? targetSetIndex : ex.sets.length - 1;

    if (result.weightKg !== undefined) {
      updateActiveExercise(ex.exercise_id, activeIndex, 'weight_kg', result.weightKg);
    }
    if (result.reps !== undefined) {
      updateActiveExercise(ex.exercise_id, activeIndex, 'reps', result.reps);
    }
    if (result.action === 'complete' && activeIndex >= 0) {
      const currentSet = ex.sets[activeIndex];
      if (currentSet) onToggleSet(ex.exercise_id, activeIndex, currentSet);
    } else if (result.action === 'add_set') {
      addSetToActive(ex.exercise_id);
    }
  };

  const setsToRender = isCardio ? ex.sets.slice(0, 1) : ex.sets;

  return (
    <div className="space-y-4">
      {/* Exercise Header */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h3 className="text-lg font-bold text-slate-50">
            {exerciseInfo?.name || ex.exercise_id}
          </h3>
          {bestE1RM > 0 && (
            <p className="text-[10px] uppercase text-brand-green font-bold tracking-widest">
              Record Estimado: {bestE1RM.toFixed(1)}kg
            </p>
          )}
          {isCardio && (
            <p className="text-[10px] uppercase text-brand-blue font-bold tracking-widest">
              Ejercicio de Cardio
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <VoiceInputBtn onParsedInput={handleVoiceInput} />
          <button
            type="button"
            onClick={() => onGuideOpen(ex.exercise_id)}
            className="text-[10px] text-brand-blue hover:text-slate-950 font-bold uppercase tracking-widest bg-brand-blue/10 hover:bg-brand-blue px-2.5 py-1.5 rounded-xl border border-brand-blue/20 hover:border-brand-blue transition-all inline-flex items-center gap-1"
          >
            Guía <BookOpen size={10} />
          </button>
        </div>
      </div>

      {/* Progressive Overload Recommendation Badge */}
      {recommendation && (
        <div className="glass border border-brand-blue/20 bg-brand-blue/5 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs text-slate-300">
          <div className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
            <TrendingUp size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-brand-blue">
              Sugerencia IA · Sobrecarga Progresiva
            </p>
            <p className="text-[11px] text-slate-200 font-medium leading-tight">
              {recommendation.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Column Headers */}
      {isCardio ? (
        <div className="grid grid-cols-[30px_1fr_1fr_60px_50px] gap-2 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
          <span>#</span>
          <span className="text-center">Minutos</span>
          <span className="text-center">Metros</span>
          <span className="text-center">RPE</span>
          <span className="text-right">✓</span>
        </div>
      ) : (
        <div className="grid grid-cols-[30px_1fr_1fr_45px_45px_50px] gap-2 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
          <span>#</span>
          <span className="text-center">KG</span>
          <span className="text-center">Reps</span>
          <span className="text-center">RPE</span>
          <span className="text-center">RIR</span>
          <span className="text-right">✓</span>
        </div>
      )}

      {/* Sets */}
      {setsToRender.map((set, sIdx) => {
        const currentE1RM =
          !isCardio && set.weight_kg && set.reps
            ? calculateE1RM(set.weight_kg, set.reps)
            : 0;
        const isSetPR =
          !isCardio && set.weight_kg && set.reps
            ? isPR(set.weight_kg, set.reps)
            : false;

        if (isCardio) {
          return (
            <div
              key={set.id}
              className={cn(
                'grid grid-cols-[30px_1fr_1fr_60px_50px] gap-2 items-center p-2 rounded-xl transition-all border',
                set.is_completed
                  ? 'bg-brand-blue/10 border-brand-blue/20'
                  : 'bg-white/5 border-transparent'
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-500">{sIdx + 1}</span>
              </div>
              <input
                type="number"
                value={set.duration_seconds ? Math.round(set.duration_seconds / 60) : ''}
                placeholder="0 min"
                onChange={(e) =>
                  updateActiveExercise(
                    ex.exercise_id,
                    sIdx,
                    'duration_seconds',
                    (parseInt(e.target.value) || 0) * 60
                  )
                }
                className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />
              <input
                type="number"
                value={
                  set.distance_meters !== null && set.distance_meters !== undefined
                    ? set.distance_meters
                    : ''
                }
                placeholder="Opcional"
                onChange={(e) =>
                  updateActiveExercise(
                    ex.exercise_id,
                    sIdx,
                    'distance_meters',
                    parseInt(e.target.value) || null
                  )
                }
                className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />
              <input
                type="number"
                value={set.rpe || ''}
                placeholder="-"
                min="1"
                max="10"
                onChange={(e) =>
                  updateActiveExercise(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                }
                className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-brand-blue"
              />
              <button
                onClick={() => onToggleSet(ex.exercise_id, sIdx, set)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all ml-auto',
                  set.is_completed ? 'bg-brand-blue text-slate-950' : 'bg-slate-800 text-slate-500'
                )}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          );
        }

        return (
          <div
            key={set.id}
            className={cn(
              'grid grid-cols-[30px_1fr_1fr_45px_45px_50px] gap-2 items-center p-2 rounded-xl transition-all border',
              set.is_completed
                ? 'bg-brand-blue/10 border-brand-blue/20'
                : 'bg-white/5 border-transparent'
            )}
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-500">{sIdx + 1}</span>
              {isSetPR && set.is_completed && <Trophy size={10} className="text-yellow-400" />}
            </div>

            <div className="min-w-0">
              <input
                type="number"
                value={set.weight_kg || ''}
                placeholder="0"
                onChange={(e) =>
                  updateActiveExercise(ex.exercise_id, sIdx, 'weight_kg', parseFloat(e.target.value) || 0)
                }
                className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />
              {currentE1RM > 0 && (
                <p className="text-[8px] text-slate-500 font-bold text-center mt-0.5">
                  1RM≈{currentE1RM.toFixed(0)}
                </p>
              )}
            </div>

            <input
              type="number"
              value={set.reps || ''}
              placeholder="0"
              onChange={(e) =>
                updateActiveExercise(ex.exercise_id, sIdx, 'reps', parseInt(e.target.value) || null)
              }
              className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
            />

            <input
              type="number"
              value={set.rpe || ''}
              placeholder="-"
              min="1"
              max="10"
              onChange={(e) =>
                updateActiveExercise(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
              }
              className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-brand-blue"
            />

            <input
              type="number"
              value={set.rir !== null && set.rir !== undefined ? set.rir : ''}
              placeholder="-"
              min="0"
              max="10"
              onChange={(e) =>
                updateActiveExercise(
                  ex.exercise_id,
                  sIdx,
                  'rir',
                  parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : null
                )
              }
              className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-purple-400"
            />

            <button
              onClick={() => onToggleSet(ex.exercise_id, sIdx, set)}
              aria-label="Completar serie"
              className={cn(
                'w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all ml-auto active:scale-95 shadow-md',
                set.is_completed
                  ? 'bg-brand-blue text-slate-950 shadow-brand-blue/20'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              )}
            >
              <Check size={22} strokeWidth={3} />
            </button>
          </div>
        );
      })}

      {!isCardio && (
        <button
          onClick={() => addSetToActive(ex.exercise_id)}
          className="w-full py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 hover:border-brand-blue/30 hover:text-brand-blue transition-all"
        >
          <Plus size={14} className="inline mr-1" />
          Añadir Serie
        </button>
      )}
    </div>
  );
}
