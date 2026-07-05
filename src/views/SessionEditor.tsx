import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, Trash, Clock, Dumbbell, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { BASE_EXERCISES } from '../constants/exercises';
import { cn, getMuscleWikiUrl } from '../lib/utils';
import { calculateE1RM } from '../lib/engine';
import type { WorkoutSession, WorkoutSet } from '../infrastructure/supabase/types';

interface SessionEditorProps {
  session: WorkoutSession;
  onBack: () => void;
}

interface EditableExercise {
  exercise_id: string;
  sets: {
    id: string;
    reps: number | null;
    weight_kg: number;
    rpe: number | null;
    rir: number | null;
    duration_seconds: number | null;
    distance_meters: number | null;
    is_completed: boolean;
    is_warmup: boolean;
    is_pr: boolean;
  }[];
}

export default function SessionEditor({ session, onBack }: SessionEditorProps) {
  const { workoutSetsHistory, saveSessionEdits, deletePastSession } = useWorkoutStore();

  const [name, setName] = useState(session.name);
  const [date, setDate] = useState(() => {
    // Convert started_at ISO to YYYY-MM-DDTHH:MM local format
    const d = new Date(session.started_at);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  });
  const [notes, setNotes] = useState(session.notes || '');
  const [difficulty, setDifficulty] = useState<number | null>(session.perceived_difficulty);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Group sets by exercise
  const [exercises, setExercises] = useState<EditableExercise[]>([]);

  useEffect(() => {
    const sessionSets = workoutSetsHistory.filter((s) => s.session_id === session.id);
    
    // Group them while preserving order based on set_number or logged_at
    const groupedMap = new Map<string, typeof sessionSets>();
    sessionSets.forEach((set) => {
      if (!groupedMap.has(set.exercise_id)) {
        groupedMap.set(set.exercise_id, []);
      }
      groupedMap.get(set.exercise_id)!.push(set);
    });

    const list: EditableExercise[] = [];
    groupedMap.forEach((sets, exerciseId) => {
      // Sort sets by set_number
      const sortedSets = [...sets].sort((a, b) => (a.set_number || 0) - (b.set_number || 0));
      list.push({
        exercise_id: exerciseId,
        sets: sortedSets.map((s) => ({
          id: s.id || `temp-${Math.random()}`,
          reps: s.reps,
          weight_kg: Number(s.weight_kg) || 0,
          rpe: s.rpe,
          rir: s.rir,
          duration_seconds: s.duration_seconds,
          distance_meters: s.distance_meters,
          is_completed: s.is_completed ?? true,
          is_warmup: s.is_warmup ?? false,
          is_pr: s.is_pr ?? false,
        })),
      });
    });

    setExercises(list);
  }, [session.id, workoutSetsHistory]);

  const handleUpdateSetField = (exerciseId: string, setIdx: number, field: string, value: any) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const updatedSets = ex.sets.map((s, idx) =>
          idx === setIdx ? { ...s, [field]: value } : s
        );
        return { ...ex, sets: updatedSets };
      })
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const isCardio = BASE_EXERCISES.find(e => e.id === exerciseId)?.muscleGroup === 'Cardio';
        
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `temp-${Date.now()}-${Math.random()}`,
              reps: isCardio ? null : (lastSet?.reps || 10),
              weight_kg: isCardio ? 0 : (lastSet?.weight_kg || 0),
              rpe: null,
              rir: null,
              duration_seconds: isCardio ? (lastSet?.duration_seconds || 600) : null,
              distance_meters: null,
              is_completed: true,
              is_warmup: false,
              is_pr: false,
            },
          ],
        };
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const updated = ex.sets.filter((_, idx) => idx !== setIdx);
        return { ...ex, sets: updated };
      }).filter((ex) => ex.sets.length > 0) // Remove exercise if no sets remain
    );
  };

  const handleAddExercise = (exerciseId: string) => {
    const isCardio = BASE_EXERCISES.find(e => e.id === exerciseId)?.muscleGroup === 'Cardio';
    const newEx: EditableExercise = {
      exercise_id: exerciseId,
      sets: [
        {
          id: `temp-${Date.now()}`,
          reps: isCardio ? null : 10,
          weight_kg: isCardio ? 0 : 0,
          rpe: null,
          rir: null,
          duration_seconds: isCardio ? 600 : null,
          distance_meters: null,
          is_completed: true,
          is_warmup: false,
          is_pr: false,
        },
      ],
    };

    setExercises((prev) => [...prev, newEx]);
    setIsSelectorOpen(false);
    setSearch('');
    setSelectedMuscle(null);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!confirm('¿Eliminar este ejercicio completo de la sesión?')) return;
    setExercises((prev) => prev.filter((ex) => ex.exercise_id !== exerciseId));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const updates = {
        name: name.trim(),
        started_at: new Date(date).toISOString(),
        notes: notes.trim() || null,
        perceived_difficulty: difficulty,
      };

      await saveSessionEdits(session.id, updates, exercises as any);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Error guardando cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar esta sesión de entrenamiento de forma permanente? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    try {
      await deletePastSession(session.id);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Error eliminando la sesión');
      setIsDeleting(false);
    }
  };

  // Selector filters
  const muscleGroups = Array.from(new Set(BASE_EXERCISES.map((ex) => ex.muscleGroup)));
  const filteredExercises = BASE_EXERCISES.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md pt-2 pb-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 glass rounded-xl text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-50">Editar Sesión</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Historial</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting || !name.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* Session Details */}
      <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Nombre de la Sesión</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Fecha / Hora</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 text-slate-100"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Dificultad (1-10)</label>
            <select
              value={difficulty || ''}
              onChange={(e) => setDifficulty(parseInt(e.target.value) || null)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 text-slate-100 font-bold"
            >
              <option value="">Sin especificar</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <option key={d} value={d}>
                  {d} - {d >= 8 ? 'Intenso' : d >= 5 ? 'Moderado' : 'Ligero'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Notas de la sesión</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 resize-none"
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Dumbbell size={16} className="text-brand-blue" /> Ejercicios Realizados
        </h2>

        {exercises.map((ex) => {
          const exerciseInfo = BASE_EXERCISES.find((e) => e.id === ex.exercise_id);
          const isCardio = exerciseInfo?.muscleGroup === 'Cardio';

          return (
            <div key={ex.exercise_id} className="glass p-5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-50">{exerciseInfo?.name || ex.exercise_id}</h3>
                    {exerciseInfo?.muscleGroup && (
                      <a
                        href={getMuscleWikiUrl(exerciseInfo.muscleGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-slate-500 hover:text-brand-blue font-bold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-all"
                      >
                        Wiki ↗
                      </a>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
                    {exerciseInfo?.muscleGroup || 'Musculación'} · {exerciseInfo?.type || 'Compuesto'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveExercise(ex.exercise_id)}
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
                {ex.sets.map((set, sIdx) => {
                  if (isCardio) {
                    return (
                      <div key={set.id || sIdx} className="grid grid-cols-[30px_1fr_1fr_60px_40px] gap-2 items-center bg-white/[0.02] p-1.5 rounded-xl border border-transparent">
                        <span className="text-xs font-bold text-slate-500 text-center">{sIdx + 1}</span>
                        
                        <input
                          type="number"
                          value={set.duration_seconds ? Math.round(set.duration_seconds / 60) : ''}
                          placeholder="0 min"
                          onChange={(e) =>
                            handleUpdateSetField(ex.exercise_id, sIdx, 'duration_seconds', (parseInt(e.target.value) || 0) * 60)
                          }
                          className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                        />

                        <input
                          type="number"
                          value={set.distance_meters !== null && set.distance_meters !== undefined ? set.distance_meters : ''}
                          placeholder="Opcional"
                          onChange={(e) =>
                            handleUpdateSetField(ex.exercise_id, sIdx, 'distance_meters', parseInt(e.target.value) || null)
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
                            handleUpdateSetField(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                          }
                          className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-400 placeholder:text-slate-600"
                        />

                        <button
                          onClick={() => handleRemoveSet(ex.exercise_id, sIdx)}
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
                          handleUpdateSetField(ex.exercise_id, sIdx, 'weight_kg', parseFloat(e.target.value) || 0)
                        }
                        className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                      />

                      <input
                        type="number"
                        value={set.reps || ''}
                        placeholder="0"
                        onChange={(e) =>
                          handleUpdateSetField(ex.exercise_id, sIdx, 'reps', parseInt(e.target.value) || null)
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
                          handleUpdateSetField(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
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
                          handleUpdateSetField(ex.exercise_id, sIdx, 'rir', parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : null)
                        }
                        className="bg-slate-800 text-center rounded-lg py-1.5 outline-none font-bold text-xs text-slate-400 placeholder:text-slate-600"
                      />

                      <button
                        onClick={() => handleRemoveSet(ex.exercise_id, sIdx)}
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
                  onClick={() => handleAddSet(ex.exercise_id)}
                  className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-brand-blue rounded-xl text-[10px] font-bold uppercase tracking-widest border border-dashed border-white/5 transition-all"
                >
                  <Plus size={12} className="inline mr-1" />
                  Añadir Serie
                </button>
              )}
            </div>
          );
        })}

        {/* Add Exercise Trigger Button */}
        <button
          onClick={() => setIsSelectorOpen(true)}
          className="w-full py-4 glass border-brand-blue/30 text-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/5 transition-colors"
        >
          <Plus size={20} />
          Añadir Ejercicio a la Sesión
        </button>
      </div>

      {/* Exercise Selector Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 pb-3">
              <h2 className="text-2xl font-bold">Añadir Ejercicio</h2>
              <button
                onClick={() => {
                  setIsSelectorOpen(false);
                  setSearch('');
                  setSelectedMuscle(null);
                }}
                className="p-2 glass rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 pb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ejercicio o músculo..."
                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                autoFocus
              />
            </div>

            {/* Muscle Group Filters */}
            <div className="px-6 pb-4 overflow-x-auto flex gap-2 no-scrollbar scrollbar-none">
              <button
                onClick={() => setSelectedMuscle(null)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                  selectedMuscle === null
                    ? 'bg-brand-blue text-slate-950 border-brand-blue'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                )}
              >
                Todos
              </button>
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setSelectedMuscle(mg === selectedMuscle ? null : mg)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                    selectedMuscle === mg
                      ? 'bg-brand-blue text-slate-950 border-brand-blue'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {mg}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExercise(ex.id)}
                  className="w-full p-4 glass rounded-xl flex justify-between items-center hover:border-brand-blue/30 border border-transparent transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold">{ex.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
                      {ex.muscleGroup} · {ex.type}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
