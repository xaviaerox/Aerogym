import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, Trash2, Sparkles, ChevronRight, Loader2, X, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { BASE_EXERCISES } from '../constants/exercises';
import { generateRoutineWithAI } from '../lib/aiService';
import type { Routine, RoutineExercise } from '../infrastructure/supabase/types';
import { cn } from '../lib/utils';

export default function RoutinesList() {
  const { profile, user } = useAuthStore();
  const { routines, startSession, deleteRoutine, createRoutine } = useWorkoutStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

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
      // TODO: Add exercises to routine (Sprint 2)
      alert(`✅ Rutina "${routine.name}" creada por IA`);
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
              className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4"
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => handleDelete(routine.id, e)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
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
    </div>
  );
}
