import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronRight, Flame, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useHabitStore } from '../../application/stores/useHabitStore';
import { useAuthStore } from '../../application/stores/useAuthStore';
import {
  calculateDailyStats,
  calculateHabitStreak,
  formatDateString,
} from '../../lib/habitsEngine';
import HabitIcon from '../habits/HabitIcon';
import { cn } from '../../lib/utils';

interface DailyHabitsWidgetProps {
  onOpenHabits: () => void;
}

export default function DailyHabitsWidget({ onOpenHabits }: DailyHabitsWidgetProps) {
  const { user } = useAuthStore();
  const { habits, habitLogs, toggleHabitLog } = useHabitStore();

  const todayStr = useMemo(() => formatDateString(new Date()), []);

  const stats = useMemo(() => {
    return calculateDailyStats(habits, habitLogs, todayStr);
  }, [habits, habitLogs, todayStr]);

  const completedMap = useMemo(() => {
    const set = new Set<string>();
    habitLogs.forEach((l) => {
      if (l.date === todayStr && l.completed) {
        set.add(l.habit_id);
      }
    });
    return set;
  }, [habitLogs, todayStr]);

  const handleToggle = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    const currentLog = habitLogs.find((l) => l.habit_id === habitId && l.date === todayStr);
    toggleHabitLog(user.id, habitId, todayStr, currentLog?.notes);
  };

  if (habits.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-brand-blue" />
            Hábitos de Hoy
          </h2>
        </div>
        <div
          onClick={onOpenHabits}
          className="glass p-5 rounded-3xl border border-white/5 hover:border-brand-blue/30 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-brand-blue transition-colors">
                Configurar tus hábitos diarios
              </h3>
              <p className="text-xs text-slate-400">
                Define tus checks: NOPORN, pasos, entreno o estudio
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            <ChevronRight size={16} />
          </div>
        </div>
      </section>
    );
  }

  // Si no hay hábitos programados para hoy
  if (stats.dueHabits.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-brand-blue" />
            Hábitos de Hoy
          </h2>
          <button
            onClick={onOpenHabits}
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="glass p-4 rounded-3xl border border-white/5 text-center text-xs text-slate-400">
          No tienes hábitos programados para hoy. ¡Día libre o de recuperación!
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-brand-blue" />
            Hábitos de Hoy
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue border border-brand-blue/20">
            {stats.completedCount}/{stats.totalCount} ({stats.percentage}%)
          </span>
        </div>

        <button
          onClick={onOpenHabits}
          className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
        >
          <span>Gestionar</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="glass p-4 rounded-3xl border border-white/5 space-y-3">
        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              stats.percentage === 100 ? 'bg-emerald-400' : 'bg-brand-blue'
            )}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        {/* Habit Check Items */}
        <div className="space-y-2">
          {stats.dueHabits.slice(0, 5).map((habit) => {
            const isCompleted = completedMap.has(habit.id);
            const streak = calculateHabitStreak(habit, habitLogs, todayStr);

            return (
              <div
                key={habit.id}
                onClick={(e) => handleToggle(e, habit.id)}
                className={cn(
                  'p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none group',
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/5 glass hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center border transition-all shrink-0',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'border-white/20 bg-slate-900 group-hover:border-brand-blue/50'
                    )}
                  >
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: habit.color }}
                  >
                    <HabitIcon name={habit.icon} size={16} />
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold truncate transition-colors',
                      isCompleted ? 'text-slate-400 line-through decoration-emerald-400/40' : 'text-slate-100'
                    )}
                  >
                    {habit.name}
                  </span>
                </div>

                {streak.currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-[11px] font-black text-orange-400 shrink-0 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    <Flame size={12} className="fill-orange-400" />
                    <span>{streak.currentStreak}d</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {stats.dueHabits.length > 5 && (
          <button
            onClick={onOpenHabits}
            className="w-full py-2 text-center text-[11px] font-bold text-slate-400 hover:text-slate-200"
          >
            + {stats.dueHabits.length - 5} hábitos más. Pulsa para ver todos.
          </button>
        )}
      </div>
    </section>
  );
}
