import { supabase } from '../supabase/client';
import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise } from '../supabase/types';
import type { IWorkoutRepository } from './IWorkoutRepository';

export class SupabaseWorkoutRepository implements IWorkoutRepository {
  async fetchSessions(userId: string, limit = 100): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async fetchWorkoutHistory(userId: string): Promise<WorkoutSet[]> {
    const { data, error } = await supabase
      .from('workout_sets')
      .select('*, workout_sessions!inner(user_id)')
      .eq('workout_sessions.user_id', userId);

    if (error) throw error;
    if (!data) return [];

    return data.map(({ workout_sessions, ...set }) => set) as WorkoutSet[];
  }

  async saveSession(
    session: Omit<WorkoutSession, 'id' | 'created_at'>,
    sets: Omit<WorkoutSet, 'id' | 'logged_at'>[]
  ): Promise<WorkoutSession> {
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert(session)
      .select()
      .single();

    if (sessionError || !sessionData) throw sessionError || new Error('Failed to insert session');

    if (sets.length > 0) {
      const setsToInsert = sets.map((set) => ({
        ...set,
        session_id: sessionData.id,
      }));

      const { error: setsError } = await supabase.from('workout_sets').insert(setsToInsert);
      if (setsError) throw setsError;
    }

    return sessionData;
  }

  async updatePastSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  async deletePastSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  async fetchRoutines(userId: string): Promise<(Routine & { exercises: RoutineExercise[] })[]> {
    const { data: routinesData, error: routinesError } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (routinesError) throw routinesError;

    if (!routinesData || routinesData.length === 0) return [];

    const routineIds = routinesData.map((r) => r.id);
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('routine_exercises')
      .select('*')
      .in('routine_id', routineIds)
      .order('order_index', { ascending: true });

    if (exercisesError) throw exercisesError;

    return routinesData.map((r) => ({
      ...r,
      exercises: (exercisesData || []).filter((e) => e.routine_id === r.id),
    }));
  }

  async createRoutine(userId: string, name: string, description?: string): Promise<Routine> {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, name, description })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to create routine');
    return data;
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .update({ is_archived: true })
      .eq('id', routineId);

    if (error) throw error;
  }

  async updateRoutineExercises(routineId: string, exercises: Omit<RoutineExercise, 'id'>[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routineId);

    if (deleteError) throw deleteError;

    if (exercises.length > 0) {
      const { error: insertError } = await supabase
        .from('routine_exercises')
        .insert(exercises.map((e, index) => ({ ...e, order_index: index })));

      if (insertError) throw insertError;
    }
  }
}

export const supabaseWorkoutRepository = new SupabaseWorkoutRepository();
