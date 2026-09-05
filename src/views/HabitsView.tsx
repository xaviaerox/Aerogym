import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  MessageSquare,
  Trophy,
  CheckCircle2,
  X,
  Target,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useHabitStore } from '../application/stores/useHabitStore';
import type { Habit, HabitLog } from '../infrastructure/supabase/types';
import {
  isHabitDueOnDate,
  calculateHabitStreak,
  calculateDailyStats,
  formatDateString,
  parseDateString,
} from '../lib/habitsEngine';
import HabitIcon from '../components/habits/HabitIcon';
import HabitModal from '../components/habits/HabitModal';
import HabitTemplatesModal from '../components/habits/HabitTemplatesModal';
import { cn } from '../lib/utils';

export default function HabitsView() {
  const { user } = useAuthStore();
  const {
    habits,
    habitLogs,
    selectedDate,
    fetchHabits,
    fetchHabitLogs,
    createHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleHabitLog,
    createPresetHabits,
    setSelectedDate,
  } = useHabitStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [noteModalHabit, setNoteModalHabit] = useState<{ id: string; name: string; currentNote: string } | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Sensors para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (user?.id) {
      fetchHabits(user.id);
      fetchHabitLogs(user.id);
    }
  }, [user?.id, fetchHabits, fetchHabitLogs]);

  // Manejador Drag & Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && user?.id) {
        const reordered = arrayMove(habits, oldIndex, newIndex);
        reorderHabits(user.id, reordered);
      }
    }
  };

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    if (!user?.id) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;
    const reordered = arrayMove(habits, index, targetIndex);
    reorderHabits(user.id, reordered);
  };

  // Navegación de fechas
  const selectedDateObj = useMemo(() => parseDateString(selectedDate), [selectedDate]);
  const todayStr = useMemo(() => formatDateString(new Date()), []);
  const isToday = selectedDate === todayStr;

  const navigateDate = (days: number) => {
    const next = addDays(selectedDateObj, days);
    setSelectedDate(formatDateString(next));
  };

  const goToToday = () => {
    setSelectedDate(todayStr);
  };

  // Cálculo de tira semanal (7 días alrededor de la fecha seleccionada)
  const weekDays = useMemo(() => {
    const list: { dateStr: string; label: string; dayNum: string; isSelected: boolean; isToday: boolean }[] = [];
    const base = subDays(selectedDateObj, 3);
    for (let i = 0; i < 7; i++) {
      const d = addDays(base, i);
      const dateStr = formatDateString(d);
      list.push({
        dateStr,
        label: format(d, 'EEE', { locale: es }).slice(0, 3).toUpperCase(),
        dayNum: format(d, 'd'),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }, [selectedDateObj, selectedDate, todayStr]);

  // Estadísticas del día seleccionado
  const dailyStats = useMemo(() => {
    return calculateDailyStats(habits, habitLogs, selectedDate);
  }, [habits, habitLogs, selectedDate]);

  // Hábitos que corresponden al día seleccionado
  const dueHabitIds = useMemo(() => {
    return new Set(dailyStats.dueHabits.map((h) => h.id));
  }, [dailyStats]);

  // Logs en mapa para acceso O(1)
  const logsMap = useMemo(() => {
    const map = new Map<string, HabitLog>();
    habitLogs.forEach((l) => {
      if (l.date === selectedDate) {
        map.set(l.habit_id, l);
      }
    });
    return map;
  }, [habitLogs, selectedDate]);

  const handleToggle = (habitId: string) => {
    if (!user?.id) return;
    const currentLog = logsMap.get(habitId);
    toggleHabitLog(user.id, habitId, selectedDate, currentLog?.notes);
  };

  const handleOpenNoteModal = (habit: Habit) => {
    const currentLog = logsMap.get(habit.id);
    setNoteModalHabit({
      id: habit.id,
      name: habit.name,
      currentNote: currentLog?.notes || '',
    });
    setTempNote(currentLog?.notes || '');
  };

  const handleSaveNote = () => {
    if (!user?.id || !noteModalHabit) return;
    const currentLog = logsMap.get(noteModalHabit.id);
    const completed = currentLog ? currentLog.completed : true; // si añade nota, asume completado
    toggleHabitLog(user.id, noteModalHabit.id, selectedDate, tempNote.trim() || null);
    setNoteModalHabit(null);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-50 flex items-center gap-2.5">
            <CheckCircle2 className="text-brand-blue" size={26} />
            Hábitos & Disciplina
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Checklist diario personalizable. La constancia vence al talento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplatesOpen(true)}
            className="glass px-3.5 py-2.5 rounded-2xl border border-white/10 hover:border-brand-blue/30 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles size={16} className="text-brand-blue" />
            <span>Plantillas</span>
          </button>
          <button
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-blue/20 transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Hábito</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="glass p-4 rounded-3xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-blue" />
            <h2 className="text-sm font-bold text-slate-100 capitalize">
              {format(selectedDateObj, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
            {isToday && (
              <span className="text-[10px] font-bold bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full border border-brand-blue/30">
                Hoy
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 glass rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
              title="Día anterior"
            >
              <ChevronLeft size={16} />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-bold text-brand-blue hover:underline"
              >
                Volver a hoy
              </button>
            )}
            <button
              onClick={() => navigateDate(1)}
              className="p-2 glass rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
              title="Día siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 7-Day Pill Buttons */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weekDays.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              className={cn(
                'py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all',
                d.isSelected
                  ? 'bg-brand-blue text-white font-extrabold shadow-md shadow-brand-blue/20 scale-105'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">{d.label}</span>
              <span className="text-sm font-black mt-0.5">{d.dayNum}</span>
              {d.isToday && (
                <div
                  className={cn(
                    'w-1 h-1 rounded-full mt-1',
                    d.isSelected ? 'bg-white' : 'bg-brand-blue'
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Progress Banner */}
      {dailyStats.totalCount > 0 && (
        <motion.div
          layout
          className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Progreso Diario
              </span>
              <h3 className="text-xl font-black text-slate-50 flex items-center gap-2">
                {dailyStats.completedCount} de {dailyStats.totalCount} hábitos
                <span className="text-sm font-extrabold text-brand-blue">({dailyStats.percentage}%)</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {dailyStats.isAllCompleted ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                  <Trophy size={16} />
                  <span>¡Día Perfecto!</span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-black text-xs">
                  {dailyStats.percentage}%
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyStats.percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full transition-all duration-300',
                dailyStats.percentage === 100
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30'
                  : 'bg-brand-blue shadow-lg shadow-brand-blue/30'
              )}
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            {dailyStats.percentage === 100
              ? 'Has completado todos tus compromisos de hoy. La disciplina es tu mayor ventaja competitiva.'
              : dailyStats.percentage >= 50
              ? '¡Más de la mitad completado! Mantén el impulso y remata el día con fuerza.'
              : 'Cada check diario refuerza tu identidad y hábitos a largo plazo.'}
          </p>
        </motion.div>
      )}

      {/* Habits List (Checklist) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Checklist de Hábitos ({habits.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Arrastra para reordenar tu día
          </span>
        </div>

        {habits.length === 0 ? (
          /* Empty State */
          <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mx-auto">
              <Target size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Aún no tienes hábitos registrados</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Configura tus checks diarios como NOPORN, pasos diarios, entrenar o estudiar para
                llevar un control riguroso de tu disciplina.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-blue/20 transition-all"
              >
                <Sparkles size={16} />
                <span>Activar Pack de Inicio Estoico</span>
              </button>
              <button
                onClick={() => {
                  setEditingHabit(null);
                  setIsModalOpen(true);
                }}
                className="glass px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white font-bold text-xs transition-colors"
              >
                Crear hábito manual
              </button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={habits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {habits.map((habit, index) => {
                  const isDue = dueHabitIds.has(habit.id);
                  const log = logsMap.get(habit.id);
                  const isCompleted = log?.completed ?? false;
                  const streak = calculateHabitStreak(habit, habitLogs, selectedDate);

                  return (
                    <SortableHabitItem
                      key={habit.id}
                      habit={habit}
                      index={index}
                      total={habits.length}
                      isDue={isDue}
                      isCompleted={isCompleted}
                      streak={streak.currentStreak}
                      notes={log?.notes}
                      onToggle={() => handleToggle(habit.id)}
                      onEdit={() => {
                        setEditingHabit(habit);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => deleteHabit(habit.id)}
                      onMoveUp={() => moveHabit(index, 'up')}
                      onMoveDown={() => moveHabit(index, 'down')}
                      onOpenNote={() => handleOpenNoteModal(habit)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        initialHabit={editingHabit}
        onSave={async (data) => {
          if (!user?.id) return;
          if (editingHabit) {
            await updateHabit(editingHabit.id, data);
          } else {
            await createHabit(user.id, data);
          }
        }}
      />

      <HabitTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        existingHabitNames={habits.map((h) => h.name)}
        onAddPresets={async (presetIds) => {
          if (user?.id) {
            await createPresetHabits(user.id, presetIds);
          }
        }}
      />

      {/* Note Modal */}
      {noteModalHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Nota para &quot;{noteModalHabit.name}&quot;
                </h3>
                <p className="text-xs text-slate-400">Micro-diario de cumplimiento diario</p>
              </div>
              <button
                onClick={() => setNoteModalHabit(null)}
                className="p-1.5 glass rounded-full text-slate-400 hover:text-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Ej: He leído 25 páginas del libro / Me costó resistir el impulso pero medité 5 minutos..."
              rows={4}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors resize-none"
            />

            <div className="flex gap-2.5">
              <button
                onClick={() => setNoteModalHabit(null)}
                className="flex-1 py-2.5 glass rounded-xl text-slate-400 font-bold text-xs hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-blue/20"
              >
                Guardar Nota
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Item Sortable del Checklist ───────────────────────────────
interface SortableHabitItemProps {
  key?: React.Key;
  habit: Habit;
  index: number;
  total: number;
  isDue: boolean;
  isCompleted: boolean;
  streak: number;
  notes?: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenNote: () => void;
}

function SortableHabitItem({
  habit,
  index,
  total,
  isDue,
  isCompleted,
  streak,
  notes,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenNote,
}: SortableHabitItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  const [showOptions, setShowOptions] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass rounded-2xl border transition-all relative overflow-hidden group select-none',
        isDragging && 'shadow-2xl border-brand-blue/50 opacity-90 scale-[1.02]',
        isCompleted
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : isDue
          ? 'border-white/5 hover:border-white/20'
          : 'border-white/5 opacity-60 bg-slate-900/30'
      )}
    >
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Drag handle & Checkbox */}
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            title="Arrastrar para ordenar"
          >
            <GripVertical size={16} />
          </button>

          {/* Satisfying Checkbox */}
          <button
            onClick={onToggle}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 shrink-0 relative overflow-hidden group/check',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                : 'border-white/20 bg-slate-900/60 hover:border-brand-blue/60 hover:bg-brand-blue/10'
            )}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Check size={18} strokeWidth={3} />
              </motion.div>
            )}
          </button>
        </div>

        {/* Habit Details */}
        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onToggle} role="button">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: habit.color }}
          >
            <HabitIcon name={habit.icon} size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  'font-extrabold text-sm sm:text-base leading-tight truncate transition-colors',
                  isCompleted ? 'text-slate-300 line-through decoration-emerald-400/50' : 'text-slate-50'
                )}
              >
                {habit.name}
              </h4>
              {!isDue && (
                <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md shrink-0">
                  Hoy no toca
                </span>
              )}
            </div>

            {habit.description && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{habit.description}</p>
            )}

            {notes && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400/90 mt-1 font-medium italic">
                <MessageSquare size={12} className="shrink-0" />
                <span className="truncate">&quot;{notes}&quot;</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Badges & Options */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak Badge */}
          {streak > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black shadow-sm"
              title={`Racha actual: ${streak} días seguidos`}
            >
              <Flame size={14} className="fill-orange-400" />
              <span>{streak}d</span>
            </div>
          )}

          {/* Quick Note Button */}
          <button
            onClick={onOpenNote}
            className={cn(
              'p-2 rounded-xl transition-colors',
              notes
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            )}
            title={notes ? 'Editar nota' : 'Añadir nota a este día'}
          >
            <MessageSquare size={16} />
          </button>

          {/* Options Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-slate-500 hover:text-slate-200 rounded-xl hover:bg-white/5 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown Menu */}
            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 mt-1 w-36 glass-dark rounded-2xl border border-white/10 shadow-2xl p-1.5 z-30 space-y-1">
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      onEdit();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 text-left"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        onMoveUp();
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 text-left"
                    >
                      <ChevronUp size={13} />
                      <span>Subir</span>
                    </button>
                  )}
                  {index < total - 1 && (
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        onMoveDown();
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 text-left"
                    >
                      <ChevronDown size={13} />
                      <span>Bajar</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      onDelete();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 text-left"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
