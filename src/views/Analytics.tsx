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
  Area
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Calendar, Activity, Dumbbell, Scale, Plus, X, Sparkles } from 'lucide-react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useAuthStore } from '../application/stores/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { calculateLocalInsights } from '../lib/insightsEngine';
import { cn } from '../lib/utils';

import { calculateMuscleFatigue } from '../lib/fatigueEngine';

type TimeFilter = 'week' | 'month' | 'all';
type ViewTab = 'performance' | 'composition';

export default function Analytics() {
  const { sessions, workoutSetsHistory } = useWorkoutStore();
  const { dailyHealth, measurements, addMeasurement } = useHealthStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ViewTab>('performance');
  const [filter, setFilter] = useState<TimeFilter>('month');

  // Calcular informe de fatiga muscular (Analytics 2.0)
  const fatigueReport = useMemo(() => {
    return calculateMuscleFatigue(sessions, workoutSetsHistory);
  }, [sessions, workoutSetsHistory]);

  // Calcular insights de IA locales
  const localInsights = useMemo(() => {
    return calculateLocalInsights(sessions, dailyHealth);
  }, [sessions, dailyHealth]);

  // Modal para agregar medidas corporales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');
  const [leg, setLeg] = useState('');
  const [hip, setHip] = useState('');
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

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

  // Consistencia de los últimos 7 días
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i);
    const count = sessions.filter((s) => isSameDay(new Date(s.started_at), d)).length;
    return { name: format(d, 'eee', { locale: es }), count };
  }).reverse();

  // Estadísticas globales de entrenamiento
  const totalVolume = sessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
  const avgDuration = sessions.filter((s) => s.duration_minutes).reduce((acc, s, _, arr) => acc + (s.duration_minutes || 0) / arr.length, 0);
  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.started_at);
    const weekAgo = subDays(new Date(), 7);
    return d >= weekAgo;
  }).length;

  // Estadísticas generales de salud
  const healthWithSteps = dailyHealth.filter((h) => h.steps > 0);
  const healthWithSleep = dailyHealth.filter((h) => h.sleep_hours);
  const avgSleep = healthWithSleep.length > 0
    ? healthWithSleep.reduce((acc, h) => acc + (h.sleep_hours || 0), 0) / healthWithSleep.length
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

  const handleSaveMeasurement = async () => {
    if (!user?.id || !weight) return;
    setIsSaving(true);
    try {
      await addMeasurement(user.id, {
        measured_at: measuredAt,
        weight_kg: parseFloat(weight),
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        waist_cm: waist ? parseFloat(waist) : null,
        chest_cm: chest ? parseFloat(chest) : null,
        arm_cm: arm ? parseFloat(arm) : null,
        leg_cm: leg ? parseFloat(leg) : null,
        hip_cm: hip ? parseFloat(hip) : null,
      });

      // Resetear inputs y cerrar modal
      setWeight('');
      setBodyFat('');
      setWaist('');
      setChest('');
      setArm('');
      setLeg('');
      setHip('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error guardando medidas');
    } finally {
      setIsSaving(false);
    }
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
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Volumen Total</p>
              <p className="text-xl font-black text-brand-blue">{(totalVolume / 1000).toFixed(1)}t</p>
            </div>
            <div className="glass p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Esta Semana</p>
              <p className="text-xl font-black text-brand-green">{thisWeekSessions} días</p>
            </div>
            <div className="glass p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Media/Sesión</p>
              <p className="text-xl font-black text-slate-50">{Math.round(avgDuration)}min</p>
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
            <section className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <TrendingUp size={16} className="text-brand-blue" /> Volumen Total (kg)
              </h2>
              <div className="h-64 glass p-4 rounded-3xl border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px' }}
                      formatter={(v) => [`${v}kg`, 'Volumen']}
                    />
                    <Line type="monotone" dataKey="vol" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
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

            <div className="glass p-5 rounded-3xl space-y-4 border border-white/5 bg-slate-900/40">
              <p className="text-xs text-slate-300 font-medium">
                {fatigueReport.recommendation}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {fatigueReport.muscleFatigueList.slice(0, 6).map((m) => (
                  <div key={m.muscleGroup} className="space-y-1 bg-white/[0.02] p-2.5 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-300">
                      <span>{m.muscleGroup}</span>
                      <span className={cn(
                        m.status === 'overtrained' ? 'text-red-400' :
                        m.status === 'high' ? 'text-amber-400' : 'text-slate-400'
                      )}>
                        {m.fatiguePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          m.status === 'overtrained' ? 'bg-red-500' :
                          m.status === 'high' ? 'bg-amber-400' : 'bg-brand-blue'
                        )}
                        style={{ width: `${m.fatiguePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Consistencia semanal */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Calendar size={16} className="text-orange-400" /> Consistencia (7 días)
            </h2>
            <div className="h-40 glass p-4 rounded-3xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Salud */}
          {dailyHealth.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Activity size={16} className="text-purple-400" /> Tendencias de Salud
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-4 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Récord Pasos</p>
                  <p className="text-xl font-black text-brand-blue">{maxSteps.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Media Sueño</p>
                  <p className="text-xl font-black text-purple-400">{avgSleep.toFixed(1)}h</p>
                </div>
              </div>

              {healthWithSteps.length > 1 && (
                <div className="h-40 glass p-4 rounded-3xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...healthWithSteps].reverse().slice(-14)}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => format(new Date(d), 'dd/MM')}
                        hide
                      />
                      <Tooltip
                        labelFormatter={(d) => format(new Date(d), 'PPPP', { locale: es })}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', fontSize: '10px' }}
                        formatter={(v) => [`${Number(v).toLocaleString()} pasos`, '']}
                      />
                      <Bar dataKey="steps" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
                    <AreaChart data={compositionData}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px' }}
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
                    <LineChart data={compositionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px' }}
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
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-end max-w-md mx-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-50 flex items-center gap-2">
                  <Scale size={24} className="text-brand-blue" />
                  Medidas
                </h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Historial Físico</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 glass rounded-full text-slate-400 hover:text-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-28">
              
              {/* Fecha */}
              <div className="glass p-5 rounded-3xl border border-white/5 space-y-2">
                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Fecha de Registro</label>
                <input
                  type="date"
                  value={measuredAt}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none font-bold text-slate-100"
                />
              </div>

              {/* Peso & Grasa */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-5 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Peso (kg) *</label>
                  <input
                    type="number"
                    step={0.1}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="75.0"
                    required
                    className="w-full bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-lg text-slate-100 focus:ring-2 ring-rose-500/30"
                  />
                </div>
                <div className="glass p-5 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Grasa Corporal (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="15.0"
                    className="w-full bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-lg text-slate-100 focus:ring-2 ring-brand-blue/30"
                  />
                </div>
              </div>

              {/* Cintura & Pecho */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-5 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Cintura (cm)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-slate-100"
                  />
                </div>
                <div className="glass p-5 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Pecho (cm)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-slate-100"
                  />
                </div>
              </div>

              {/* Brazo, Muslo, Cadera */}
              <div className="grid grid-cols-3 gap-2">
                <div className="glass p-4 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Brazo (cm)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={arm}
                    onChange={(e) => setArm(e.target.value)}
                    placeholder="38"
                    className="w-full bg-slate-800 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100"
                  />
                </div>
                <div className="glass p-4 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Muslo (cm)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={leg}
                    onChange={(e) => setLeg(e.target.value)}
                    placeholder="58"
                    className="w-full bg-slate-800 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100"
                  />
                </div>
                <div className="glass p-4 rounded-3xl border border-white/5 space-y-2">
                  <label className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Cadera (cm)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    placeholder="96"
                    className="w-full bg-slate-800 text-center rounded-xl py-2 outline-none font-bold text-sm text-slate-100"
                  />
                </div>
              </div>

            </div>

            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-slate-950/80 backdrop-blur-lg border-t border-white/5 z-20">
              <button
                onClick={handleSaveMeasurement}
                disabled={isSaving || !weight}
                className="btn-primary w-full py-4 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Guardando Medidas...' : 'Guardar Medidas'}
                <Sparkles size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
