import React from 'react';
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
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Calendar, Activity, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { cn } from '../lib/utils';

type TimeFilter = 'week' | 'month' | 'all';

export default function Analytics() {
  const { sessions } = useWorkoutStore();
  const { dailyHealth } = useHealthStore();
  const [filter, setFilter] = React.useState<TimeFilter>('month');

  const filteredSessions = React.useMemo(() => {
    const sorted = [...sessions].reverse(); // cronológico
    if (filter === 'week') return sorted.slice(-7);
    if (filter === 'month') return sorted.slice(-30);
    return sorted;
  }, [sessions, filter]);

  const volumeData = filteredSessions.map((s) => ({
    name: format(new Date(s.started_at), 'dd/MM', { locale: es }),
    vol: s.total_volume_kg || 0,
  }));

  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i);
    const count = sessions.filter((s) => isSameDay(new Date(s.started_at), d)).length;
    return { name: format(d, 'eee', { locale: es }), count };
  }).reverse();

  // Stats summary
  const totalVolume = sessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
  const avgDuration = sessions.filter((s) => s.duration_minutes).reduce((acc, s, _, arr) => acc + (s.duration_minutes || 0) / arr.length, 0);
  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.started_at);
    const weekAgo = subDays(new Date(), 7);
    return d >= weekAgo;
  }).length;

  // Health metrics
  const healthWithSteps = dailyHealth.filter((h) => h.steps > 0);
  const healthWithSleep = dailyHealth.filter((h) => h.sleep_hours);
  const avgSleep = healthWithSleep.length > 0
    ? healthWithSleep.reduce((acc, h) => acc + (h.sleep_hours || 0), 0) / healthWithSleep.length
    : 0;
  const maxSteps = healthWithSteps.length > 0 ? Math.max(...healthWithSteps.map((h) => h.steps)) : 0;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
          {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all',
                filter === f ? 'bg-brand-blue text-slate-950' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Volumen Total</p>
          <p className="text-lg font-black text-brand-blue">{(totalVolume / 1000).toFixed(1)}t</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Esta Semana</p>
          <p className="text-lg font-black text-brand-green">{thisWeekSessions} días</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Media/Sesión</p>
          <p className="text-lg font-black text-slate-50">{Math.round(avgDuration)}min</p>
        </div>
      </div>

      {/* Volumen Chart */}
      {volumeData.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <TrendingUp size={16} className="text-brand-blue" /> Volumen Total (kg)
          </h2>
          <div className="h-64 glass p-4 rounded-3xl border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                  formatter={(v) => [`${v}kg`, 'Volumen']}
                />
                <Line type="monotone" dataKey="vol" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="glass p-8 rounded-3xl text-center text-slate-500 italic text-sm">
          <Dumbbell size={32} className="mx-auto mb-3 text-slate-700" />
          Registra entrenamientos para ver tu progresión
        </div>
      )}

      {/* Consistencia semanal */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Calendar size={16} className="text-orange-400" /> Consistencia (7 días)
        </h2>
        <div className="h-40 glass p-4 rounded-2xl border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', fontSize: '10px' }} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Salud */}
      {dailyHealth.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Activity size={16} className="text-purple-400" /> Tendencias de Salud
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Récord Pasos</p>
              <p className="text-xl font-black text-brand-blue">{maxSteps.toLocaleString()}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Media Sueño</p>
              <p className="text-xl font-black text-purple-400">{avgSleep.toFixed(1)}h</p>
            </div>
          </div>

          {healthWithSteps.length > 1 && (
            <div className="h-40 glass p-4 rounded-2xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...healthWithSteps].reverse().slice(-14)}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => format(new Date(d), 'dd/MM')}
                    hide
                  />
                  <Tooltip
                    labelFormatter={(d) => format(new Date(d), 'PPPP', { locale: es })}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', fontSize: '10px' }}
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
  );
}
