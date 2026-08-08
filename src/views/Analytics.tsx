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
import { format, subDays, isSameDay } from 'date-fns';
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
  Moon,
  Footprints,
  HeartPulse,
} from 'lucide-react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useAuthStore } from '../application/stores/useAuthStore';
import { calculateLocalInsights } from '../lib/insightsEngine';
import { cn } from '../lib/utils';
import { strengthScoreEngine } from '../lib/strengthScoreEngine';
import { calculateE1RM } from '../lib/math/formulas';

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

  // Calcular informe de fatiga muscular (Analytics 2.0)
  const fatigueReport = useMemo(() => {
    return calculateMuscleFatigue(sessions, workoutSetsHistory);
  }, [sessions, workoutSetsHistory]);

  // Calcular insights de IA locales
  const localInsights = useMemo(() => {
    return calculateLocalInsights(sessions, dailyHealth);
  }, [sessions, dailyHealth]);

  // Filtrar sesiones según el rango de tiempo seleccionado
  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].reverse(); // De más antiguo a más reciente
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

  // 3. Conteo de Récords Personales (30d)
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

  // Readiness Score
  const readiness = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayHealth = dailyHealth.find(h => h.date === yesterdayStr);

    const trainedYesterday = sessions.some(s => {
      const sDate = s.started_at.split('T')[0];
      return sDate === yesterdayStr;
    });

    let score = 70;
    const factors: string[] = [];

    if (todayHealth?.sleep_hours) {
      const hrs = Number(todayHealth.sleep_hours);
      if (hrs >= 7 && hrs <= 9) {
        score += 12;
        factors.push('Horas de sueño óptimas (+12%)');
      } else if (hrs < 6.5) {
        const penalty = Math.max(10, (6.5 - hrs) * 15);
        score -= penalty;
        factors.push(`Sueño insuficiente: ${hrs}h (-${Math.round(penalty)}%)`);
      } else if (hrs > 9.5) {
        score -= 5;
        factors.push('Sueño prolongado / hipersomnia (-5%)');
      }
      
      if (todayHealth.sleep_quality) {
        if (todayHealth.sleep_quality >= 4) {
          score += 8;
          factors.push('Calidad de sueño regeneradora (+8%)');
        } else if (todayHealth.sleep_quality <= 2) {
          score -= 15;
          factors.push('Calidad de sueño baja / sueño ligero (-15%)');
        }
      }
    } else {
      factors.push('Sueño no registrado hoy (cálculo neutral)');
    }

    if (yesterdayHealth?.steps) {
      const stepsCount = yesterdayHealth.steps;
      if (stepsCount > 15000) {
        score -= 15;
        factors.push(`Fatiga cardiovascular por caminata de ayer: ${stepsCount.toLocaleString()} pasos (-15%)`);
      } else if (stepsCount > 11000) {
        score -= 8;
        factors.push(`Actividad física alta ayer: ${stepsCount.toLocaleString()} pasos (-8%)`);
      } else if (stepsCount >= 6000 && stepsCount <= 10000) {
        score += 5;
        factors.push('Nivel de pasos saludable ayer (+5%)');
      }
    }

    if (trainedYesterday) {
      const yesterdayWorkout = sessions.find(s => s.started_at.split('T')[0] === yesterdayStr);
      const diff = yesterdayWorkout?.perceived_difficulty || 6;
      const penalty = diff >= 8 ? 15 : 10;
      score -= penalty;
      factors.push(`Entrenamiento de ayer: "${yesterdayWorkout?.name || 'Musculación'}" (Dificultad: ${diff}/10) (-${penalty}%)`);
    }

    if (todayHealth?.energy_level) {
      const energy = todayHealth.energy_level;
      if (energy >= 8) {
        score += 10;
        factors.push(`Estado de ánimo y energía excelente: ${energy}/10 (+10%)`);
      } else if (energy <= 4) {
        const penalty = (5 - energy) * 8;
        score -= penalty;
        factors.push(`Sensación de fatiga física: ${energy}/10 (-${penalty}%)`);
      }
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

  // Consistencia de los últimos 7 días con volumen por día
  const last7Days = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = subDays(new Date(), i);
      const daySessions = sessions.filter((s) => isSameDay(new Date(s.started_at), d));
      const count = daySessions.length;
      const vol = daySessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
      return {
        name: format(d, 'eee', { locale: es }).toUpperCase(),
        count,
        volKg: vol,
      };
    }).reverse();
  }, [sessions]);

  // Estadísticas generales de salud
  const healthWithSteps = dailyHealth.filter((h) => h.steps > 0);
  const healthWithSleep = dailyHealth.filter((h) => h.sleep_hours);

  const avgSleep7d = healthWithSleep.length > 0
    ? healthWithSleep.slice(-7).reduce((acc, h) => acc + (h.sleep_hours || 0), 0) / Math.min(7, healthWithSleep.length)
    : 0;

  const maxSteps = healthWithSteps.length > 0 ? Math.max(...healthWithSteps.map((h) => h.steps)) : 0;

  // Mapear medidas corporales cronológicamente para Recharts
  const compositionData = useMemo(() => {
    return [...measurements]
      .reverse()
      .map((m) => ({
        date: format(new Date(m.measured_at), 'dd/MM', { locale: es }),
        dateFull: m.measured_at,
        weight: m.weight_kg ? Number(m.weight_kg) : null,
        fat: m.body_fat_pct ? Number(m.body_fat_pct) : null,
        waist: m.waist_cm ? Number(m.waist_cm) : null,
        arm: m.arm_cm ? Number(m.arm_cm) : null,
        leg: m.leg_cm ? Number(m.leg_cm) : null,
      }));
  }, [measurements]);

  const handleSaveMeasurement = async (data: any) => {
    if (!user?.id) return;
    await addMeasurement(user.id, data);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Tab Navigation header (3 Categorías Claras) */}
      <div className="flex flex-col gap-3 sticky top-0 bg-slate-900/90 backdrop-blur-md pt-2 pb-4 z-30">
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('performance')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center',
              activeTab === 'performance' ? 'bg-brand-blue text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Rendimiento
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center',
              activeTab === 'health' ? 'bg-brand-blue text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Salud & Recuperación
          </button>
          <button
            onClick={() => setActiveTab('composition')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center',
              activeTab === 'composition' ? 'bg-brand-blue text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Composición
          </button>
        </div>

        {/* Sub-header Controls */}
        <div className="flex justify-between items-center px-1">
          <h1 className="text-xl font-black text-slate-100">
            {activeTab === 'performance' && 'Rendimiento & Fuerza'}
            {activeTab === 'health' && 'Salud & Recuperación'}
            {activeTab === 'composition' && 'Composición Corporal'}
          </h1>
          {activeTab === 'performance' ? (
            <div className="flex bg-slate-800/85 p-1 rounded-xl border border-white/5">
              {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                    filter === f ? 'bg-white/10 text-brand-blue' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
                </button>
              ))}
            </div>
          ) : activeTab === 'composition' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-blue/90"
            >
              <Plus size={14} />
              Métricas
            </button>
          ) : null}
        </div>
      </div>

      {/* ── RENDIMIENTO TAB ────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Matriz de Calor de Actividad */}
          <ActivityHeatmap sessions={sessions} dailyHealth={dailyHealth} />

          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass p-4 rounded-3xl border border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Volumen (7d)</p>
                {volDeltaPct !== 0 && (
                  <span className={cn(
                    'text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono',
                    volDeltaPct > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  )}>
                    {volDeltaPct > 0 ? `+${volDeltaPct}%` : `${volDeltaPct}%`}
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-brand-blue">
                {(thisWeekVol / 1000).toFixed(1)}t
              </p>
              <p className="text-[9px] text-slate-400 truncate font-medium">vs sem. anterior</p>
            </div>

            <div className="glass p-4 rounded-3xl border border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Series (7d)</p>
                <Zap size={12} className="text-brand-green" />
              </div>
              <p className="text-xl font-black text-brand-green">{totalEffectiveSets7d}</p>
              <p className="text-[9px] text-slate-400 truncate font-medium">series efectivas</p>
            </div>

            <div className="glass p-4 rounded-3xl border border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Nuevos PRs</p>
                <Trophy size={12} className="text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-400">{recentPRs30d}</p>
              <p className="text-[9px] text-slate-400 truncate font-medium">últimos 30 días</p>
            </div>
          </div>

          {/* DOTS Relative Strength Card */}
          <div className="glass border border-brand-blue/20 bg-brand-blue/5 p-5 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30 flex-shrink-0">
                <Trophy size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-brand-blue">Coeficiente de Fuerza Relativa (DOTS)</p>
                <p className="text-xl font-black text-slate-50">{dotsScore.dotsPoints} pts <span className="text-xs font-bold text-brand-green">· {dotsScore.strengthCategory}</span></p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right max-w-[100px] leading-tight">
              {dotsScore.percentileText}
            </span>
          </div>

          {/* IA Insights Widget */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Sparkles size={16} className="text-brand-blue" /> IA Insights & Correlaciones
            </h2>
            <div className="space-y-2.5">
              {localInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "glass p-5 rounded-3xl border flex gap-4 items-start",
                    insight.impactLevel === 'positive'
                      ? "border-emerald-500/10 bg-emerald-500/[0.01]"
                      : insight.impactLevel === 'negative'
                      ? "border-rose-500/10 bg-rose-500/[0.01]"
                      : "border-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                      insight.impactLevel === 'positive'
                        ? "bg-emerald-500/10 text-emerald-400"
                        : insight.impactLevel === 'negative'
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-white/5 text-slate-400"
                    )}
                  >
                    <Activity size={20} />
                  </div>
                  <div className="space-y-1">
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
            <div className="glass p-12 rounded-3xl text-center text-slate-500 italic text-sm border border-white/5">
              <Dumbbell size={32} className="mx-auto mb-3 text-slate-700" />
              Registra entrenamientos para ver tu progresión de volumen
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
            className="glass border border-brand-green/20 bg-brand-green/5 p-5 rounded-3xl flex items-center justify-between shadow-lg cursor-pointer hover:border-brand-green/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/20 flex items-center justify-center text-brand-green border border-brand-green/30 flex-shrink-0">
                <HeartPulse size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-brand-green">Estado de Recuperación (Readiness)</p>
                <p className="text-2xl font-black text-slate-50">{readiness.score}% <span className="text-xs font-bold text-brand-green">· {readiness.status}</span></p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-3 py-1.5 rounded-xl border border-brand-green/20 uppercase tracking-wider">
              Ver Diagnóstico
            </span>
          </div>

          {/* Muscle Fatigue & Deload Engine */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between px-1">
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-brand-green" /> Fatiga Muscular & Deload Engine
              </span>
              <span className={cn(
                'text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider',
                fatigueReport.isDeloadRecommended ? 'bg-red-500/20 text-red-400' : 'bg-brand-green/20 text-brand-green'
              )}>
                {fatigueReport.isDeloadRecommended ? 'Descarga Recomendada' : 'Fatiga Balanceada'}
              </span>
            </h2>

            <p className="text-xs text-slate-300 font-medium px-1">
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
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
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
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
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
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
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
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Historial de Medidas</h3>
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
                className="py-3 px-6 bg-brand-blue text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest"
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
                  <p className="text-xs text-slate-500 mt-0.5">Factores de preparación de hoy</p>
                </div>
                <button
                  onClick={() => setIsDiagnosticOpen(false)}
                  className="p-2 glass rounded-full text-slate-400 hover:text-slate-100"
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
                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Factores Calculados</h4>
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
                className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-widest"
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
