import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, Trash2, Sparkles, ChevronRight, Loader2, X, Dumbbell, Edit2, Calendar, Target, Zap, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

const PRESET_PROMPTS = [
  { label: '🔥 Push / Empuje', prompt: 'Rutina de empuje centrada en pectorales, deltoides anterior/lateral y tríceps.' },
  { label: '💪 Pull / Tirón', prompt: 'Rutina de tirón enfocada en dorsales, trapecios y bíceps.' },
  { label: '🦵 Leg Day / Pierna', prompt: 'Rutina completa de tren inferior: cuadriceps, isquios y glúteos.' },
  { label: '⏱️ Exprés (30 min)', prompt: 'Rutina corta de alta densidad de 30 minutos con descansos breves.' },
  { label: '🏠 Mancuernas', prompt: 'Rutina realizada exclusivamente con mancuernas y peso corporal.' },
];

export default function RoutinesList() {
  const { profile, user } = useAuthStore();
  const {
    routines,
    startSession,
    deleteRoutine,
    createRoutine,
    updateRoutineExercises,
    reorderRoutines,
    sessions,
    workoutSetsHistory,
    deletePastSession,
    fetchSessions,
    fetchWorkoutHistory,
  } = useWorkoutStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routines.findIndex((r) => r.id === active.id);
      const newIndex = routines.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newRoutines = arrayMove(routines, oldIndex, newIndex);
        reorderRoutines(newRoutines);
      }
    }
  };

  const moveRoutine = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= routines.length) return;
    const newRoutines = arrayMove(routines, index, targetIndex);
    reorderRoutines(newRoutines);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [editingRoutine, setEditingRoutine] = useState<(Routine & { exercises: RoutineExercise[] }) | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'routines' | 'history'>('routines');
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  React.useEffect(() => {
    if (user?.id) {
      fetchSessions(user.id);
      fetchWorkoutHistory(user.id);
    }
  }, [user?.id, fetchSessions, fetchWorkoutHistory]);

  const handleGenerateAI = async (promptToUse?: string) => {
    if (!profile || !user?.id) return;
    setIsGenerating(true);
    const finalPrompt = promptToUse !== undefined ? promptToUse : customPrompt;

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
        exercisesForAI,
        finalPrompt
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

      setIsAIModalOpen(false);
      setCustomPrompt('');
    } catch (err) {
      console.error(err);
      alert('Error generando rutina con IA. Inténtalo de nuevo.');
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
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue/20 border border-brand-blue/30 rounded-2xl text-brand-blue text-sm font-bold hover:bg-brand-blue/30 transition-all shadow-md"
          >
            <Sparkles size={16} />
            Diseñar con IA
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
          {/* Create Manual dialog */}
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
                  Crea una manualmente o personalízala con IA
                </p>
              </div>
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="w-full py-3 bg-brand-blue/20 border border-brand-blue/30 text-brand-blue rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Diseñar Rutina con IA
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={routines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {routines.map((routine, idx) => (
                    <SortableRoutineItem
                      key={routine.id}
                      routine={routine}
                      index={idx}
                      isFirst={idx === 0}
                      isLast={idx === routines.length - 1}
                      onMove={(dir) => moveRoutine(idx, dir)}
                      onEdit={() => setEditingRoutine(routine)}
                      onDelete={(e) => handleDelete(routine.id, e)}
                      onStart={() => startSession(routine as Routine & { exercises: RoutineExercise[] })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
            <div className="space-y-4">
              {sessions.map((session) => {
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
                    className="glass p-5 rounded-3xl border border-white/5 space-y-4 hover:border-brand-blue/20 transition-all"
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
                          title="Editar entrenamiento"
                          className="p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-xl bg-white/5 border border-white/5 hover:bg-white/10"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar esta sesión de entrenamiento de forma permanente?')) {
                              await deletePastSession(session.id);
                            }
                          }}
                          title="Eliminar entrenamiento"
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
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

      {/* ── MODAL PROMPTEABLE DE GENERACIÓN DE RUTINA IA ────────────────── */}
      <AnimatePresence>
        {isAIModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex justify-center items-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md glass-dark border border-white/10 p-6 rounded-3xl space-y-5 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-brand-blue/20 rounded-xl flex items-center justify-center border border-brand-blue/30 text-brand-blue">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">Diseñador de Rutinas IA</h3>
                    <p className="text-[10px] text-slate-400">Instrucciones a medida para Llama 3.3</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-xl glass"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Plantillas Rápidas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomPrompt(preset.prompt)}
                      className="text-[11px] bg-slate-800/80 hover:bg-brand-blue/15 text-slate-300 hover:text-brand-blue px-3 py-1.5 rounded-xl border border-white/10 hover:border-brand-blue/30 font-semibold transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Instrucciones o Requisitos Específicos
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: Rutina de Empuje (Push) enfocada en hipertrofia de pecho superior y hombro lateral con mancuernas. 45 minutos."
                  rows={4}
                  className="w-full bg-slate-800/90 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-100 outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 leading-relaxed resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(false)}
                  disabled={isGenerating}
                  className="flex-1 py-3 glass rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAI()}
                  disabled={isGenerating}
                  className="flex-1 py-3 bg-brand-blue text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-blue/90 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Diseñando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generar Rutina
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SortableRoutineItemProps {
  key?: string;
  routine: Routine & { exercises: RoutineExercise[] };
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'up' | 'down') => void;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onStart: () => void;
}

function SortableRoutineItem({
  routine,
  isFirst,
  isLast,
  onMove,
  onEdit,
  onDelete,
  onStart,
}: SortableRoutineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: routine.id,
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer',
        isDragging
          ? 'border-brand-blue/40 bg-slate-800/90 scale-[1.02] shadow-2xl shadow-brand-blue/10'
          : 'border-white/5 hover:border-brand-blue/20'
      )}
      onClick={onEdit}
    >
      {/* Drag & Move controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300 transition-colors"
          title="Arrastrar para reordenar"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove('up')}
            className="p-0.5 text-slate-500 hover:text-brand-blue disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
            title="Mover arriba"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove('down')}
            className="p-0.5 text-slate-500 hover:text-brand-blue disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
            title="Mover abajo"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Routine Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-50 truncate">{routine.name}</p>
        {routine.description && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{routine.description}</p>
        )}
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-1">
          {routine.exercises?.length || 0} ejercicios
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onEdit}
          className="p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-xl hover:bg-white/5"
          title="Editar rutina"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"
          title="Eliminar rutina"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 bg-brand-blue text-slate-950 px-3.5 py-2.5 rounded-xl font-black text-xs hover:bg-brand-blue/90 transition-all shadow-md"
        >
          <Play size={14} fill="currentColor" />
          INICIAR
        </button>
      </div>
    </div>
  );
}
