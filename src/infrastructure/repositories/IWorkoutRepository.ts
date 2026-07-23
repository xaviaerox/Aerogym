import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise } from '../supabase/types';

export interface IWorkoutRepository {
  fetchSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;
  fetchWorkoutHistory(userId: string): Promise<WorkoutSet[]>;
  saveSession(
    session: Omit<WorkoutSession, 'id' | 'created_at'>,
    sets: Omit<WorkoutSet, 'id' | 'logged_at'>[]
  ): Promise<WorkoutSession>;
  updatePastSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void>;
  deletePastSession(sessionId: string): Promise<void>;
  saveSessionEdits(
    sessionId: string,
    sessionUpdates: Partial<WorkoutSession>,
    exercises: { exercise_id: string; sets: Partial<WorkoutSet>[] }[]
  ): Promise<void>;

  fetchRoutines(userId: string): Promise<(Routine & { exercises: RoutineExercise[] })[]>;
  createRoutine(userId: string, name: string, description?: string): Promise<Routine>;
  deleteRoutine(routineId: string): Promise<void>;
  updateRoutineExercises(routineId: string, exercises: Omit<RoutineExercise, 'id'>[]): Promise<void>;
}
