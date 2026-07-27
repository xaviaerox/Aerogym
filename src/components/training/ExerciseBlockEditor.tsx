import React from 'react';
import { Trash, Plus, BookOpen, X } from 'lucide-react';
import { BASE_EXERCISES } from '../../constants/exercises';
import { MuscleWikiService } from '../../lib/muscleWikiService';

export interface EditableSet {
  id: string;
  reps: number | null;
  weight_kg: number;
  rpe: number | null;
  rir: number | null;
  duration_seconds?: number | null;
  distance_meters?: number | null;
  is_completed?: boolean;
  is_warmup?: boolean;
  is_pr?: boolean;
}

export interface EditableExercise {
  exercise_id: string;
  sets: EditableSet[];
}

interface ExerciseBlockEditorProps {
  key?: string | number;
  exercise: EditableExercise;
  onUpdateSetField: (exerciseId: string, setIdx: number, field: string, value: any) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIdx: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onOpenGuide: (exerciseId: string) => void;
}

export default function ExerciseBlockEditor({
  exercise,
  onUpdateSetField,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onOpenGuide,
}: ExerciseBlockEditorProps) {
  const exerciseInfo = BASE_EXERCISES.find((e) => e.id === exercise.exercise_id) ||
    (exercise.exercise_id.startsWith('mw-') ? MuscleWikiService.getCachedExerciseInfo(exercise.exercise_id) : undefined);
  const isCardio = exerciseInfo?.muscleGroup === 'Cardio';

  return (
    <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-50">{exerciseInfo?.name || exercise.exercise_id}</h3>
            <button
              type="button"
              onClick={() => onOpenGuide(exercise.exercise_id)}
              className="text-[9px] text-brand-blue hover:text-slate-950 font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue transition-all inline-flex items-center gap-1"
            >
              Guía <BookOpen size={9} />
            </button>
          </div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
            {exerciseInfo?.muscleGroup || 'Musculación'} · {(exerciseInfo as any)?.type || 'Compuesto'}
          </p>
        </div>
        <button
          onClick={() => onRemoveExercise(exercise.exercise_id)}
          className="text-slate-500 hover:text-rose-400 p-2 transition-colors"
        >
          <Trash size={16} />
        </button>
      </div>

      {/* Sets Header */}
      {isCardio ? (
        <div className="grid grid-cols-[30px_1fr_1fr_60px_40px] gap-2 px-1 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
          <span>#</span>
          <span className="text-center">Minutos</span>
          <span className="text-center">Metros</span>
          <span className="text-center">RPE</span>
          <span className="text-right">Borrar</span>
        </div>
      ) : (
        <div className="grid grid-cols-[30px_1fr_1fr_40px_40px_40px] gap-2 px-1 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
          <span>#</span>
          <span className="text-center">KG</span>
          <span className="text-center">Reps</span>
          <span className="text-center">RPE</span>
          <span className="text-center">RIR</span>
          <span className="text-right">Borrar</span>
        </div>
      )}

      {/* Sets List */}
      <div className="space-y-2">
        {exercise.sets.map((set, sIdx) => {
          if (isCardio) {
            return (
              <div key={set.id || sIdx} className="grid grid-cols-[30px_1fr_1fr_60px_40px] gap-2 items-center bg-white/[0.02] p-1.5 rounded-xl border border-transparent">
                <span className="text-xs font-bold text-slate-500 text-center">{sIdx + 1}</span>
                
                <input
                  type="number"
                  value={set.duration_seconds ? Math.round(set.duration_seconds / 60) : ''}
                  placeholder="0 min"
                  onChange={(e) =>
                    onUpdateSetField(exercise.exercise_id, sIdx, 'duration_seconds', (parseInt(e.target.value) || 0) * 60)
                  }
                  className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                />

                <input
                  type="number"
                  value={set.distance_meters !== null && set.distance_meters !== undefined ? set.distance_meters : ''}
                  placeholder="Opcional"
                  onChange={(e) =>
                    onUpdateSetField(exercise.exercise_id, sIdx, 'distance_meters', parseInt(e.target.value) || null)
                  }
                  className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                />

                <input
                  type="number"
                  value={set.rpe || ''}
                  placeholder="-"
                  min="1"
                  max="10"
                  onChange={(e) =>
                    onUpdateSetField(exercise.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                  }
                  className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-400 placeholder:text-slate-600"
                />

                <button
                  onClick={() => onRemoveSet(exercise.exercise_id, sIdx)}
                  className="text-slate-600 hover:text-rose-400 p-1.5 ml-auto"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          return (
            <div key={set.id || sIdx} className="grid grid-cols-[30px_1fr_1fr_40px_40px_40px] gap-2 items-center bg-white/[0.02] p-1.5 rounded-xl border border-transparent">
              <span className="text-xs font-bold text-slate-500 text-center">{sIdx + 1}</span>
              
              <input
                type="number"
                value={set.weight_kg || ''}
                placeholder="0"
                onChange={(e) =>
                  onUpdateSetField(exercise.exercise_id, sIdx, 'weight_kg', parseFloat(e.target.value) || 0)
                }
                className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />

              <input
                type="number"
                value={set.reps || ''}
                placeholder="0"
                onChange={(e) =>
                  onUpdateSetField(exercise.exercise_id, sIdx, 'reps', parseInt(e.target.value) || null)
                }
                className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />

              <input
                type="number"
                value={set.rpe || ''}
                placeholder="-"
                min="1"
                max="10"
                onChange={(e) =>
                  onUpdateSetField(exercise.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                }
                className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-400 placeholder:text-slate-600"
              />

              <input
                type="number"
                value={set.rir !== null && set.rir !== undefined ? set.rir : ''}
                placeholder="-"
                min="0"
                max="10"
                onChange={(e) =>
                  onUpdateSetField(exercise.exercise_id, sIdx, 'rir', parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : null)
                }
                className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-400 placeholder:text-slate-600"
              />

              <button
                onClick={() => onRemoveSet(exercise.exercise_id, sIdx)}
                className="text-slate-600 hover:text-rose-400 p-1.5 ml-auto"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Set Button */}
      {!isCardio && (
        <button
          onClick={() => onAddSet(exercise.exercise_id)}
          className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-brand-blue rounded-xl text-[10px] font-bold uppercase tracking-widest border border-dashed border-white/5 transition-all"
        >
          <Plus size={12} className="inline mr-1" />
          Añadir Serie
        </button>
      )}
    </div>
  );
}
