import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Footprints,
  Flame,
  Sparkles,
  Activity,
  Dumbbell,
  Moon,
  Droplets,
  Settings,
  Scale,
  Plus,
  BookOpen,
  Calendar,
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useUIStore, type DashboardWidgets } from '../application/stores/useUIStore';
import { useGamificationStore } from '../application/stores/useGamificationStore';
import type { Routine, RoutineExercise } from '../infrastructure/supabase/types';
import HealthLoggerModal from '../components/HealthLoggerModal';
import { Trophy, Shield, Award, Zap } from 'lucide-react';

interface DashboardProps {
  nextRoutine?: Routine & { exercises: RoutineExercise[] };
}

export default function Dashboard({ nextRoutine }: DashboardProps) {
  const { profile, user } = useAuthStore();
  const { sessions, startSession, workoutSetsHistory, routines } = useWorkoutStore();
  const { todayHealth, dailyHealth } = useHealthStore();
  const { visibleWidgets, toggleWidgetVisibility } = useUIStore();
  const { achievements, fetchAchievements, newUnlockedAchievement, clearNewAchievement } = useGamificationStore();

  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isRoutineSelectorOpen, setIsRoutineSelectorOpen] = useState(false);

  const lastSession = sessions[0];

  // Cargar logros al iniciar
  React.useEffect(() => {
    if (user?.id) {
      fetchAchievements(user.id);
    }
  }, [user?.id, fetchAchievements]);

  // Limpiar alerta de logro automáticamente después de 6s
  React.useEffect(() => {
    if (newUnlockedAchievement) {
      const timer = setTimeout(() => {
        clearNewAchievement();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [newUnlockedAchievement, clearNewAchievement]);

  // Calcular XP del usuario
  const userXP = useMemo(() => {
    const sessionsXP = sessions.length * 100;
    const setsXP = (workoutSetsHistory || []).length * 10;
    const healthXP = dailyHealth.length * 20;
    const prsCount = (workoutSetsHistory || []).filter(s => s.is_pr).length;
    const prsXP = prsCount * 50;

    const totalXP = sessionsXP + setsXP + healthXP + prsXP;
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    
    const levelProgressXP = totalXP - currentLevelBaseXP;
    const levelRequiredXP = nextLevelXP - currentLevelBaseXP;
    const progressPercent = Math.min(100, Math.round((levelProgressXP / levelRequiredXP) * 100));

    return {
      total: totalXP,
      level,
      progressPercent
    };
  }, [sessions, workoutSetsHistory, dailyHealth]);

  // Calcular racha actual de entrenamientos seguidos (días activos)
  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    let count = 0;
    const today = new Date();
    const uniqueDays = [...new Set(sessions.map((s) => s.started_at.split('T')[0]))];
    
    for (let i = 0; i < uniqueDays.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDays.includes(expectedStr)) {
        count++;
      } else {
        // Permitir romper racha solo si no es hoy o ayer (ventana de gracia)
        if (i > 1) break;
      }
    }
    return count;
  }, [sessions]);

  // Algoritmo de Readiness Score avanzado
  const readiness = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayHealth = dailyHealth.find(h => h.date === yesterdayStr);

    // Comprobar si hubo entrenamiento ayer
    const trainedYesterday = sessions.some(s => {
      const sDate = s.started_at.split('T')[0];
      return sDate === yesterdayStr;
    });

    let score = 70; // Base inicial neutra
    const factors: string[] = [];

    // 1. Sueño de hoy (recuperación primaria)
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
      
      // Calidad de sueño (1-5 estrellas)
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

    // 2. Fatiga por pasos del día anterior
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

    // 3. Fatiga muscular por entrenamiento de ayer
    if (trainedYesterday) {
      const yesterdayWorkout = sessions.find(s => s.started_at.split('T')[0] === yesterdayStr);
      const diff = yesterdayWorkout?.perceived_difficulty || 6;
      const penalty = diff >= 8 ? 15 : 10;
      score -= penalty;
      factors.push(`Entrenamiento de ayer: "${yesterdayWorkout?.name || 'Musculación'}" (Dificultad: ${diff}/10) (-${penalty}%)`);
    }

    // 4. Energía actual subjetiva hoy
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

  // Nombres descriptivos de los widgets para el panel de ajustes
  const widgetLabels: Record<keyof DashboardWidgets, string> = {
    sessionsCount: 'Contador de Sesiones',
    streak: 'Racha Activa',
    readiness: 'Readiness (Preparación)',
    nextRoutine: 'Turno / Siguiente Rutina',
    quickLogger: 'Botonera Log Diario',
    water: 'Progreso de Agua',
    steps: 'Progreso de Pasos',
    stoicQuote: 'Consejo Estoico de Aero',
    lastWorkout: 'Detalle de Última Sesión',
  };

  return (
    <div className="space-y-8">
      {/* Header & Level Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
            <h1 className="text-3xl font-bold text-slate-50 mt-1">
              Hola, {profile?.name?.split(' ')[0] || 'atleta'}
            </h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 glass rounded-2xl text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* XP Level Bar */}
        <div className="glass p-4 rounded-3xl border border-white/5 bg-slate-900/40 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Trophy size={14} className="text-amber-400" />
              <span>Nivel {userXP.level}</span>
            </div>
            <span className="text-slate-400 font-medium">{userXP.total} XP total</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${userXP.progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full" 
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Lvl {userXP.level}</span>
            <span>{userXP.progressPercent}% para Lvl {userXP.level + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {visibleWidgets.sessionsCount && (
          <StatCard
            label="Entrenos"
            value={sessions.length.toString()}
            icon={<Dumbbell size={16} className="text-brand-blue" />}
            color="blue"
          />
        )}
        {visibleWidgets.streak && (
          <StatCard
            label="Racha"
            value={`${streak}d`}
            icon={<Flame size={16} className="text-orange-400 animate-pulse" />}
            color="orange"
          />
        )}
        {visibleWidgets.readiness && (
          <div className="cursor-pointer" onClick={() => setIsDiagnosticOpen(true)}>
            <StatCard
              label="Readiness"
              value={`${readiness.score}%`}
              icon={<Activity size={16} className="text-brand-green" />}
              color="green"
            />
          </div>
        )}
      </div>

      {/* Siguiente Sesión */}
      {visibleWidgets.nextRoutine && (
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
              Siguiente Sesión
            </h2>
            <button
              onClick={() => setIsRoutineSelectorOpen(true)}
              className="text-[10px] text-brand-blue font-bold uppercase tracking-wider hover:underline transition-all"
            >
              Elegir otra ⇄
            </button>
          </div>
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
      )}

      {/* Registro Diario Rápido Trigger Card */}
      {visibleWidgets.quickLogger && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
            Log del Día
          </h2>
          <button
            onClick={() => setIsLoggerOpen(true)}
            className="w-full p-5 glass border-white/5 hover:border-brand-blue/20 rounded-3xl text-left flex justify-between items-center transition-all group"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                Registrar métricas diarias
                <Plus size={16} className="text-brand-blue group-hover:rotate-90 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {todayHealth 
                  ? "Actualiza tu agua, pasos, sueño o peso corporal" 
                  : "Registra agua, pasos, sueño y energía en 10 seg"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {todayHealth?.water_ml ? (
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Droplets size={16} />
                </div>
              ) : null}
              {todayHealth?.steps ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Footprints size={16} />
                </div>
              ) : null}
            </div>
          </button>
        </section>
      )}

      {/* Water & Steps Quick Progress Widgets */}
      <div className="grid grid-cols-2 gap-3">
        {visibleWidgets.water && (
          <div className="glass p-4 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-brand-blue">
              <Droplets size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Agua Consumida</span>
            </div>
            <p className="text-2xl font-black text-slate-50">
              {todayHealth?.water_ml ? `${(todayHealth.water_ml / 1000).toFixed(1)}L` : '0.0L'}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Objetivo sugerido: 2.5L</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-blue h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((todayHealth?.water_ml || 0) / 2500) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {visibleWidgets.steps && (
          <div className="glass p-4 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400">
              <Footprints size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Pasos</span>
            </div>
            <p className="text-2xl font-black text-slate-50">
              {todayHealth?.steps ? todayHealth.steps.toLocaleString() : '0'}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Objetivo sugerido: 10k</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((todayHealth?.steps || 0) / 10000) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sabiduría Estoica */}
      {visibleWidgets.stoicQuote && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="glass p-6 rounded-3xl border-brand-blue/10 relative overflow-hidden bg-brand-blue/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-brand-blue" />
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Sabiduría de Aero
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed font-serif italic text-lg">
              {readiness.score < 50 
                ? `"El descanso también es una acción del sabio. No exijas al cuerpo lo que la mente sabe que hoy necesita recuperar."`
                : readiness.score >= 85
                ? `"La fortuna sonríe a la preparación. Hoy tu Readiness es óptimo. No postergues la oportunidad de superarte."`
                : `"El obstáculo es el camino. Lo que hoy te cuesta esfuerzo mañana será tu fortaleza. Haz tu parte."`}
            </p>
          </div>
        </section>
      )}

      {/* Último Registro */}
      {visibleWidgets.lastWorkout && (
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
      )}

      {/* HEALTH LOGGER MODAL */}
      {user?.id && (
        <AnimatePresence>
          {isLoggerOpen && (
            <HealthLoggerModal
              userId={user.id}
              isOpen={isLoggerOpen}
              onClose={() => setIsLoggerOpen(false)}
            />
          )}
        </AnimatePresence>
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

              {/* Big circular score */}
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className={cn("text-5xl font-black px-6 py-4 rounded-3xl border", readiness.colorClass)}>
                  {readiness.score}%
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-300 mt-2">{readiness.status}</div>
              </div>

              {/* Factors list */}
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

      {/* WIDGET CONFIGURATION MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
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
                    <Settings size={20} className="text-slate-400" />
                    Personalizar Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Elige qué widgets deseas ver</p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 glass rounded-full text-slate-400 hover:text-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Toggles list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {(Object.keys(visibleWidgets) as Array<keyof DashboardWidgets>).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleWidgetVisibility(key)}
                    className="w-full flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-blue/30 transition-all text-left group"
                  >
                    <span className="text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors">
                      {widgetLabels[key] || key}
                    </span>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                        visibleWidgets[key]
                          ? "bg-brand-blue border-brand-blue text-slate-950"
                          : "border-slate-700 bg-slate-900 text-transparent"
                      )}
                    >
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-widest"
              >
                Guardar Configuración
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUTINE SELECTOR MODAL */}
      <AnimatePresence>
        {isRoutineSelectorOpen && (
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
                    <Dumbbell size={20} className="text-brand-blue" />
                    Seleccionar Rutina
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Elige con qué rutina deseas entrenar hoy</p>
                </div>
                <button
                  onClick={() => setIsRoutineSelectorOpen(false)}
                  className="p-2 glass rounded-full text-slate-400 hover:text-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Routines list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {/* Opción entrenamiento libre */}
                <button
                  onClick={() => {
                    startSession(undefined);
                    setIsRoutineSelectorOpen(false);
                  }}
                  className="w-full flex justify-between items-center p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl hover:bg-brand-blue/20 transition-all text-left"
                >
                  <div className="pr-2">
                    <span className="text-xs font-black text-brand-blue uppercase tracking-wider block">
                      Entrenamiento Libre
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Registra una sesión en blanco añadiendo tus ejercicios en el momento.
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-brand-blue flex-shrink-0" />
                </button>

                {/* Rutinas guardadas */}
                {routines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => {
                      startSession(routine);
                      setIsRoutineSelectorOpen(false);
                    }}
                    className="w-full flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-blue/30 transition-all text-left"
                  >
                    <div className="pr-2">
                      <span className="text-xs font-bold text-slate-200 block">
                        {routine.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block line-clamp-1">
                        {routine.description || 'Sin descripción'} · {routine.exercises?.length || 0} Ejercicios
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}

                {routines.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-4">
                    No tienes rutinas guardadas. ¡Pídele una al Coach Aero o créala en la pestaña Log!
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsRoutineSelectorOpen(false)}
                className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocked Achievement Alert */}
      <AnimatePresence>
        {newUnlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-96 glass bg-slate-950/90 border-brand-blue/30 rounded-3xl p-5 shadow-2xl z-[120] space-y-3"
          >
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 flex-shrink-0">
                {newUnlockedAchievement.icon === 'dumbbell' && <Dumbbell size={24} />}
                {newUnlockedAchievement.icon === 'shield' && <Shield size={24} />}
                {newUnlockedAchievement.icon === 'zap' && <Zap size={24} />}
                {newUnlockedAchievement.icon === 'trophy' && <Trophy size={24} />}
                {!['dumbbell', 'shield', 'zap', 'trophy'].includes(newUnlockedAchievement.icon) && <Award size={24} />}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] bg-brand-blue text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                  ¡LOGRO DESBLOQUEADO!
                </span>
                <h4 className="font-bold text-slate-50">{newUnlockedAchievement.title}</h4>
                <p className="text-xs text-slate-400 leading-normal">{newUnlockedAchievement.description}</p>
              </div>
              <button
                onClick={clearNewAchievement}
                className="p-1 glass rounded-full text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    blue: 'border-brand-blue/20 bg-brand-blue/[0.02]',
    orange: 'border-orange-500/20 bg-orange-500/[0.02]',
    green: 'border-brand-green/20 bg-brand-green/[0.02]',
    purple: 'border-purple-500/20 bg-purple-500/[0.02]',
  };

  return (
    <div className={cn('glass p-4 rounded-3xl border transition-all hover:scale-[1.02]', colors[color])}>
      <div className="flex items-center gap-1.5 mb-1.5">{icon}</div>
      <p className="text-xl font-black text-slate-50">{value}</p>
      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{label}</p>
    </div>
  );
}
