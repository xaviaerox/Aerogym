import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';
import { supabaseWorkoutRepository } from '../../infrastructure/repositories/SupabaseWorkoutRepository';
import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise } from '../../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../../constants/exercises';

// Tipos internos del store (enriquecidos para la UI)
export interface ActiveSet extends WorkoutSet {
  isNew?: boolean; // Marcado si se acaba de añadir en la sesión
}

export interface ActiveExercise {
  exercise_id: string;
  sets: ActiveSet[];
}

export interface ActiveSession {
  id: string;
  name: string;
  routine_id: string | null;
  started_at: string;
  exercises: ActiveExercise[];
}

interface WorkoutState {
  sessions: WorkoutSession[];
  routines: (Routine & { exercises: RoutineExercise[] })[];
  activeSession: ActiveSession | null;
  workoutSetsHistory: WorkoutSet[];
  isLoading: boolean;

  // Actions — Sessions
  fetchSessions: (userId: string) => Promise<void>;
  fetchWorkoutHistory: (userId: string) => Promise<void>;
  startSession: (routine?: Routine & { exercises: RoutineExercise[] }) => void;
  finishSession: (userId: string, notes?: string, difficulty?: number) => Promise<WorkoutSession>;
  cancelSession: () => void;
  updateActiveExercise: (exerciseId: string, setIndex: number, field: keyof ActiveSet, value: unknown) => void;
  addSetToActive: (exerciseId: string) => void;
  toggleSetComplete: (exerciseId: string, setIndex: number) => void;
  addExerciseToActive: (exerciseId: string) => void;

  // Actions — Routines
  fetchRoutines: (userId: string) => Promise<void>;
  createRoutine: (userId: string, name: string, description?: string) => Promise<Routine>;
  deleteRoutine: (routineId: string) => Promise<void>;
  updateRoutineExercises: (routineId: string, exercises: Omit<RoutineExercise, 'id'>[]) => Promise<void>;

  // Actions — Past Sessions
  updatePastSession: (sessionId: string, updates: Partial<WorkoutSession>) => Promise<void>;
  deletePastSession: (sessionId: string) => Promise<void>;
  saveSessionEdits: (
    sessionId: string, 
    sessionUpdates: Partial<WorkoutSession>, 
    exercises: { exercise_id: string; sets: Partial<WorkoutSet>[] }[]
  ) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessions: [],
  routines: [],
  activeSession: null,
  workoutSetsHistory: [],
  isLoading: false,

  fetchSessions: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await supabaseWorkoutRepository.fetchSessions(userId);
      set({ sessions: data });
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWorkoutHistory: async (userId) => {
    try {
      const sets = await supabaseWorkoutRepository.fetchWorkoutHistory(userId);
      set({ workoutSetsHistory: sets });
    } catch (e) {
      console.error('Error fetching workout history:', e);
    }
  },

  startSession: (routine) => {
    const { workoutSetsHistory } = get();
    const exercises: ActiveExercise[] = (routine?.exercises || []).map((re) => {
      const isCardio = BASE_EXERCISES.find((e) => e.id === re.exercise_id)?.muscleGroup === 'Cardio';

      // Buscar última serie realizada de este ejercicio en el historial
      const history = workoutSetsHistory
        .filter((s) => s.exercise_id === re.exercise_id && s.is_completed)
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
      
      const lastWeight = isCardio ? 0 : history[0]?.weight_kg ? Number(history[0].weight_kg) : (re.default_weight_kg || 0);
      const lastReps = isCardio ? null : history[0]?.reps || (re.default_reps ? parseInt(re.default_reps) : null);
      const lastDuration = history[0]?.duration_seconds || (re.default_reps && !isNaN(parseInt(re.default_reps)) ? parseInt(re.default_reps) * 60 : 600);

      const defaultSetsCount = isCardio ? 1 : (re.default_sets || 3);

      return {
        exercise_id: re.exercise_id,
        sets: Array.from({ length: defaultSetsCount }, (_, i) => ({
          id: `temp-${Date.now()}-${i}`,
          session_id: '',
          exercise_id: re.exercise_id,
          set_number: i + 1,
          reps: lastReps,
          weight_kg: lastWeight,
          rpe: null,
          rir: null,
          duration_seconds: isCardio ? lastDuration : null,
          distance_meters: null,
          is_completed: false,
          is_warmup: false,
          is_pr: false,
          e1rm_kg: null,
          logged_at: new Date().toISOString(),
          isNew: true,
        })),
      };
    });

    set({
      activeSession: {
        id: `temp-${Date.now()}`,
        name: routine?.name || 'Entrenamiento Libre',
        routine_id: routine?.id || null,
        started_at: new Date().toISOString(),
        exercises,
      },
    });
  },

  finishSession: async (userId, notes, difficulty) => {
    const { activeSession, workoutSetsHistory } = get();
    if (!activeSession) throw new Error('No active session');

    const startedAt = new Date(activeSession.started_at);
    const finishedAt = new Date();
    const durationMinutes = Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000);

    // Calcular volumen total
    let totalVolume = 0;
    activeSession.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.is_completed && set.reps && set.weight_kg) {
          totalVolume += set.reps * set.weight_kg;
        }
      });
    });

    // Crear sesión en Supabase
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        routine_id: activeSession.routine_id,
        name: activeSession.name,
        started_at: activeSession.started_at,
        finished_at: finishedAt.toISOString(),
        duration_minutes: durationMinutes,
        total_volume_kg: totalVolume,
        notes: notes || null,
        perceived_difficulty: difficulty || null,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Calcular PRs y preparar sets para insertar
    const setsToInsert = activeSession.exercises.flatMap((ex) => {
      // Buscar el mejor e1rm histórico para este ejercicio
      const historicBest = workoutSetsHistory
        .filter((s) => s.exercise_id === ex.exercise_id && s.is_completed)
        .reduce((max, s) => Math.max(max, Number(s.e1rm_kg) || 0), 0);

      const completedSets = ex.sets.filter((s) => s.is_completed);

      // Encontrar la mejor serie en esta sesión actual para este ejercicio
      let bestSetIdx = -1;
      let bestSessionE1RM = 0;
      completedSets.forEach((s, idx) => {
        if (s.reps && s.weight_kg) {
          const e1rm = s.weight_kg * (1 + s.reps / 30);
          if (e1rm > bestSessionE1RM) {
            bestSessionE1RM = e1rm;
            bestSetIdx = idx;
          }
        }
      });

      return completedSets.map((set, idx) => {
        const reps = set.reps || 0;
        const weight = set.weight_kg || 0;
        const e1rm = reps && weight ? weight * (1 + reps / 30) : null;
        const isPR = idx === bestSetIdx && e1rm !== null && e1rm > historicBest;

        return {
          session_id: session.id,
          exercise_id: ex.exercise_id,
          set_number: idx + 1,
          reps: set.reps,
          weight_kg: set.weight_kg,
          rpe: set.rpe,
          rir: set.rir,
          is_completed: true,
          is_warmup: set.is_warmup,
          is_pr: isPR,
          e1rm_kg: e1rm,
          duration_seconds: set.duration_seconds || null,
          distance_meters: set.distance_meters || null,
        };
      });
    });

    if (setsToInsert.length > 0) {
      const { data: insertedSets, error: setsError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert)
        .select();

      if (!setsError && insertedSets) {
        set((state) => ({
          workoutSetsHistory: [...state.workoutSetsHistory, ...insertedSets],
        }));
      }
    }

    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSession: null,
    }));

    return session;
  },

  cancelSession: () => set({ activeSession: null }),

  updateActiveExercise: (exerciseId, setIndex, field, value) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const sets = ex.sets.map((s, i) =>
          i === setIndex ? { ...s, [field]: value } : s
        );
        return { ...ex, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  addSetToActive: (exerciseId) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `temp-${Date.now()}`,
              session_id: '',
              exercise_id: exerciseId,
              set_number: ex.sets.length + 1,
              reps: lastSet?.reps || null,
              weight_kg: lastSet?.weight_kg || 0,
              rpe: null,
              rir: null,
              duration_seconds: null,
              distance_meters: null,
              is_completed: false,
              is_warmup: false,
              is_pr: false,
              e1rm_kg: null,
              logged_at: new Date().toISOString(),
              isNew: true,
            },
          ],
        };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  toggleSetComplete: (exerciseId, setIndex) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex) => {
        if (ex.exercise_id !== exerciseId) return ex;
        const sets = ex.sets.map((s, i) =>
          i === setIndex ? { ...s, is_completed: !s.is_completed } : s
        );
        return { ...ex, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  addExerciseToActive: (exerciseId) => {
    set((state) => {
      if (!state.activeSession) return state;

      const isCardio = BASE_EXERCISES.find((e) => e.id === exerciseId)?.muscleGroup === 'Cardio';

      // Buscar última serie realizada de este ejercicio en el historial
      const history = state.workoutSetsHistory
        .filter((s) => s.exercise_id === exerciseId && s.is_completed)
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
      
      const lastWeight = isCardio ? 0 : history[0]?.weight_kg ? Number(history[0].weight_kg) : 0;
      const lastReps = isCardio ? null : history[0]?.reps || null;
      const lastDuration = history[0]?.duration_seconds || 600;

      const newExercise: ActiveExercise = {
        exercise_id: exerciseId,
        sets: [
          {
            id: `temp-${Date.now()}`,
            session_id: '',
            exercise_id: exerciseId,
            set_number: 1,
            reps: lastReps,
            weight_kg: lastWeight,
            rpe: null,
            rir: null,
            duration_seconds: isCardio ? lastDuration : null,
            distance_meters: null,
            is_completed: false,
            is_warmup: false,
            is_pr: false,
            e1rm_kg: null,
            logged_at: new Date().toISOString(),
            isNew: true,
          },
        ],
      };
      return {
        activeSession: {
          ...state.activeSession,
          exercises: [...state.activeSession.exercises, newExercise],
        },
      };
    });
  },

  fetchRoutines: async (userId) => {
    const { data: routines, error } = await supabase
      .from('routines')
      .select('*, exercises:routine_exercises(*)')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!error && routines) {
      set({ routines: routines as (Routine & { exercises: RoutineExercise[] })[] });
    }
  },

  createRoutine: async (userId, name, description) => {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, name, description })
      .select()
      .single();

    if (error) throw error;
    set((state) => ({
      routines: [{ ...data, exercises: [] }, ...state.routines],
    }));
    return data;
  },

  deleteRoutine: async (routineId) => {
    await supabase.from('routines').delete().eq('id', routineId);
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== routineId),
    }));
  },

  updateRoutineExercises: async (routineId, exercises) => {
    await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
    if (exercises.length > 0) {
      await supabase.from('routine_exercises').insert(
        exercises.map((ex, i) => ({ ...ex, routine_id: routineId, order_index: i }))
      );
    }
    await get().fetchRoutines(get().routines[0]?.user_id);
  },

  updatePastSession: async (sessionId, updates) => {
    const { error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (!error) {
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
      }));
    } else {
      throw error;
    }
  },

  deletePastSession: async (sessionId) => {
    await supabase.from('workout_sets').delete().eq('session_id', sessionId);
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);

    if (!error) {
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        workoutSetsHistory: state.workoutSetsHistory.filter((s) => s.session_id !== sessionId),
      }));
    } else {
      throw error;
    }
  },

  saveSessionEdits: async (sessionId, sessionUpdates, exercises) => {
    const { error: deleteError } = await supabase
      .from('workout_sets')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    let totalVolume = 0;
    const setsToInsert = exercises.flatMap((ex) => {
      return (ex.sets || []).map((set, idx) => {
        const isCardio = BASE_EXERCISES.find(e => e.id === ex.exercise_id)?.muscleGroup === 'Cardio';
        const reps = isCardio ? null : (Number(set.reps) || 0);
        const weight = isCardio ? 0 : (Number(set.weight_kg) || 0);
        const e1rm = reps && weight ? weight * (1 + reps / 30) : null;

        if (!isCardio && set.is_completed && reps && weight) {
          totalVolume += reps * weight;
        }

        return {
          session_id: sessionId,
          exercise_id: ex.exercise_id,
          set_number: idx + 1,
          reps: isCardio ? null : set.reps || null,
          weight_kg: isCardio ? 0 : set.weight_kg || 0,
          rpe: set.rpe || null,
          rir: set.rir !== null && set.rir !== undefined ? set.rir : null,
          is_completed: set.is_completed ?? true,
          is_warmup: set.is_warmup ?? false,
          is_pr: set.is_pr ?? false,
          e1rm_kg: e1rm,
          duration_seconds: isCardio ? (set.duration_seconds || null) : null,
          distance_meters: isCardio ? (set.distance_meters || null) : null,
        };
      });
    });

    if (setsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert);

      if (insertError) throw insertError;
    }

    const finalUpdates = {
      ...sessionUpdates,
      total_volume_kg: totalVolume,
    };

    const { data: updatedSession, error: updateError } = await supabase
      .from('workout_sessions')
      .update(finalUpdates)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    const userId = get().sessions[0]?.user_id;
    if (userId) {
      await get().fetchSessions(userId);
      await get().fetchWorkoutHistory(userId);
    }
  },
}));
