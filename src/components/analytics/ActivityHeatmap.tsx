import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Flame,
  Dumbbell,
  Clock,
  Zap,
  Activity,
  Info,
} from 'lucide-react';
import type { WorkoutSession, DailyHealth } from '../../infrastructure/supabase/types';
import { cn } from '../../lib/utils';

export type HeatmapMetric = 'volume' | 'effort' | 'duration' | 'sessions';
export type TimeRange = '3months' | '6months' | 'year';

interface ActivityHeatmapProps {
  sessions: WorkoutSession[];
  dailyHealth?: DailyHealth[];
  className?: string;
}

interface DayData {
  date: Date;
  dateStr: string;
  sessions: WorkoutSession[];
  totalVolume: number;
  totalDuration: number;
  maxEffort: number;
  sessionsCount: number;
  intensity: number;
}

export default function ActivityHeatmap({
  sessions,
  dailyHealth = [],
  className,
}: ActivityHeatmapProps) {
  const [metric, setMetric] = useState<HeatmapMetric>('volume');
  const [timeRange, setTimeRange] = useState<TimeRange>('3months');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Map sessions by date (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach((s) => {
      if (!s.started_at) return;
      try {
        let key = '';
        if (typeof s.started_at === 'string') {
          const match = s.started_at.match(/(\d{4}-\d{2}-\d{2})/);
          if (match) {
            key = match[1];
          } else {
            const d = new Date(s.started_at);
            if (!isNaN(d.getTime())) {
              key = format(d, 'yyyy-MM-dd');
            }
          }
        } else {
          const d = new Date(s.started_at);
          if (!isNaN(d.getTime())) {
            key = format(d, 'yyyy-MM-dd');
          }
        }
        if (key) {
          const list = map.get(key) || [];
          list.push(s);
          map.set(key, list);
        }
      } catch (e) {
        console.warn('Error parsing session date:', s.started_at, e);
      }
    });
    return map;
  }, [sessions]);

  // Compute maximums for relative scaling
  const { maxVolume, maxDuration } = useMemo(() => {
    let maxV = 0;
    let maxD = 0;
    sessionsByDate.forEach((daySessions) => {
      const vol = daySessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
      const dur = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      if (vol > maxV) maxV = vol;
      if (dur > maxD) maxD = dur;
    });
    return { maxVolume: maxV || 10000, maxDuration: maxD || 90 };
  }, [sessionsByDate]);

  // Calculate Grid Matrix
  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date();
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const numWeeks = timeRange === '3months' ? 13 : timeRange === '6months' ? 26 : 52;
    const start = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), numWeeks - 1);

    const allDays = eachDayOfInterval({ start, end });

    const weeksArr: DayData[][] = [];
    let currentWeek: DayData[] = [];

    let totalActiveDays = 0;
    let periodTotalVolume = 0;
    let periodTotalMinutes = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const months: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    allDays.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessionsByDate.get(dateStr) || [];
      const totalVolume = daySessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
      const totalDuration = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      const maxEffort = daySessions.reduce((acc, s) => Math.max(acc, s.perceived_difficulty || 0), 0);
      const sessionsCount = daySessions.length;

      if (sessionsCount > 0) {
        totalActiveDays++;
        periodTotalVolume += totalVolume;
        periodTotalMinutes += totalDuration;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      let intensity = 0;
      if (sessionsCount > 0) {
        if (metric === 'volume') {
          if (totalVolume <= 0) intensity = 1;
          else if (totalVolume <= maxVolume * 0.25) intensity = 1;
          else if (totalVolume <= maxVolume * 0.5) intensity = 2;
          else if (totalVolume <= maxVolume * 0.75) intensity = 3;
          else intensity = 4;
        } else if (metric === 'effort') {
          if (maxEffort <= 3) intensity = 1;
          else if (maxEffort <= 5) intensity = 2;
          else if (maxEffort <= 7) intensity = 3;
          else intensity = 4;
        } else if (metric === 'duration') {
          if (totalDuration <= 30) intensity = 1;
          else if (totalDuration <= 50) intensity = 2;
          else if (totalDuration <= 75) intensity = 3;
          else intensity = 4;
        } else if (metric === 'sessions') {
          intensity = Math.min(sessionsCount, 4);
        }
      }

      currentWeek.push({
        date: day,
        dateStr,
        sessions: daySessions,
        totalVolume,
        totalDuration,
        maxEffort,
        sessionsCount,
        intensity,
      });

      if (currentWeek.length === 7) {
        const weekIndex = weeksArr.length;
        const firstDayOfMonthInWeek = currentWeek.find((d) => d.date.getDate() <= 7);
        if (firstDayOfMonthInWeek) {
          const m = firstDayOfMonthInWeek.date.getMonth();
          if (m !== lastMonth) {
            months.push({
              name: format(firstDayOfMonthInWeek.date, 'MMM', { locale: es }),
              weekIndex,
            });
            lastMonth = m;
          }
        }

        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    return {
      weeks: weeksArr,
      monthLabels: months,
      stats: {
        totalActiveDays,
        periodTotalVolume,
        periodTotalMinutes,
        maxStreak,
        currentStreak: tempStreak,
      },
    };
  }, [sessionsByDate, timeRange, metric, maxVolume]);

  // Auto-scroll container to the right (latest active days) on mount or range change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [timeRange, weeks]);

  // Intensity color styling map
  const getCellColorClass = (intensity: number, isFuture: boolean) => {
    if (isFuture) return 'bg-slate-900/30 border-transparent opacity-30 cursor-not-allowed';
    switch (intensity) {
      case 1:
        return 'bg-emerald-950/90 border-emerald-800/60 hover:bg-emerald-900 hover:border-emerald-700 text-emerald-400';
      case 2:
        return 'bg-emerald-700/90 border-emerald-600/80 hover:bg-emerald-600 hover:border-emerald-500 text-emerald-200';
      case 3:
        return 'bg-emerald-500 border-emerald-400 hover:bg-emerald-400 shadow-xs shadow-emerald-500/30 text-white';
      case 4:
        return 'bg-emerald-400 border-emerald-300 hover:bg-emerald-300 shadow-sm shadow-emerald-400/50 text-slate-950 font-bold';
      case 0:
      default:
        return 'bg-slate-800/40 border-slate-700/30 hover:border-slate-500/60 hover:bg-slate-800/80';
    }
  };

  const today = new Date();

  return (
    <div className={cn('glass p-4 sm:p-5 rounded-3xl space-y-4 border border-white/5', className)}>
      {/* Header with Title and Range Switcher */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 leading-none">
                Matriz de Actividad
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Consistencia y sobrecarga
              </p>
            </div>
          </div>

          {/* Time Range Selector Chips */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shrink-0">
            {(['3months', '6months', 'year'] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                  timeRange === r
                    ? 'bg-emerald-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {r === '3months' ? '3 Meses' : r === '6months' ? '6 Meses' : '1 Año'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector Buttons - Clean & No Truncation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setMetric('volume')}
            className={cn(
              'px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
              metric === 'volume'
                ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Dumbbell size={12} className="shrink-0" />
            <span>Volumen (kg)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('effort')}
            className={cn(
              'px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
              metric === 'effort'
                ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Zap size={12} className="shrink-0" />
            <span>Esfuerzo RPE</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('duration')}
            className={cn(
              'px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
              metric === 'duration'
                ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Clock size={12} className="shrink-0" />
            <span>Minutos</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('sessions')}
            className={cn(
              'px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
              metric === 'sessions'
                ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Flame size={12} className="shrink-0" />
            <span>Sesiones</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar - Centered & Uniform Heights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-center h-16">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
            Días Activos
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-slate-100">{stats.totalActiveDays}</span>
            <span className="text-[10px] text-slate-400 font-bold">días</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-center h-16">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
            Racha Máxima
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-400">{stats.maxStreak}</span>
            <span className="text-[10px] text-slate-400 font-bold">días</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-center h-16">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
            Volumen Total
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-slate-100">
              {(stats.periodTotalVolume / 1000).toFixed(1)}t
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-center h-16">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
            Tiempo Total
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm sm:text-base font-black text-slate-100 whitespace-nowrap">
              {Math.floor(stats.periodTotalMinutes / 60)}h {stats.periodTotalMinutes % 60}m
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Canvas with Auto-Scroll */}
      <div
        ref={containerRef}
        className="overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent scroll-smooth"
      >
        <div className={cn(
          'space-y-1.5',
          timeRange === '3months' ? 'w-full min-w-[320px]' : 'min-w-[650px]'
        )}>
          {/* Months Header Line */}
          <div className="flex text-[10px] font-bold text-slate-400 pl-8 pr-1">
            {weeks.map((_, index) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === index);
              return (
                <div key={index} className="flex-1 text-left">
                  {monthLabel ? (
                    <span className="capitalize text-slate-300">{monthLabel.name}</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Grid Rows: 7 rows corresponding to Monday (0) to Sunday (6) */}
          <div className="flex gap-1.5">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 pr-1 select-none h-[116px] py-[2px]">
              <span className="leading-none">Lun</span>
              <span className="leading-none opacity-0">Mar</span>
              <span className="leading-none">Mié</span>
              <span className="leading-none opacity-0">Jue</span>
              <span className="leading-none">Vie</span>
              <span className="leading-none opacity-0">Sáb</span>
              <span className="leading-none opacity-0">Dom</span>
            </div>

            {/* Matrix Columns (Weeks) */}
            <div className="flex-1 flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex-1 flex flex-col gap-[3px]">
                  {week.map((dayData, dayIdx) => {
                    const isFuture = isAfter(dayData.date, today) && !isSameDay(dayData.date, today);
                    const isSelected = selectedDay && isSameDay(selectedDay.date, dayData.date);

                    return (
                      <button
                        key={dayIdx}
                        type="button"
                        disabled={isFuture}
                        onClick={() => setSelectedDay(dayData)}
                        onMouseEnter={() => !isFuture && setSelectedDay(dayData)}
                        className={cn(
                          'w-full aspect-square rounded-[3px] border transition-all duration-150 relative group cursor-pointer',
                          getCellColorClass(dayData.intensity, isFuture),
                          isSelected && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 z-10 scale-125'
                        )}
                        aria-label={`${format(dayData.date, 'PPP', { locale: es })}: ${dayData.sessionsCount} entrenamientos`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Details Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
        {/* Selected Day Details Panel */}
        <div className="flex items-center gap-2 text-slate-300 min-h-[24px]">
          {selectedDay ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-100 flex items-center gap-1 bg-slate-800/70 px-2 py-0.5 rounded-lg border border-slate-700/50">
                <CalendarIcon size={12} className="text-emerald-400" />
                {format(selectedDay.date, 'EEEE d MMMM', { locale: es })}
              </span>
              {selectedDay.sessionsCount > 0 ? (
                <>
                  <span className="text-emerald-400 font-bold">
                    {selectedDay.sessionsCount} {selectedDay.sessionsCount === 1 ? 'sesión' : 'sesiones'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>{selectedDay.totalVolume.toLocaleString()} kg</span>
                  <span className="text-slate-400">•</span>
                  <span>{selectedDay.totalDuration} min</span>
                  {selectedDay.maxEffort > 0 && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-amber-400 font-medium">RPE {selectedDay.maxEffort}/10</span>
                    </>
                  )}
                  {selectedDay.sessions.length > 0 && (
                    <span className="text-slate-400 italic text-[11px]">
                      ({selectedDay.sessions.map((s) => s.name).join(', ')})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400 italic text-[11px]">Día de descanso sin registro de sesión</span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Info size={13} className="text-slate-400 shrink-0" />
              Toca un día para ver sus detalles.
            </span>
          )}
        </div>

        {/* Legend Scale */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span>Menos</span>
          <div className="flex gap-[3px]">
            <div className="w-3 h-3 rounded-[2px] bg-slate-800/40 border border-slate-700/30" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-950/90 border border-emerald-800/60" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-700/90 border border-emerald-600/80" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-500 border border-emerald-400" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" />
          </div>
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
