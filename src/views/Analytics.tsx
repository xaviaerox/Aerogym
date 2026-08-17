import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  TrendingUp,
  Calendar,
  Activity,
  Dumbbell,
  Scale,
  Plus,
  Sparkles,
  Trophy,
  Zap,
  Check,
  X,
  Footprints,
  HeartPulse,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useAuthStore } from '../application/stores/useAuthStore';
import { calculateLocalInsights } from '../lib/insightsEngine';
import { cn } from '../lib/utils';
import { strengthScoreEngine } from '../lib/strengthScoreEngine';
import { calculateE1RM } from '../lib/math/formulas';
import { BASE_EXERCISES } from '../constants/exercises';
import { calculateMuscleFatigue } from '../lib/fatigueEngine';
import BodyFatigueVisualizer from '../components/health/BodyFatigueVisualizer';
import VolumeChartCard from '../components/analytics/VolumeChartCard';
import HealthTrendsCard from '../components/analytics/HealthTrendsCard';
import AddBodyMeasurementModal from '../components/analytics/AddBodyMeasurementModal';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';

type TimeFilter = 'week' | 'month' | 'all';
type ViewTab = 'performance' | 'health' | 'composition';

export default function Analytics() {
  const { sessions, workoutSetsHistory } = useWorkoutStore();
  const { dailyHealth, todayHealth, measurements, addMeasurement } = useHealthStore();
  const { user, profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ViewTab>('performance');
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Calcular informe de fatiga muscular
  const fatigueReport = useMemo(() => {
    return calculateMuscleFatigue(sessions, workoutSetsHistory);
  }, [sessions, workoutSetsHistory]);

  // Calcular insights de IA locales
  const localInsights = useMemo(() => {
    return calculateLocalInsights(sessions, dailyHealth);
  }, [sessions, dailyHealth]);

  // Filtrar sesiones según el rango de tiempo seleccionado
  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].reverse();
    if (filter === 'week') return sorted.slice(-7);
    if (filter === 'month') return sorted.slice(-30);
    return sorted;
  }, [sessions, filter]);

  // Datos de volumen para Recharts
  const volumeData = filteredSessions.map((s) => ({
    name: format(new Date(s.started_at), 'dd/MM', { locale: es }),
    vol: s.total_volume_kg || 0,
  }));

  // 1. Cálculo de Volumen de los últimos 7 días vs los 7 días anteriores
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);

  const thisWeekSessions = useMemo(
    () => sessions.filter((s) => new Date(s.started_at) >= weekAgo),
    [sessions, weekAgo]
  );
  const prevWeekSessions = useMemo(
    () => sessions.filter((s) => {
      const d = new Date(s.started_at);
      return d >= twoWeeksAgo && d < weekAgo;
    }),
    [sessions, twoWeeksAgo, weekAgo]
  );

  const thisWeekVol = thisWeekSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
  const prevWeekVol = prevWeekSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);

  const volDeltaPct = prevWeekVol > 0
    ? Math.round(((thisWeekVol - prevWeekVol) / prevWeekVol) * 100)
    : thisWeekVol > 0
    ? 100
    : 0;

  // 2. Series Efectivas Totales (7 días)
  const recentSets = useMemo(
    () => workoutSetsHistory.filter((s) => s.is_completed && new Date(s.logged_at || Date.now()) >= weekAgo),
    [workoutSetsHistory, weekAgo]
  );
  const totalEffectiveSets7d = recentSets.length;

  // 3. Distribución por Grupo Muscular (7d)
  const muscleDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    recentSets.forEach((set) => {
      const ex = BASE_EXERCISES.find((e) => e.id === set.exercise_id);
      const group = ex?.muscleGroup || 'Otros';
      counts.set(group, (counts.get(group) || 0) + 1);
    });
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(counts.entries())
      .map(([group, count]) => ({
        group,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [recentSets]);

  // 4. Conteo de Récords Personales (30d)
  const thirtyDaysAgo = subDays(now, 30);
  const recentPRs30d = useMemo(
    () => workoutSetsHistory.filter((s) => s.is_completed && s.is_pr && new Date(s.logged_at || Date.now()) >= thirtyDaysAgo).length,
    [workoutSetsHistory, thirtyDaysAgo]
  );

  // Coeficiente de Fuerza Relativa DOTS
  const dotsScore = useMemo(() => {
    const maxE1RMByExercise = new Map<string, number>();

    workoutSetsHistory.forEach((s) => {
      if (!s.is_completed || !s.weight_kg || !s.reps) return;
      const e1rm = calculateE1RM(Number(s.weight_kg), Number(s.reps));
      const currentMax = maxE1RMByExercise.get(s.exercise_id) || 0;
      if (e1rm > currentMax) {
        maxE1RMByExercise.set(s.exercise_id, e1rm);
      }
    });

    const topE1RMs = Array.from(maxE1RMByExercise.values())
      .sort((a, b) => b - a)
      .slice(0, 3);

    const totalLiftedKg = topE1RMs.reduce((sum, val) => sum + val, 0);
    const bw = Number(profile?.weight_kg) || 70;
    const gender = (profile?.gender as 'male' | 'female') || 'male';

    return strengthScoreEngine.calculateDots(totalLiftedKg, bw, gender);
  }, [workoutSetsHistory, profile]);

  // 5. Readiness Engine (Score & factores)
  const readiness = useMemo(() => {
    let score = 80;
    const factors: string[] = [];

    const sleepHours = todayHealth?.sleep_hours || 0;
    if (sleepHours > 0) {
      if (sleepHours >= 8) {
        score += 15;
        factors.push(`Descanso reparador óptimo: ${sleepHours}h (+15%)`);
      } else if (sleepHours >= 7) {
        score += 8;
        factors.push(`Sueño adecuado: ${sleepHours}h (+8%)`);
      } else if (sleepHours < 6) {
        const penalty = Math.min(25, (6.5 - sleepHours) * 12);
        score -= penalty;
        factors.push(`Descanso insuficiente: ${sleepHours}h (-${Math.round(penalty)}%)`);
      }
    } else {
      factors.push('Sueño no registrado hoy (cálculo neutral)');
    }

    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');
    const yesterdayHealth = dailyHealth.find(d => d.date === yesterdayStr);
    const trainedYesterday = sessions.some(s => s.started_at.split('T')[0] === yesterdayStr);

    if (yesterdayHealth?.steps) {
      const stepsCount = yesterdayHealth.steps;
      if (stepsCount > 15000) {
        score -= 15;
        factors.push(`Fatiga cardiovascular por caminata de ayer: ${stepsCount.toLocaleString()} pasos (-15%)`);
      } else if (stepsCount > 11000) {
        score -= 8;
        factors.push(`Actividad física alta ayer: ${stepsCount.toLocaleString()} pasos (-8%)`);
      }
    }

    if (trainedYesterday) {
      const yesterdayWorkout = sessions.find(s => s.started_at.split('T')[0] === yesterdayStr);
      const diff = yesterdayWorkout?.perceived_difficulty || 6;
      const penalty = diff >= 8 ? 15 : 10;
      score -= penalty;
      factors.push(`Entrenamiento de ayer: "${yesterdayWorkout?.name || 'Musculación'}" (Dificultad: ${diff}/10) (-${penalty}%)`);
    }

    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    let status = 'Bueno';
    let colorClass = 'text-brand-green border-brand-green/30 bg-brand-green/10';
    if (finalScore >= 85) {
      status = 'Excelente';
      colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    } else if (finalScore < 70 && finalScore >= 50) {
      status = 'Moderado';
      colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else if (finalScore < 50) {
      status = 'Bajo (Descanso sugerido)';
      colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }

    return {
      score: finalScore,
      status,
      colorClass,
      factors
    };
  }, [todayHealth, dailyHealth, sessions]);

  // Consistencia de los últimos 7 días
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(now, 6 - i);
      const dayStr = format(d, 'yyyy-MM-dd');
      const daySessions = sessions.filter((s) => s.started_at.startsWith(dayStr));
      const volKg = daySessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);

      return {
        name: format(d, 'EEE', { locale: es }),
        fullDate: dayStr,
        count: daySessions.length,
        volKg,
      };
    });
  }, [sessions]);

  // Promedio de sueño (7d)
  const avgSleep7d = useMemo(() => {
    const recentHealth = dailyHealth.slice(-7);
    if (!recentHealth.length) return 0;
    const total = recentHealth.reduce((acc, curr) => acc + (curr.sleep_hours || 0), 0);
    return Math.round((total / recentHealth.length) * 10) / 10;
  }, [dailyHealth]);

  // Pasos máximos
  const healthWithSteps = dailyHealth.filter((d) => d.steps && d.steps > 0);
  const maxSteps = healthWithSteps.length > 0 ? Math.max(...healthWithSteps.map((d) => d.steps || 0)) : 10000;

  // Datos para gráficos de composición corporal
  const compositionData = useMemo(() => {
    return [...measurements]
      .reverse()
      .map((m) => ({
        date: format(new Date(m.measured_at), 'dd/MM', { locale: es }),
        weight: m.weight_kg,
        fat: m.body_fat_pct || null,
        waist: m.waist_cm || null,
        arm: m.arm_cm || null,
        leg: m.leg_cm || null,
      }));
  }, [measurements]);

  const handleSaveMeasurement = async (data: any) => {
    if (!user?.id) return;
    await addMeasurement(user.id, data);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* ── Integrated Sleek Top Header Bar ─────────────────────────────── */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl pt-2 pb-3 z-30 border-b border-white/5 space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center border border-brand-blue/20">
              <TrendingUp size={18} />
            </div>
            <h1 className="text-lg font-black text-slate-100 tracking-tight">Estadísticas & Progreso</h1>
          </div>

          {activeTab === 'performance' ? (
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/5">
              {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                    filter === f ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-black' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
                </button>
              ))}
            </div>
          ) : activeTab === 'composition' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-blue/90 cursor-pointer shadow-md"
            >
              <Plus size={14} />
              Métricas
            </button>
          ) : null}
        </div>

        {/* Sleek Segmented Tab Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('performance')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'performance'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Zap size={14} />
            <span>Rendimiento</span>
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'health'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <HeartPulse size={14} />
            <span>Recuperación</span>
          </button>
          <button
            onClick={() => setActiveTab('composition')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'composition'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Scale size={14} />
            <span>Composición</span>
          </button>
        </div>
      </div>

      {/* ── RENDIMIENTO TAB ────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Hero Cards Grid - Clean Labels without Ellipsis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Volumen 7d */}
            <div className="glass p-3.5 rounded-3xl border border-white/5 space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider whitespace-nowrap">Volumen 7d</span>
                {volDeltaPct !== 0 && (
                  <span className={cn(
                    'text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5',
                    volDeltaPct > 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  )}>
                    {volDeltaPct > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {volDeltaPct > 0 ? `+${volDeltaPct}%` : `${volDeltaPct}%`}
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">
                {(thisWeekVol / 1000).toFixed(1)}<span className="text-xs font-bold text-brand-blue">t</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">vs 7 días anteriores</p>
            </div>

            {/* Series Efectivas */}
            <div className="glass p-3.5 rounded-3xl border border-white/5 space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider whitespace-nowrap">Series (7d)</span>
                <Zap size={13} className="text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">{totalEffectiveSets7d}</p>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">series efectivas</p>
            </div>

            {/* Nuevos PRs */}
            <div className="glass p-3.5 rounded-3xl border border-white/5 space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider whitespace-nowrap">Nuevos PRs</span>
                <Trophy size={13} className="text-amber-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">{recentPRs30d}</p>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">últimos 30 días</p>
            </div>

            {/* DOTS Score Quick */}
            <div className="glass p-3.5 rounded-3xl border border-brand-blue/20 bg-brand-blue/5 space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-brand-blue uppercase font-bold tracking-wider whitespace-nowrap">Fuerza DOTS</span>
                <Award size={13} className="text-brand-blue" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">{dotsScore.dotsPoints}</p>
              <p className="text-[10px] text-brand-green font-bold whitespace-nowrap">{dotsScore.strengthCategory}</p>
            </div>
          </div>

          {/* DOTS Relative Strength Card Detailed */}
          <div className="glass border border-brand-blue/20 bg-gradient-to-r from-brand-blue/10 via-slate-900/60 to-slate-900/80 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30 shrink-0 shadow-inner">
                <Trophy size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-brand-blue block">Coeficiente de Fuerza Relativa (DOTS)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-50">{dotsScore.dotsPoints} pts</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {dotsScore.strengthCategory}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                {dotsScore.percentileText}
              </span>
              <div className="w-full sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (dotsScore.dotsPoints / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matriz de Calor de Actividad */}
          <ActivityHeatmap sessions={sessions} dailyHealth={dailyHealth} />

          {/* Distribución por Grupo Muscular */}
          {muscleDistribution.length > 0 && (
            <div className="glass p-5 rounded-3xl space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-brand-blue" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Distribución por Grupo Muscular (7d)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {totalEffectiveSets7d} series totales
                </span>
              </div>

              <div className="space-y-2.5">
                {muscleDistribution.map(({ group, count, pct }) => (
                  <div key={group} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-300 font-semibold">{group}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{count} series ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IA Insights Widget */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Sparkles size={16} className="text-brand-blue" /> IA Insights & Correlaciones
            </h2>
            <div className="space-y-2.5">
              {localInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "glass p-4 sm:p-5 rounded-3xl border flex gap-3.5 items-start",
                    insight.impactLevel === 'positive'
                      ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                      : insight.impactLevel === 'negative'
                      ? "border-rose-500/15 bg-rose-500/[0.02]"
                      : "border-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                      insight.impactLevel === 'positive'
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : insight.impactLevel === 'negative'
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-white/5 text-slate-400 border border-white/5"
                    )}
                  >
                    <Activity size={18} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-slate-100 text-sm">{insight.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Volumen Chart */}
          {volumeData.length > 0 ? (
            <VolumeChartCard volumeData={volumeData} />
          ) : (
            <div className="glass p-12 rounded-3xl text-center text-slate-500 italic text-sm border border-white/5 space-y-2">
              <Dumbbell size={32} className="mx-auto text-slate-600" />
              <p className="font-bold text-slate-400">Sin historial suficiente</p>
              <p className="text-xs text-slate-600">Registra entrenamientos para ver tu gráfico de sobrecarga progresiva</p>
            </div>
          )}
        </div>
      )}

      {/* ── SALUD & RECUPERACIÓN TAB ────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Readiness Score Card & Diagnostic Trigger */}
          <div
            onClick={() => setIsDiagnosticOpen(true)}
            className="glass border border-brand-green/20 bg-gradient-to-r from-brand-green/10 via-slate-900/80 to-slate-900/90 p-5 rounded-3xl flex items-center justify-between shadow-xl cursor-pointer hover:border-brand-green/40 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/20 flex items-center justify-center text-brand-green border border-brand-green/30 shrink-0 shadow-inner">
                <HeartPulse size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-brand-green block">Estado de Recuperación (Readiness)</span>
                <p className="text-2xl font-black text-slate-50">{readiness.score}% <span className="text-xs font-bold text-brand-green">· {readiness.status}</span></p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-3 py-1.5 rounded-xl border border-brand-green/20 uppercase tracking-wider shrink-0">
              Ver Diagnóstico
            </span>
          </div>

          {/* Muscle Fatigue & Deload Engine */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between px-1">
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-brand-green" /> Fatiga Muscular & Deload Engine
              </span>
              <span className={cn(
                'text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider',
                fatigueReport.isDeloadRecommended ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-brand-green/20 text-brand-green border border-brand-green/30'
              )}>
                {fatigueReport.isDeloadRecommended ? 'Descarga Recomendada' : 'Fatiga Balanceada'}
              </span>
            </h2>

            <p className="text-xs text-slate-300 font-medium px-1 leading-relaxed">
              {fatigueReport.recommendation}
            </p>

            <BodyFatigueVisualizer
              muscleFatigueList={fatigueReport.muscleFatigueList}
              overallFatiguePercent={fatigueReport.overallFatiguePercent}
            />
          </section>

          {/* Consistencia Semanal */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={16} className="text-orange-400" /> Consistencia (7 días)
              </h2>
              <span className="text-[10px] font-mono font-extrabold text-orange-400">
                {thisWeekSessions.length} / 7 días activos
              </span>
            </div>

            <div className="h-44 glass p-4 rounded-3xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', color: '#f8fafc' }}
                    formatter={(val: number, _name: string, props: any) => [
                      `${val} sesión(es) (${props.payload.volKg.toLocaleString()} kg)`,
                      'Entrenamiento',
                    ]}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Salud y Tendencias */}
          {dailyHealth.length > 0 && (
            <section className="space-y-4">
              <HealthTrendsCard
                dailyHealth={dailyHealth}
                avgSleep={avgSleep7d}
                maxSteps={maxSteps}
              />

              {healthWithSteps.length > 1 && (
                <div className="glass p-5 rounded-3xl space-y-3 border border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Footprints size={16} className="text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Histórico de Pasos (14d)</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Obj: 10.000 pasos</span>
                  </div>

                  <div className="h-44 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...healthWithSteps].reverse().slice(-14)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => format(new Date(d), 'dd/MM')}
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          labelFormatter={(d) => format(new Date(d), 'PPPP', { locale: es })}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', color: '#f8fafc' }}
                          formatter={(v) => [`${Number(v).toLocaleString()} pasos`, 'Actividad']}
                        />
                        <ReferenceLine y={10000} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                        <Bar dataKey="steps" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ── COMPOSICIÓN TAB ────────────────────────────────────────── */}
      {activeTab === 'composition' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {compositionData.length > 0 ? (
            <>
              {/* Peso & Grasa Chart */}
              <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Scale size={16} className="text-rose-400" /> Peso Corporal e Índice de Grasa
                </h2>
                <div className="h-64 glass p-4 rounded-3xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={compositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#f8fafc' }}
                      />
                      <Area type="monotone" dataKey="weight" name="Peso (kg)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" dot={{ fill: '#f43f5e', r: 3 }} />
                      <Line type="monotone" dataKey="fat" name="Grasa (%)" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Medidas de Contornos Chart */}
              <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Activity size={16} className="text-brand-blue" /> Contornos y Medidas (cm)
                </h2>
                <div className="h-56 glass p-4 rounded-3xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={compositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#f8fafc' }}
                      />
                      <Line type="monotone" dataKey="waist" name="Cintura" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 2 }} />
                      <Line type="monotone" dataKey="arm" name="Brazo" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 2 }} />
                      <Line type="monotone" dataKey="leg" name="Muslo" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Historial en formato lista */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Historial de Medidas</h3>
                <div className="space-y-2">
                  {[...measurements].slice(0, 5).map((m) => (
                    <div key={m.id} className="glass p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-50">{m.weight_kg} kg</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          {format(new Date(m.measured_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-400 font-bold">
                        {m.body_fat_pct && <span>Grasa: {m.body_fat_pct}%</span>}
                        {m.waist_cm && <span>Cintura: {m.waist_cm}cm</span>}
                        {m.arm_cm && <span>Brazo: {m.arm_cm}cm</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="glass p-12 rounded-3xl text-center space-y-4 border border-white/5">
              <Scale size={40} className="text-slate-600 mx-auto" />
              <div>
                <p className="text-slate-400 font-bold">Sin medidas registradas</p>
                <p className="text-slate-600 text-xs mt-1">Sigue la evolución de tu composición corporal registrando tu peso y contornos</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="py-3 px-6 bg-brand-blue text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-md"
              >
                + Registrar Primera Medida
              </button>
            </div>
          )}
        </div>
      )}

      {/* READINESS DIAGNOSTIC MODAL */}
      <AnimatePresence>
        {isDiagnosticOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity size={20} className="text-brand-green" />
                    Readiness Diagnóstico
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Factores de preparación de hoy</p>
                </div>
                <button
                  onClick={() => setIsDiagnosticOpen(false)}
                  className="p-2 glass rounded-full text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className={cn("text-5xl font-black px-6 py-4 rounded-3xl border", readiness.colorClass)}>
                  {readiness.score}%
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-300 mt-2">{readiness.status}</div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Factores Calculados</h4>
                {readiness.factors.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay suficientes datos registrados hoy. Registra tus horas de sueño o peso corporal para un análisis preciso.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {readiness.factors.map((f, i) => (
                      <div key={i} className="flex gap-2.5 items-start text-xs p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <Check size={14} className="text-brand-blue mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 leading-normal font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsDiagnosticOpen(false)}
                className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                Cerrar diagnóstico
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE REGISTRO DE MEDIDAS */}
      <AddBodyMeasurementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeasurement}
      />
    </div>
  );
}
