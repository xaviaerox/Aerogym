/**
 * TrainingSession — Active workout session view.
 *
 * Responsibilities kept here (orchestration only):
 *  - State management for timer, notes, difficulty, and guide modal
 *  - Handlers for toggling sets and finishing a session
 *  - Layout assembly using extracted subcomponents
 *
 * Subcomponents (SRP):
 *  - RestTimer (floating rest countdown)
 *  - ExerciseBlock (per-exercise sets rendering)
 *  - AddExerciseBtn (exercise picker modal)
 *  - ExerciseGuideModal (exercise step-by-step guide)
 */
import { useState, useEffect } from 'react';
import { X, Timer, Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { calculateE1RM } from '../lib/engine';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore, type ActiveSet } from '../application/stores/useWorkoutStore';
import { useGamificationStore } from '../application/stores/useGamificationStore';
import { useToastStore } from '../application/stores/useToastStore';
import { parseVoiceInputToSet } from '../lib/voiceParserEngine';
import { MuscleWikiService } from '../lib/muscleWikiService';
import type { MuscleWikiExercise } from '../lib/muscleWikiService';
import { vibrateSuccess, vibrateTimerAlert } from '../lib/haptics';
import RestTimer, { playMultipleBeeps } from '../components/training/RestTimer';
import ExerciseBlock from '../components/training/ExerciseBlock';
import AddExerciseBtn from '../components/training/AddExerciseBtn';
import ExerciseGuideModal from '../components/training/ExerciseGuideModal';

// ─── Session Header Timer ─────────────────────────────────────────────────────
function ActiveSessionTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  // Update every second with proper useEffect cleanup
  useEffect(() => {
    const startMs = new Date(startedAt).getTime();
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const formattedTime =
    hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue rounded-full font-mono text-xs font-bold shadow-lg shadow-brand-blue/5">
      <Timer size={14} className="animate-pulse text-brand-blue" />
      <span>{formattedTime}</span>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function TrainingSession() {
  const user = useAuthStore((s) => s.user);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const sessions = useWorkoutStore((s) => s.sessions);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const cancelSession = useWorkoutStore((s) => s.cancelSession);
  const toggleSetComplete = useWorkoutStore((s) => s.toggleSetComplete);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const workoutSetsHistory = useWorkoutStore((s) => s.workoutSetsHistory);
  const updateActiveExercise = useWorkoutStore((s) => s.updateActiveExercise);
  const addToast = useToastStore((s) => s.addToast);
  const showToast = (title: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    addToast({ title, type });
  };

  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('El dictado por voz no está soportado en este navegador', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('🎙️ Escuchando... Di ej: "80 kilos 10 repeticiones"', 'info');
      };

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const speechResult = event.results?.[0]?.[0]?.transcript || '';
        const parsed = parseVoiceInputToSet(speechResult);

        if (parsed.weightKg !== null || parsed.reps !== null) {
          if (activeSession && activeSession.exercises.length > 0) {
            let targetEx = activeSession.exercises[0];
            let targetSetIdx = 0;

            for (const ex of activeSession.exercises) {
              const pendingIdx = ex.sets.findIndex((s) => !s.is_completed);
              if (pendingIdx !== -1) {
                targetEx = ex;
                targetSetIdx = pendingIdx;
                break;
              }
            }

            if (parsed.weightKg !== null) {
              updateActiveExercise(targetEx.exercise_id, targetSetIdx, 'weight_kg', parsed.weightKg);
            }
            if (parsed.reps !== null) {
              updateActiveExercise(targetEx.exercise_id, targetSetIdx, 'reps', parsed.reps);
            }
            if (parsed.rpe !== null) {
              updateActiveExercise(targetEx.exercise_id, targetSetIdx, 'rpe', parsed.rpe);
            }

            showToast(
              `✓ Serie actualizada: ${parsed.weightKg ?? '-'} kg x ${parsed.reps ?? '-'} reps ${
                parsed.rpe ? `(RPE ${parsed.rpe})` : ''
              }`,
              'success'
            );
          }
        } else {
          showToast(`No se detectó peso o reps en: "${speechResult}"`, 'warning');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Error o permiso denegado en el micrófono', 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      showToast('No se pudo inicializar el micrófono', 'error');
    }
  };

  // Exercise guide modal state
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideData, setGuideData] = useState<MuscleWikiExercise | null>(null);

  const handleOpenGuide = async (exerciseId: string) => {
    setGuideOpen(true);
    setGuideLoading(true);
    setGuideData(null);
    try {
      const details = await MuscleWikiService.getExerciseDetails(exerciseId);
      setGuideData(details);
    } catch (e) {
      console.error(e);
    } finally {
      setGuideLoading(false);
    }
  };

  const handleCloseGuide = () => {
    setGuideOpen(false);
    setGuideData(null);
  };

  // PR detection (uses history from store)
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
        playMultipleBeeps(3, 880, 0.1, 100);
      } else {
        playMultipleBeeps(1, 440, 0.05);
      }
    } else {
      setTimerStart(null);
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    try {
      const finishedSession = await finishSession(user.id, notes || undefined, difficulty);

      const updatedSessions = useWorkoutStore.getState().sessions;
      const updatedHistory = useWorkoutStore.getState().workoutSetsHistory;
      const sessionsCount = updatedSessions.length;

      const currentStreak = (() => {
        if (!updatedSessions.length) return 0;
        let count = 0;
        const today = new Date();
        const uniqueDays = [...new Set(updatedSessions.map((s) => s.started_at.split('T')[0]))];
        for (let i = 0; i < uniqueDays.length; i++) {
          const expected = new Date(today);
          expected.setDate(today.getDate() - i);
          if (uniqueDays.includes(expected.toISOString().split('T')[0])) {
            count++;
          } else if (i > 1) {
            break;
          }
        }
        return count;
      })();

      const sessionVolume = finishedSession.total_volume_kg || 0;
      const hasAnyPR = updatedHistory
        .filter((s) => s.session_id === finishedSession.id)
        .some((s) => s.is_pr);

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

  if (!activeSession) return null;

  return (
    <div className="space-y-6 relative">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start sticky top-0 bg-slate-900/80 backdrop-blur-md pt-2 pb-4 z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{activeSession.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="status-badge inline-block">En Progreso</div>
            <ActiveSessionTimer startedAt={activeSession.started_at} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            title="Dictar serie por voz"
            className={cn(
              'p-2 glass rounded-full transition-all flex items-center justify-center',
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                : 'text-brand-blue hover:text-white border-brand-blue/30'
            )}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={cancelSession}
            className="p-2 glass rounded-full text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Rest Timer ─────────────────────────────────────────────────── */}
      <RestTimer startTime={timerStart} onClear={() => setTimerStart(null)} />

      {/* ── Exercise List ───────────────────────────────────────────────── */}
      <div className="space-y-8">
        {activeSession.exercises.map((ex) => (
          <div key={ex.exercise_id}>
            <ExerciseBlock
              exercise={ex}
              workoutSetsHistory={workoutSetsHistory}
              onGuideOpen={handleOpenGuide}
              onToggleSet={handleToggleSet}
            />
          </div>
        ))}

        <AddExerciseBtn onAdd={addExerciseToActive} />
      </div>

      {/* ── Finish Section ──────────────────────────────────────────────── */}
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
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                Dificultad percibida (1-10)
              </p>
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

      {/* ── Exercise Guide Modal ────────────────────────────────────────── */}
      <ExerciseGuideModal
        isOpen={guideOpen}
        isLoading={guideLoading}
        exerciseData={guideData}
        onClose={handleCloseGuide}
      />
    </div>
  );
}
