import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';
import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise } from '../../infrastructure/supabase/types';

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
  isLoading: boolean;

  // Actions — Sessions
  fetchSessions: (userId: string) => Promise<void>;
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
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessions: [],
  routines: [],
  activeSession: null,
  isLoading: false,

  fetchSessions: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(100);

    if (!error && data) set({ sessions: data });
    set({ isLoading: false });
  },

  startSession: (routine) => {
    const exercises: ActiveExercise[] = (routine?.exercises || []).map((re) => ({
      exercise_id: re.exercise_id,
      sets: Array.from({ length: re.default_sets || 3 }, (_, i) => ({
        id: `temp-${Date.now()}-${i}`,
        session_id: '',
        exercise_id: re.exercise_id,
        set_number: i + 1,
        reps: null,
        weight_kg: re.default_weight_kg || 0,
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
      })),
    }));

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
    const { activeSession } = get();
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

    // Insertar todas las series completadas
    const setsToInsert = activeSession.exercises.flatMap((ex) =>
      ex.sets
        .filter((s) => s.is_completed)
        .map((set, idx) => ({
          session_id: session.id,
          exercise_id: ex.exercise_id,
          set_number: idx + 1,
          reps: set.reps,
          weight_kg: set.weight_kg,
          rpe: set.rpe,
          rir: set.rir,
          is_completed: true,
          is_warmup: set.is_warmup,
          is_pr: set.is_pr,
          e1rm_kg: set.reps && set.weight_kg ? set.weight_kg * (1 + set.reps / 30) : null,
        }))
    );

    if (setsToInsert.length > 0) {
      await supabase.from('workout_sets').insert(setsToInsert);
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
      const newExercise: ActiveExercise = {
        exercise_id: exerciseId,
        sets: [
          {
            id: `temp-${Date.now()}`,
            session_id: '',
            exercise_id: exerciseId,
            set_number: 1,
            reps: null,
            weight_kg: 0,
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
}));
