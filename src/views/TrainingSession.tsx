import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Check, Timer, Trophy, Sparkles, ChevronRight, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { cn, getMuscleWikiUrl } from '../lib/utils';
import { BASE_EXERCISES } from '../constants/exercises';
import { calculateE1RM, getBestE1RM, suggestWeight } from '../lib/engine';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore, type ActiveSet } from '../application/stores/useWorkoutStore';
import { useGamificationStore } from '../application/stores/useGamificationStore';
import { MuscleWikiService, TRANSLATE_MUSCLE, TRANSLATE_CATEGORY } from '../lib/muscleWikiService';
import ExerciseMedia from '../components/ExerciseMedia';
import { vibrateSuccess, vibrateTimerAlert } from '../lib/haptics';

const playBeep = (freq: number, duration: number) => {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    osc.start();
    osc.stop(context.currentTime + duration);
  } catch (e) {
    console.warn('Audio Context blocked or unsupported');
  }
};

const playMultipleBeeps = (count: number, freq = 600, duration = 0.12, delayBetween = 180) => {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      playBeep(freq, duration);
    }, i * delayBetween);
  }
};

function ActiveSessionTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startMs = new Date(startedAt).getTime();
    const updateTimer = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsed(seconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const formattedTime = hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue rounded-full font-mono text-xs font-bold shadow-lg shadow-brand-blue/5">
      <Timer size={14} className="animate-pulse text-brand-blue" />
      <span>{formattedTime}</span>
    </div>
  );
}

export default function TrainingSession() {
  const { user } = useAuthStore();
  const { activeSession, sessions, finishSession, cancelSession, addSetToActive, toggleSetComplete, updateActiveExercise, addExerciseToActive, workoutSetsHistory } = useWorkoutStore();
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<number | undefined>();

  // MuscleWiki Guide Modal State
  const [activeMwGuideId, setActiveMwGuideId] = useState<string | null>(null);
  const [mwGuideData, setMwGuideData] = useState<any | null>(null);
  const [isLoadingMwGuide, setIsLoadingMwGuide] = useState(false);

  const handleOpenMwGuide = async (exerciseId: string) => {
    setActiveMwGuideId(exerciseId);
    setIsLoadingMwGuide(true);
    setMwGuideData(null);
    try {
      const details = await MuscleWikiService.getExerciseDetails(exerciseId);
      setMwGuideData(details);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMwGuide(false);
    }
  };

  if (!activeSession) return null;

  const isPR = (exerciseId: string, weight: number, reps: number) => {
    const currentE1RM = calculateE1RM(weight, reps);
    const bestE1RM = workoutSetsHistory
      .filter((s) => s.exercise_id === exerciseId && s.is_completed)
      .reduce((max, s) => Math.max(max, Number(s.e1rm_kg) || 0), 0);
    return currentE1RM > bestE1RM && weight > 0 && (reps || 0) > 0;
  };

  const handleToggleSet = (exerciseId: string, setIndex: number, set: ActiveSet) => {
    toggleSetComplete(exerciseId, setIndex);
    const willComplete = !set.is_completed;
    if (willComplete) {
      setTimerStart(Date.now());
      vibrateSuccess();
      if (set.reps && set.weight_kg && isPR(exerciseId, set.weight_kg, set.reps)) {
        vibrateTimerAlert();
        playBeep(880, 0.1);
        setTimeout(() => playBeep(1108.73, 0.1), 100);
        setTimeout(() => playBeep(1318.51, 0.2), 200);
      } else {
        playBeep(440, 0.05);
      }
    } else {
      setTimerStart(null);
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    try {
      const finishedSession = await finishSession(user.id, notes || undefined, difficulty);

      // Calcular racha y validar logros
      const updatedSessions = useWorkoutStore.getState().sessions;
      const updatedHistory = useWorkoutStore.getState().workoutSetsHistory;

      const sessionsCount = updatedSessions.length;
      
      const currentStreak = (() => {
        if (!updatedSessions.length) return 0;
        let count = 0;
        const today = new Date();
        const uniqueDays = [...new Set(updatedSessions.map((s) => s.started_at.split('T')[0]))];
        
        for (let i = 0; i < uniqueDays.length; i++) {
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          const expectedStr = expectedDate.toISOString().split('T')[0];
          if (uniqueDays.includes(expectedStr)) {
            count++;
          } else {
            if (i > 1) break;
          }
        }
        return count;
      })();

      const sessionVolume = finishedSession.total_volume_kg || 0;
      const hasAnyPR = updatedHistory.filter(s => s.session_id === finishedSession.id).some(s => s.is_pr);

      // Chequear nuevos logros
      await useGamificationStore.getState().checkForNewAchievements(
        user.id,
        sessionsCount,
        currentStreak,
        sessionVolume,
        hasAnyPR
      );
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-start sticky top-0 bg-slate-900/80 backdrop-blur-md pt-2 pb-4 z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{activeSession.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="status-badge inline-block">En Progreso</div>
            <ActiveSessionTimer startedAt={activeSession.started_at} />
          </div>
        </div>
        <button onClick={cancelSession} className="p-2 glass rounded-full text-slate-400 hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Timer */}
      <RestTimer startTime={timerStart} onClear={() => setTimerStart(null)} />

      {/* Exercises */}
      <div className="space-y-8">
        {activeSession.exercises.map((ex) => {
          const exerciseInfo = BASE_EXERCISES.find((e) => e.id === ex.exercise_id) ||
            (ex.exercise_id.startsWith('mw-') ? MuscleWikiService.getCachedExerciseInfo(ex.exercise_id) : undefined);
          const isCardio = exerciseInfo?.muscleGroup === 'Cardio';
          const bestE1RM = isCardio 
            ? 0 
            : workoutSetsHistory
                .filter((s) => s.exercise_id === ex.exercise_id && s.is_completed)
                .reduce((max, s) => Math.max(max, Number(s.e1rm_kg) || 0), 0);

          const setsToRender = isCardio ? ex.sets.slice(0, 1) : ex.sets;

          return (
            <div key={ex.exercise_id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">
                    {exerciseInfo?.name || ex.exercise_id}
                  </h3>
                  {bestE1RM > 0 && (
                    <p className="text-[10px] uppercase text-brand-green font-bold tracking-widest">
                      Record Estimado: {bestE1RM.toFixed(1)}kg
                    </p>
                  )}
                  {isCardio && (
                    <p className="text-[10px] uppercase text-brand-blue font-bold tracking-widest">
                      Ejercicio de Cardio
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {ex.exercise_id.startsWith('mw-') ? (
                    <button
                      type="button"
                      onClick={() => handleOpenMwGuide(ex.exercise_id)}
                      className="text-[10px] text-brand-blue hover:text-slate-950 font-bold uppercase tracking-widest bg-brand-blue/10 hover:bg-brand-blue px-2.5 py-1 rounded-full border border-brand-blue/20 hover:border-brand-blue transition-all inline-flex items-center gap-1"
                    >
                      Guía <BookOpen size={10} />
                    </button>
                  ) : (
                    exerciseInfo?.muscleGroup && (
                      <a
                        href={getMuscleWikiUrl(exerciseInfo.muscleGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-400 hover:text-brand-blue font-bold uppercase tracking-widest bg-white/5 hover:bg-brand-blue/10 px-2 py-1 rounded-full border border-white/10 hover:border-brand-blue/30 transition-all inline-flex items-center gap-1"
                      >
                        Wiki ↗
                      </a>
                    )
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-brand-blue/60 font-bold uppercase tracking-widest bg-brand-blue/5 px-2 py-1 rounded-full border border-brand-blue/10">
                    <Sparkles size={10} />
                    IA
                  </div>
                </div>
              </div>

              {/* Sets Header */}
              {isCardio ? (
                <div className="grid grid-cols-[30px_1fr_1fr_60px_50px] gap-2 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                  <span>#</span>
                  <span className="text-center">Minutos</span>
                  <span className="text-center">Metros</span>
                  <span className="text-center">RPE</span>
                  <span className="text-right">✓</span>
                </div>
              ) : (
                <div className="grid grid-cols-[30px_1fr_1fr_45px_45px_50px] gap-2 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                  <span>#</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">Reps</span>
                  <span className="text-center">RPE</span>
                  <span className="text-center">RIR</span>
                  <span className="text-right">✓</span>
                </div>
              )}

              {setsToRender.map((set, sIdx) => {
                const currentE1RM = !isCardio && set.weight_kg && set.reps
                  ? calculateE1RM(set.weight_kg, set.reps)
                  : 0;
                const isSetPR = !isCardio && set.weight_kg && set.reps
                  ? isPR(ex.exercise_id, set.weight_kg, set.reps)
                  : false;

                if (isCardio) {
                  return (
                    <div
                      key={set.id}
                      className={cn(
                        'grid grid-cols-[30px_1fr_1fr_60px_50px] gap-2 items-center p-2 rounded-xl transition-all border',
                        set.is_completed
                          ? 'bg-brand-blue/10 border-brand-blue/20'
                          : 'bg-white/5 border-transparent'
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-500">{sIdx + 1}</span>
                      </div>

                      {/* Minutes Input */}
                      <input
                        type="number"
                        value={set.duration_seconds ? Math.round(set.duration_seconds / 60) : ''}
                        placeholder="0 min"
                        onChange={(e) =>
                          updateActiveExercise(ex.exercise_id, sIdx, 'duration_seconds', (parseInt(e.target.value) || 0) * 60)
                        }
                        className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                      />

                      {/* Meters Input */}
                      <input
                        type="number"
                        value={set.distance_meters !== null && set.distance_meters !== undefined ? set.distance_meters : ''}
                        placeholder="Opcional"
                        onChange={(e) =>
                          updateActiveExercise(ex.exercise_id, sIdx, 'distance_meters', parseInt(e.target.value) || null)
                        }
                        className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                      />

                      {/* RPE */}
                      <input
                        type="number"
                        value={set.rpe || ''}
                        placeholder="-"
                        min="1"
                        max="10"
                        onChange={(e) =>
                          updateActiveExercise(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                        }
                        className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-brand-blue"
                      />

                      {/* Complete toggle */}
                      <button
                        onClick={() => handleToggleSet(ex.exercise_id, sIdx, set)}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center transition-all ml-auto',
                          set.is_completed
                            ? 'bg-brand-blue text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        )}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={set.id}
                    className={cn(
                      'grid grid-cols-[30px_1fr_1fr_45px_45px_50px] gap-2 items-center p-2 rounded-xl transition-all border',
                      set.is_completed
                        ? 'bg-brand-blue/10 border-brand-blue/20'
                        : 'bg-white/5 border-transparent'
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-slate-500">{sIdx + 1}</span>
                      {isSetPR && set.is_completed && (
                        <Trophy size={10} className="text-yellow-400" />
                      )}
                    </div>

                    {/* KG Input */}
                    <div className="min-w-0">
                      <input
                        type="number"
                        value={set.weight_kg || ''}
                        placeholder="0"
                        onChange={(e) =>
                          updateActiveExercise(ex.exercise_id, sIdx, 'weight_kg', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                      />
                      {currentE1RM > 0 && (
                        <p className="text-[8px] text-slate-500 font-bold text-center mt-0.5">
                          1RM≈{currentE1RM.toFixed(0)}
                        </p>
                      )}
                    </div>

                    {/* Reps Input */}
                    <input
                      type="number"
                      value={set.reps || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateActiveExercise(ex.exercise_id, sIdx, 'reps', parseInt(e.target.value) || null)
                      }
                      className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                    />

                    {/* RPE */}
                    <input
                      type="number"
                      value={set.rpe || ''}
                      placeholder="-"
                      min="1"
                      max="10"
                      onChange={(e) =>
                        updateActiveExercise(ex.exercise_id, sIdx, 'rpe', parseFloat(e.target.value) || null)
                      }
                      className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-brand-blue"
                    />

                    {/* RIR */}
                    <input
                      type="number"
                      value={set.rir !== null && set.rir !== undefined ? set.rir : ''}
                      placeholder="-"
                      min="0"
                      max="10"
                      onChange={(e) =>
                        updateActiveExercise(ex.exercise_id, sIdx, 'rir', parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : null)
                      }
                      className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-purple-400"
                    />

                    {/* Complete toggle */}
                    <button
                      onClick={() => handleToggleSet(ex.exercise_id, sIdx, set)}
                      aria-label="Completar serie"
                      className={cn(
                        'w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all ml-auto active:scale-95 shadow-md',
                        set.is_completed
                          ? 'bg-brand-blue text-slate-950 shadow-brand-blue/20'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      )}
                    >
                      <Check size={22} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}

              {!isCardio && (
                <button
                  onClick={() => addSetToActive(ex.exercise_id)}
                  className="w-full py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 hover:border-brand-blue/30 hover:text-brand-blue transition-all"
                >
                  <Plus size={14} className="inline mr-1" />
                  Añadir Serie
                </button>
              )}
            </div>
          );
        })}

        {/* Add Exercise */}
        <AddExerciseBtn onAdd={addExerciseToActive} />
      </div>

      {/* Finish Section */}
      <div className="pt-6 pb-6 space-y-4">
        {showNotes ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas de la sesión..."
              rows={3}
              className="w-full bg-slate-800/80 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 resize-none"
            />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Dificultad percibida (1-10)</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold border transition-all',
                      difficulty === d
                        ? 'bg-brand-blue text-slate-950 border-brand-blue'
                        : 'bg-slate-800 border-white/10 text-slate-500'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNotes(true)}
            className="w-full py-3 glass border-white/5 rounded-xl text-slate-500 text-[10px] font-bold uppercase tracking-widest"
          >
            + Añadir notas
          </button>
        )}

        <button
          onClick={handleFinish}
          className="btn-primary w-full py-4 text-slate-950 font-black text-sm"
        >
          FINALIZAR ENTRENAMIENTO
        </button>
      </div>

      {/* MuscleWiki Guide Modal */}
      <AnimatePresence>
        {activeMwGuideId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] overflow-y-auto px-4 py-8"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMwGuideId(null);
                    setMwGuideData(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-slate-400 text-xs font-bold"
                >
                  <ArrowLeft size={16} /> Cerrar Guía
                </button>
              </div>

              {isLoadingMwGuide ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-brand-blue" size={32} />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                    Cargando guía...
                  </p>
                </div>
              ) : mwGuideData ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-slate-55">{mwGuideData.name}</h2>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {TRANSLATE_MUSCLE[mwGuideData.primary_muscles[0]] || mwGuideData.primary_muscles[0]}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {TRANSLATE_CATEGORY[mwGuideData.category] || mwGuideData.category}
                      </span>
                      {mwGuideData.difficulty && (
                        <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {mwGuideData.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  <ExerciseMedia
                    exerciseName={mwGuideData.name}
                    primaryMuscle={mwGuideData.primary_muscles[0]}
                  />

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-blue" /> Paso a Paso
                    </h3>
                    <div className="space-y-3">
                      {mwGuideData.steps.map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-4 glass p-4 rounded-2xl border border-white/5 items-start">
                          <div className="w-5.5 h-5.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center font-black text-[9px] text-brand-blue flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed flex-1">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass p-8 rounded-3xl text-center text-slate-400">
                  No se pudo cargar la guía para este ejercicio.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RestTimer({ startTime, onClear }: { startTime: number | null; onClear: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const playedMilestonesRef = React.useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      playedMilestonesRef.current.clear();
      return;
    }

    playedMilestonesRef.current.clear();

    const interval = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);

      // Alarmas progresivas sin interrumpir el contador:
      // 2 minutos (120 s) -> 1 bip
      if (newElapsed >= 120 && !playedMilestonesRef.current.has(120)) {
        playedMilestonesRef.current.add(120);
        playMultipleBeeps(1, 650, 0.15);
      }
      // 3 minutos (180 s) -> 2 bips
      else if (newElapsed >= 180 && !playedMilestonesRef.current.has(180)) {
        playedMilestonesRef.current.add(180);
        playMultipleBeeps(2, 650, 0.15, 200);
      }
      // 5 minutos (300 s) -> 3 bips
      else if (newElapsed >= 300 && !playedMilestonesRef.current.has(300)) {
        playedMilestonesRef.current.add(300);
        playMultipleBeeps(3, 650, 0.15, 200);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none max-w-md mx-auto"
    >
      <div className="glass-dark border border-brand-blue/30 p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-brand-blue/20 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Timer size={22} />
            </motion.div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Descanso</p>
            <p className="text-xl font-mono font-bold text-slate-50">
              {mins}:{secs.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-slate-400 transition-colors border border-white/5"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function AddExerciseBtn({ onAdd }: { onAdd: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const muscleGroups = Array.from(new Set(BASE_EXERCISES.map((ex) => ex.muscleGroup)));

  const filtered = BASE_EXERCISES.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 glass border-brand-blue/30 text-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/5 transition-colors"
      >
        <Plus size={20} />
        Añadir Ejercicio
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 pb-3">
              <h2 className="text-2xl font-bold">Añadir Ejercicio</h2>
              <button onClick={() => { setIsOpen(false); setSearch(''); setSelectedMuscle(null); }} className="p-2 glass rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="px-6 pb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ejercicio o músculo..."
                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                autoFocus
              />
            </div>

            {/* Muscle Group Filters */}
            <div className="px-6 pb-4 overflow-x-auto flex gap-2 no-scrollbar scrollbar-none">
              <button
                onClick={() => setSelectedMuscle(null)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                  selectedMuscle === null
                    ? 'bg-brand-blue text-slate-950 border-brand-blue'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                )}
              >
                Todos
              </button>
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setSelectedMuscle(mg === selectedMuscle ? null : mg)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                    selectedMuscle === mg
                      ? 'bg-brand-blue text-slate-950 border-brand-blue'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {mg}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onAdd(ex.id); setIsOpen(false); setSearch(''); setSelectedMuscle(null); }}
                  className="w-full p-4 glass rounded-xl flex justify-between items-center hover:border-brand-blue/30 border border-transparent transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold">{ex.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
                      {ex.muscleGroup} · {ex.type}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
