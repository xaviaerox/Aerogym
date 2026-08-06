import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Moon,
  Footprints,
} from 'lucide-react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useAuthStore } from '../application/stores/useAuthStore';
import { calculateLocalInsights } from '../lib/insightsEngine';
import { cn } from '../lib/utils';

import { calculateMuscleFatigue } from '../lib/fatigueEngine';
import BodyFatigueVisualizer from '../components/health/BodyFatigueVisualizer';
import VolumeChartCard from '../components/analytics/VolumeChartCard';
import HealthTrendsCard from '../components/analytics/HealthTrendsCard';
import AddBodyMeasurementModal from '../components/analytics/AddBodyMeasurementModal';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';

type TimeFilter = 'week' | 'month' | 'all';
type ViewTab = 'performance' | 'composition';

export default function Analytics() {
  const { sessions, workoutSetsHistory } = useWorkoutStore();
  const { dailyHealth, measurements, addMeasurement } = useHealthStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ViewTab>('performance');
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 1. Cálculo de Volumen de los últimos 7 días vs los 7 días anteriores (Semana previa)
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

  // Estadísticas generales de salud (últimos 7 días)
  const recentHealth7d = useMemo(
    () => dailyHealth.filter((h) => new Date(h.date) >= weekAgo),
    [dailyHealth, weekAgo]
  );

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
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md pt-2 pb-4 z-30">
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('performance')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
              activeTab === 'performance' ? 'bg-brand-blue text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Rendimiento
          </button>
          <button
            onClick={() => setActiveTab('composition')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
              activeTab === 'composition' ? 'bg-brand-blue text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Composición
          </button>
        </div>

        {activeTab === 'performance' ? (
          <div className="flex bg-slate-800/85 p-1 rounded-xl border border-white/5">
            {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                  filter === f ? 'bg-white/10 text-brand-blue' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-blue/90"
          >
            <Plus size={14} />
            Métricas
          </button>
        )}
      </div>

      {/* ── RENDIMIENTO TAB ────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Matriz de Calor de Actividad y Esfuerzo Físico (Estilo GitHub) */}
          <ActivityHeatmap sessions={sessions} dailyHealth={dailyHealth} />

          {/* Summary KPIs: High-value training metrics */}
          <div className="grid grid-cols-3 gap-3">
            {/* Volumen Semanal + Delta % */}
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

            {/* Series Efectivas (7d) */}
            <div className="glass p-4 rounded-3xl border border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Series (7d)</p>
                <Zap size={12} className="text-brand-green" />
              </div>
              <p className="text-xl font-black text-brand-green">{totalEffectiveSets7d}</p>
              <p className="text-[9px] text-slate-400 truncate font-medium">series efectivas</p>
            </div>

            {/* PRs (30d) */}
            <div className="glass p-4 rounded-3xl border border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Nuevos PRs</p>
                <Trophy size={12} className="text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-400">{recentPRs30d}</p>
              <p className="text-[9px] text-slate-400 truncate font-medium">últimos 30 días</p>
            </div>
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
              Registra entrenamientos para ver tu progresión
            </div>
          )}

          {/* Muscle Fatigue & Deload Engine (Analytics 2.0) */}
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

          {/* Consistencia Semanal Enriquecida */}
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

          {/* Salud y Tendencias de Pasos/Sueño */}
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
                          {format(new Date(m.measured_at), 'd \'de\' MMMM, yyyy', { locale: es })}
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

      {/* ── MODAL DE REGISTRO DE MEDIDAS ────────────────────────────────── */}
      <AddBodyMeasurementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeasurement}
      />
    </div>
  );
}
