import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  X,
  ChevronRight,
  Sparkles,
  Save,
  Clock,
  Dumbbell,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
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
import { BASE_EXERCISES } from '../constants/exercises';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import type { Routine, RoutineExercise } from '../infrastructure/supabase/types';
import { supabase } from '../infrastructure/supabase/client';
import { cn, getMuscleWikiUrl } from '../lib/utils';
import { MuscleWikiService, TRANSLATE_MUSCLE } from '../lib/muscleWikiService';
import MuscleWikiExplorer from './MuscleWikiExplorer';

interface RoutineEditorProps {
  routine: Routine & { exercises: RoutineExercise[] };
  onBack: () => void;
}

interface EditableExercise {
  tempId: string; // ID único temporal para el reordenamiento del editor
  id?: string; // ID en la BD si existe
  exercise_id: string;
  name: string;
  muscleGroup: string;
  default_sets: number;
  default_reps: string;
  default_weight_kg: number;
  rest_seconds: number;
  notes?: string;
}

export default function RoutineEditor({ routine, onBack }: RoutineEditorProps) {
  const { updateRoutineExercises } = useWorkoutStore();
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeSelectorTab, setActiveSelectorTab] = useState<'aerogym' | 'musclewiki'>('aerogym');

  // Mapear los ejercicios iniciales de la rutina al estado editable local
  const [exercises, setExercises] = useState<EditableExercise[]>(() =>
    (routine.exercises || [])
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map((ex) => {
        const info = BASE_EXERCISES.find((e) => e.id === ex.exercise_id) || 
          (ex.exercise_id.startsWith('mw-') ? MuscleWikiService.getCachedExerciseInfo(ex.exercise_id) : undefined);
        return {
          tempId: `loaded-${ex.id || Math.random().toString(36).substr(2, 9)}`,
          id: ex.id,
          exercise_id: ex.exercise_id,
          name: info?.name || ex.exercise_id,
          muscleGroup: info?.muscleGroup || 'Otros',
          default_sets: ex.default_sets || 3,
          default_reps: ex.default_reps || '8-12',
          default_weight_kg: Number(ex.default_weight_kg) || 0,
          rest_seconds: ex.rest_seconds || 90,
          notes: ex.notes || '',
        };
      })
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Previene arrastres accidentales al hacer clicks normales
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.tempId === active.id);
        const newIndex = items.findIndex((item) => item.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateField = (tempId: string, field: keyof EditableExercise, value: unknown) => {
    setExercises((items) =>
      items.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveExercise = (tempId: string) => {
    setExercises((items) => items.filter((item) => item.tempId !== tempId));
  };

  const handleAddExercise = (exerciseId: string) => {
    const info = BASE_EXERCISES.find((e) => e.id === exerciseId);
    if (!info) return;

    const newEx: EditableExercise = {
      tempId: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercise_id: exerciseId,
      name: info.name,
      muscleGroup: info.muscleGroup,
      default_sets: 3,
      default_reps: '8-12',
      default_weight_kg: 0,
      rest_seconds: 90,
      notes: '',
    };

    setExercises((items) => [...items, newEx]);
    setIsSelectorOpen(false);
    setSearch('');
    setSelectedMuscle(null);
  };

  const handleAddMuscleWikiExercise = (mwEx: any) => {
    const newEx: EditableExercise = {
      tempId: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercise_id: `mw-${mwEx.id}`,
      name: mwEx.name,
      muscleGroup: TRANSLATE_MUSCLE[mwEx.primary_muscles[0]] || mwEx.primary_muscles[0],
      default_sets: 3,
      default_reps: '8-12',
      default_weight_kg: 0,
      rest_seconds: 90,
      notes: '',
    };

    setExercises((items) => [...items, newEx]);
    setIsSelectorOpen(false);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    setExercises((items) => {
      const updated = [...items];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      // 1. Guardar cambios en el nombre y descripción en la rutina
      await supabase
        .from('routines')
        .update({ name: name.trim(), description: description.trim() })
        .eq('id', routine.id);

      // 2. Mapear y guardar la secuencia de ejercicios ordenada
      const routineExercisesToSave = exercises.map((ex, idx) => ({
        routine_id: routine.id,
        exercise_id: ex.exercise_id,
        order_index: idx,
        default_sets: ex.default_sets,
        default_reps: ex.default_reps,
        default_weight_kg: ex.default_weight_kg,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes || null,
      }));

      await updateRoutineExercises(routine.id, routineExercisesToSave as any);
      onBack();
    } catch (err) {
      console.error('Error saving routine:', err);
      alert('Error guardando la rutina');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrado de ejercicios para el selector
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
            <h1 className="text-xl font-bold text-slate-50">Editar Rutina</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Constructor</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
          <Save size={14} />
        </button>
      </div>

      {/* Routine Info Inputs */}
      <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Nombre de la Rutina</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Empuje / Pecho + Hombro"
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Descripción / Enfoque</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Enfocada en fuerza del tren superior con sobrecarga progresiva"
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 text-slate-300"
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Dumbbell size={16} className="text-brand-blue" /> Ejercicios ({exercises.length})
          </h2>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            Arrastra el grip ☰ para reordenar
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center space-y-3 border border-dashed border-white/10">
            <Dumbbell size={32} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm font-medium">No hay ejercicios en esta rutina</p>
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="py-2 px-4 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              + Añadir Ejercicio
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((item) => item.tempId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <SortableItem
                    key={ex.tempId}
                    item={ex}
                    index={idx}
                    isFirst={idx === 0}
                    isLast={idx === exercises.length - 1}
                    onMove={(dir) => moveExercise(idx, dir)}
                    onRemove={() => handleRemoveExercise(ex.tempId)}
                    onUpdateField={(field, val) => handleUpdateField(ex.tempId, field, val)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add exercise button */}
      {exercises.length > 0 && (
        <button
          onClick={() => setIsSelectorOpen(true)}
          className="w-full py-4 glass border-brand-blue/30 text-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/5 transition-colors"
        >
          <Plus size={20} />
          Añadir Ejercicio
        </button>
      )}

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
              <h2 className="text-2xl font-bold">Añadir a la Rutina</h2>
              <button
                onClick={() => {
                  setIsSelectorOpen(false);
                  setSearch('');
                  setSelectedMuscle(null);
                  setActiveSelectorTab('aerogym');
                }}
                className="p-2 glass rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Selector Tabs */}
            <div className="px-6 pb-4">
              <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveSelectorTab('aerogym')}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                    activeSelectorTab === 'aerogym'
                      ? 'bg-brand-blue text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  )}
                >
                  Aerogym
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSelectorTab('musclewiki')}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                    activeSelectorTab === 'musclewiki'
                      ? 'bg-brand-blue text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  )}
                >
                  MuscleWiki
                </button>
              </div>
            </div>

            {activeSelectorTab === 'aerogym' ? (
              <>
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
                    type="button"
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
                      type="button"
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
                      type="button"
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
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <MuscleWikiExplorer onSelectExercise={handleAddMuscleWikiExercise} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SortableItemProps {
  key?: string;
  item: EditableExercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
  onUpdateField: (field: keyof EditableExercise, val: any) => void;
}

function SortableItem({ item, index, isFirst, isLast, onMove, onRemove, onUpdateField }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.tempId,
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
        'glass p-4 rounded-3xl border transition-all flex flex-col gap-3',
        isDragging
          ? 'border-brand-blue/40 bg-slate-800/80 scale-[1.02] shadow-2xl shadow-brand-blue/10'
          : 'border-white/5'
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* drag handle & arrows */}
          <div className="flex items-center gap-1 -ml-2">
            <div
              {...attributes}
              {...listeners}
              className="p-1.5 text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300 transition-colors"
            >
              <GripVertical size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onMove('up')}
                className="p-0.5 text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onMove('down')}
                className="p-0.5 text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
              {item.exercise_id.startsWith('mw-') ? (
                <span className="text-[8px] text-brand-blue font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                  MuscleWiki
                </span>
              ) : (
                <a
                  href={getMuscleWikiUrl(item.muscleGroup)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-slate-500 hover:text-brand-blue font-bold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  Wiki ↗
                </a>
              )}
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
              {item.muscleGroup}
            </p>
          </div>
        </div>
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Config Row */}
      {item.muscleGroup === 'Cardio' ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Duración (min)</label>
            <input
              type="number"
              value={item.default_reps ? parseInt(item.default_reps) || 10 : 10}
              min={1}
              onChange={(e) => {
                onUpdateField('default_reps', (parseInt(e.target.value) || 10).toString());
                onUpdateField('default_sets', 1);
                onUpdateField('default_weight_kg', 0);
              }}
              className="w-full bg-slate-800/80 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
            />
          </div>
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Rest (seg)</label>
            <div className="relative">
              <input
                type="number"
                value={item.rest_seconds}
                placeholder="90"
                onChange={(e) => onUpdateField('rest_seconds', parseInt(e.target.value) || 90)}
                className="w-full bg-slate-800/80 text-center rounded-xl py-2 pl-1 pr-4 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />
              <Clock size={10} className="absolute right-2 top-3 text-slate-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Series</label>
            <input
              type="number"
              value={item.default_sets}
              min={1}
              max={20}
              onChange={(e) => onUpdateField('default_sets', parseInt(e.target.value) || 1)}
              className="w-full bg-slate-800/80 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
            />
          </div>
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Reps</label>
            <input
              type="text"
              value={item.default_reps}
              placeholder="8-12"
              onChange={(e) => onUpdateField('default_reps', e.target.value)}
              className="w-full bg-slate-800/80 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
            />
          </div>
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Peso (kg)</label>
            <input
              type="number"
              value={item.default_weight_kg || ''}
              placeholder="0"
              onChange={(e) => onUpdateField('default_weight_kg', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800/80 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
            />
          </div>
          <div>
            <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Rest (seg)</label>
            <div className="relative">
              <input
                type="number"
                value={item.rest_seconds}
                placeholder="90"
                onChange={(e) => onUpdateField('rest_seconds', parseInt(e.target.value) || 90)}
                className="w-full bg-slate-800/80 text-center rounded-xl py-2 pl-1 pr-4 outline-none font-bold text-sm text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
              />
              <Clock size={10} className="absolute right-2 top-3 text-slate-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
