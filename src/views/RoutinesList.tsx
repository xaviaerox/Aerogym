import React, { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, Trash2, Sparkles, ChevronRight, Loader2, X, Dumbbell, Edit2, Calendar } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { BASE_EXERCISES } from '../constants/exercises';
import { generateRoutineWithAI } from '../lib/aiService';
import type { Routine, RoutineExercise, WorkoutSession } from '../infrastructure/supabase/types';
import RoutineEditor from './RoutineEditor';
import SessionEditor from './SessionEditor';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RoutinesList() {
  const { profile, user } = useAuthStore();
  const { routines, startSession, deleteRoutine, createRoutine, updateRoutineExercises, sessions, workoutSetsHistory, deletePastSession } = useWorkoutStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [editingRoutine, setEditingRoutine] = useState<(Routine & { exercises: RoutineExercise[] }) | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'routines' | 'history'>('routines');
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  });

  const handleGenerateAI = async () => {
    if (!profile || !user?.id) return;
    setIsGenerating(true);
    try {
      const exercisesForAI = BASE_EXERCISES.map((ex) => ({
        id: ex.id,
        name: ex.name,
        type: ex.type === 'Compuesto' ? 'compound' : 'isolation',
        muscle_group: ex.muscleGroup,
      }));

      const generated = await generateRoutineWithAI(
        {
          name: profile.name,
          goal: profile.goal,
          level: profile.level,
          weight_kg: profile.weight_kg,
          height_cm: profile.height_cm,
          age: profile.age,
          sessionsCount: 0,
        },
        exercisesForAI
      );

      // Create the routine in Supabase
      const routine = await createRoutine(user.id, generated.name, generated.description);
      
      // Add exercises to routine
      if (generated.exercises && generated.exercises.length > 0) {
        const exercisesToInsert = generated.exercises.map((ex, idx) => ({
          routine_id: routine.id,
          exercise_id: ex.exerciseId,
          default_sets: ex.defaultSets || 3,
          default_reps: ex.defaultReps || '8-12',
          default_weight_kg: ex.defaultWeight || 0,
          rest_seconds: 90,
          order_index: idx
        }));
        await updateRoutineExercises(routine.id, exercisesToInsert as any);
      }

      alert(`✅ Rutina "${routine.name}" creada por IA con ${generated.exercises?.length || 0} ejercicios.`);
    } catch (err) {
      console.error(err);
      alert('Error generando rutina. Verifica que el coach IA esté configurado.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    if (!user?.id || !newRoutineName.trim()) return;
    await createRoutine(user.id, newRoutineName.trim());
    setNewRoutineName('');
    setIsCreating(false);
  };

  const handleDelete = async (routineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta rutina?')) return;
    await deleteRoutine(routineId);
  };

  if (editingSession) {
    return (
      <SessionEditor
        session={editingSession}
        onBack={() => setEditingSession(null)}
      />
    );
  }

  if (editingRoutine) {
    // Buscar la rutina actualizada del store (por si el usuario guardó cambios)
    const freshRoutine = routines.find(r => r.id === editingRoutine.id) || editingRoutine;
    return (
      <RoutineEditor
        routine={freshRoutine}
        onBack={() => setEditingRoutine(null)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rutinas</h1>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="p-3 glass rounded-2xl text-brand-blue border border-brand-blue/20"
          >
            <Plus size={20} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue/20 border border-brand-blue/30 rounded-2xl text-brand-blue text-sm font-bold disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            IA
          </motion.button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('routines')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
            activeSubTab === 'routines'
              ? 'bg-brand-blue text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          )}
        >
          Rutinas
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
            activeSubTab === 'history'
              ? 'bg-brand-blue text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          )}
        >
          Historial ({sessions.length})
        </button>
      </div>

      {activeSubTab === 'routines' ? (
        <>
          {/* Create dialog */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass p-4 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    placeholder="Nombre de la rutina..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateManual()}
                    className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateManual}
                    disabled={!newRoutineName.trim()}
                    className="px-4 py-3 bg-brand-blue text-slate-950 rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => { setIsCreating(false); setNewRoutineName(''); }}
                    className="p-3 glass rounded-xl text-slate-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Routines list */}
          {routines.length === 0 ? (
            <div className="glass p-10 rounded-3xl text-center space-y-4">
              <Dumbbell size={40} className="text-slate-600 mx-auto" />
              <div>
                <p className="text-slate-400 font-medium">Sin rutinas todavía</p>
                <p className="text-slate-600 text-sm mt-1">
                  Crea una manualmente o déjasela a la IA
                </p>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-3 bg-brand-blue/20 border border-brand-blue/30 text-brand-blue rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generar con IA
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => (
                <motion.div
                  key={routine.id}
                  whileTap={{ scale: 0.98 }}
                  className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer"
                  onClick={() => setEditingRoutine(routine)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-50 truncate">{routine.name}</p>
                    {routine.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{routine.description}</p>
                    )}
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-1">
                      {routine.exercises?.length || 0} ejercicios
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingRoutine(routine)}
                      className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(routine.id, e)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => startSession(routine as Routine & { exercises: RoutineExercise[] })}
                      className="flex items-center gap-1.5 bg-brand-blue text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs"
                    >
                      <Play size={14} fill="currentColor" />
                      INICIAR
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center space-y-3">
              <Calendar size={40} className="text-slate-600 mx-auto" />
              <div>
                <p className="text-slate-400 font-bold">Sin entrenamientos registrados</p>
                <p className="text-slate-600 text-xs mt-1">Inicia una rutina o haz un entreno libre para registrar sesiones</p>
              </div>
            </div>
          ) : (
            <div ref={parentRef} className="space-y-4">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const session = sessions[virtualRow.index];
                if (!session) return null;
                const sessionSets = workoutSetsHistory.filter((s) => s.session_id === session.id);
                
                const exerciseCounts = new Map<string, { count: number; isCardio: boolean; duration: number }>();
                sessionSets.forEach((set) => {
                  const exerciseInfo = BASE_EXERCISES.find((e) => e.id === set.exercise_id);
                  const name = exerciseInfo?.name || set.exercise_id;
                  const isCardio = exerciseInfo?.muscleGroup === 'Cardio';
                  const duration = set.duration_seconds ? Math.round(set.duration_seconds / 60) : 0;
                  
                  if (!exerciseCounts.has(name)) {
                    exerciseCounts.set(name, { count: 0, isCardio, duration: 0 });
                  }
                  const item = exerciseCounts.get(name)!;
                  item.count += 1;
                  item.duration += duration;
                });

                const summaryStrings: string[] = [];
                exerciseCounts.forEach((info, name) => {
                  if (info.isCardio) {
                    summaryStrings.push(`${name} (${info.duration} min)`);
                  } else {
                    summaryStrings.push(`${info.count}x ${name}`);
                  }
                });

                return (
                  <div
                    key={session.id}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    className="glass p-5 rounded-3xl border border-white/5 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-50 text-base">{session.name}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {format(new Date(session.started_at), "PPPP, HH:mm", { locale: es })}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {session.duration_minutes !== null && session.duration_minutes !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded font-black uppercase">
                              ⏱️ {session.duration_minutes} min
                            </span>
                          )}
                          {session.perceived_difficulty && (
                            <span className="inline-block text-[9px] bg-slate-800 text-brand-blue border border-brand-blue/10 px-2 py-0.5 rounded font-black uppercase">
                              Dificultad: {session.perceived_difficulty}/10
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSession(session)}
                          className="p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-xl bg-white/5 border border-white/5"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar esta sesión de entrenamiento de forma permanente?')) {
                              await deletePastSession(session.id);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-xl bg-white/5 border border-white/5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {summaryStrings.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-1">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Ejercicios Realizados</p>
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                          {summaryStrings.join(' · ')}
                        </p>
                      </div>
                    )}

                    {session.notes && (
                      <p className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
