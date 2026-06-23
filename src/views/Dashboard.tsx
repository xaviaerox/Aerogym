import React from 'react';
import { motion } from 'motion/react';
import { Play, Footprints, Flame, Sparkles, Activity, Dumbbell, Moon, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import type { Routine } from '../infrastructure/supabase/types';
import type { RoutineExercise } from '../infrastructure/supabase/types';

interface DashboardProps {
  nextRoutine?: Routine & { exercises: RoutineExercise[] };
}

export default function Dashboard({ nextRoutine }: DashboardProps) {
  const { profile } = useAuthStore();
  const { sessions, startSession } = useWorkoutStore();
  const { todayHealth, upsertTodayHealth } = useHealthStore();
  const { user } = useAuthStore();

  const [steps, setSteps] = React.useState('');
  const [cardio, setCardio] = React.useState('');

  const lastSession = sessions[0];

  // Calcular racha actual
  const streak = React.useMemo(() => {
    if (!sessions.length) return 0;
    let count = 0;
    const today = new Date();
    const uniqueDays = [...new Set(sessions.map((s) => s.started_at.split('T')[0]))];
    for (let i = 0; i < uniqueDays.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDays[i] === expectedStr) {
        count++;
      } else break;
    }
    return count;
  }, [sessions]);

  const handleQuickLog = async () => {
    if (!user?.id) return;
    await upsertTodayHealth(user.id, {
      steps: parseInt(steps) || todayHealth?.steps || 0,
      cardio_minutes: parseInt(cardio) || todayHealth?.cardio_minutes || 0,
    });
    setSteps('');
    setCardio('');
  };

  // Readiness score simple basado en sueño y pasos del día anterior
  const readinessScore = React.useMemo(() => {
    if (!todayHealth) return null;
    let score = 50;
    if (todayHealth.sleep_hours) {
      score += Math.min(30, todayHealth.sleep_hours * 4);
    }
    if (todayHealth.energy_level) {
      score += todayHealth.energy_level * 2;
    }
    return Math.min(100, Math.round(score));
  }, [todayHealth]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-slate-400 text-sm font-medium">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        <h1 className="text-3xl font-bold text-slate-50 mt-1">
          Hola, {profile?.name?.split(' ')[0] || 'atleta'} 👋
        </h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Entrenamientos"
          value={sessions.length.toString()}
          icon={<Dumbbell size={16} className="text-brand-blue" />}
          color="blue"
        />
        <StatCard
          label="Racha"
          value={`${streak}d`}
          icon={<Flame size={16} className="text-orange-400" />}
          color="orange"
        />
        {readinessScore !== null ? (
          <StatCard
            label="Readiness"
            value={`${readinessScore}%`}
            icon={<Activity size={16} className="text-brand-green" />}
            color="green"
          />
        ) : (
          <StatCard
            label="Sueño hoy"
            value={todayHealth?.sleep_hours ? `${todayHealth.sleep_hours}h` : '--'}
            icon={<Moon size={16} className="text-purple-400" />}
            color="purple"
          />
        )}
      </div>

      {/* Siguiente Sesión */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
          Siguiente Sesión
        </h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => startSession(nextRoutine)}
          className="w-full glass bg-brand-blue/20 border-brand-blue/30 rounded-3xl p-6 text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-brand-blue/20 transition-all" />

          <div className="relative z-10 flex justify-between items-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-50">
                {nextRoutine?.name || 'Entrenamiento Libre'}
              </h3>
              <p className="text-slate-400 font-medium text-sm line-clamp-1 max-w-[200px]">
                {nextRoutine?.description || 'Sesión sin rutina fija'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-brand-blue text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                  TURNO ACTUAL
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {nextRoutine?.exercises?.length || 0} Ejercicios
                </span>
              </div>
            </div>

            <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
              <Play className="text-white fill-white ml-1" size={28} />
            </div>
          </div>
        </motion.button>
      </section>

      {/* Registro Rápido */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
          Actividad Diaria
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand-blue">
              <Footprints size={16} />
              <span className="text-[10px] font-bold uppercase">Pasos</span>
            </div>
            {todayHealth?.steps ? (
              <p className="text-xl font-bold text-slate-50">{todayHealth.steps.toLocaleString()}</p>
            ) : null}
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={todayHealth?.steps ? 'Actualizar...' : 'Ej: 10000'}
              className="bg-transparent text-lg font-bold outline-none text-slate-50 w-full placeholder:text-slate-600"
            />
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={16} />
              <span className="text-[10px] font-bold uppercase">Cardio (min)</span>
            </div>
            {todayHealth?.cardio_minutes ? (
              <p className="text-xl font-bold text-slate-50">{todayHealth.cardio_minutes}'</p>
            ) : null}
            <input
              type="number"
              value={cardio}
              onChange={(e) => setCardio(e.target.value)}
              placeholder={todayHealth?.cardio_minutes ? 'Actualizar...' : 'Ej: 30'}
              className="bg-transparent text-lg font-bold outline-none text-slate-50 w-full placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Quick health badges */}
        {todayHealth && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {todayHealth.sleep_hours && (
              <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full whitespace-nowrap">
                <Moon size={12} className="text-purple-400" />
                <span className="text-[10px] text-purple-300 font-bold">{todayHealth.sleep_hours}h sueño</span>
              </div>
            )}
            {todayHealth.water_ml ? (
              <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full whitespace-nowrap">
                <Droplets size={12} className="text-blue-400" />
                <span className="text-[10px] text-blue-300 font-bold">{(todayHealth.water_ml / 1000).toFixed(1)}L agua</span>
              </div>
            ) : null}
          </div>
        )}

        <button
          onClick={handleQuickLog}
          disabled={!steps && !cardio}
          className={cn(
            'w-full py-3 glass border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors',
            steps || cardio
              ? 'text-brand-blue hover:bg-brand-blue/5 border-brand-blue/20'
              : 'text-slate-600 cursor-not-allowed'
          )}
        >
          Guardar Actividad
        </button>
      </section>

      {/* Sabiduría Aero */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="glass p-6 rounded-3xl border-brand-blue/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-brand-blue" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Sabiduría de Aero
            </h3>
          </div>
          <p className="text-slate-300 leading-relaxed font-serif italic text-lg">
            "La disciplina es el puente entre las metas y los logros. Hoy no es el día para cruzarlo a medias."
          </p>
        </div>
      </section>

      {/* Último Registro */}
      <section className="space-y-4 pb-10">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
          Último Entrenamiento
        </h2>
        {lastSession ? (
          <div className="glass p-5 rounded-2xl flex justify-between items-center border border-white/5">
            <div>
              <p className="font-bold text-slate-50">{lastSession.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {format(new Date(lastSession.started_at), 'EEEE, d MMM', { locale: es })}
              </p>
              {lastSession.duration_minutes && (
                <p className="text-[10px] text-slate-600 mt-0.5">{lastSession.duration_minutes} min</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-brand-green font-black text-lg">
                +{lastSession.total_volume_kg?.toFixed(0)}kg
              </p>
              <Activity size={14} className="text-brand-green ml-auto mt-1" />
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl text-center text-slate-500 italic text-sm">
            Ninguna sesión registrada aún. ¡Empieza hoy!
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'purple';
}) {
  const colors = {
    blue: 'border-brand-blue/20',
    orange: 'border-orange-500/20',
    green: 'border-brand-green/20',
    purple: 'border-purple-500/20',
  };

  return (
    <div className={cn('glass p-3 rounded-2xl border', colors[color])}>
      <div className="flex items-center gap-1.5 mb-1">{icon}</div>
      <p className="text-xl font-black text-slate-50">{value}</p>
      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
    </div>
  );
}
