import { supabase } from '../supabase/client';
import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise } from '../supabase/types';
import type { IWorkoutRepository } from './IWorkoutRepository';
import { syncEngine } from '../sync/SyncEngine';
import { enqueueSyncAction, getItemIndexedDB, setItemIndexedDB, STORE_SESSIONS } from '../../lib/storageIndexedDB';

export class SupabaseWorkoutRepository implements IWorkoutRepository {
  async fetchSessions(userId: string, limit = 100): Promise<WorkoutSession[]> {
    if (syncEngine.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          await setItemIndexedDB(STORE_SESSIONS, `user_${userId}`, data);
          return data;
        }
      } catch (e) {
        console.warn('Network error fetching sessions, loading from cache:', e);
      }
    }

    const cached = await getItemIndexedDB<WorkoutSession[]>(STORE_SESSIONS, `user_${userId}`);
    return cached || [];
  }

  async fetchWorkoutHistory(userId: string): Promise<WorkoutSet[]> {
    if (syncEngine.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('workout_sets')
          .select('*, workout_sessions!inner(user_id)')
          .eq('workout_sessions.user_id', userId);

        if (!error && data) {
          const sets = data.map(({ workout_sessions, ...set }) => set) as WorkoutSet[];
          await setItemIndexedDB('sets_cache', `user_${userId}`, sets);
          return sets;
        }
      } catch (e) {
        console.warn('Network error fetching workout history, loading from cache:', e);
      }
    }

    const cached = await getItemIndexedDB<WorkoutSet[]>('sets_cache', `user_${userId}`);
    return cached || [];
  }

  async saveSession(
    session: Omit<WorkoutSession, 'id' | 'created_at'>,
    sets: Omit<WorkoutSet, 'id' | 'logged_at'>[]
  ): Promise<WorkoutSession> {
    const tempId = `session-${Date.now()}`;
    const newSession: WorkoutSession = {
      ...session,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    if (!syncEngine.isOnline()) {
      await enqueueSyncAction({
        type: 'SAVE_SESSION',
        payload: { session, sets },
      });

      // Update local cache
      const cached = (await getItemIndexedDB<WorkoutSession[]>(STORE_SESSIONS, `user_${session.user_id}`)) || [];
      await setItemIndexedDB(STORE_SESSIONS, `user_${session.user_id}`, [newSession, ...cached]);

      return newSession;
    }

    try {
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
        if (setsError) console.warn('Error inserting sets online:', setsError);
      }

      return sessionData;
    } catch (e) {
      console.warn('Online insert failed, enqueuing for offline sync:', e);
      await enqueueSyncAction({
        type: 'SAVE_SESSION',
        payload: { session, sets },
      });
      return newSession;
    }
  }

  async updatePastSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    if (!syncEngine.isOnline()) {
      await enqueueSyncAction({
        type: 'UPDATE_SESSION',
        payload: { sessionId, updates },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (e) {
      await enqueueSyncAction({
        type: 'UPDATE_SESSION',
        payload: { sessionId, updates },
      });
    }
  }

  async deletePastSession(sessionId: string): Promise<void> {
    if (!syncEngine.isOnline()) {
      await enqueueSyncAction({
        type: 'DELETE_SESSION',
        payload: { sessionId },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (e) {
      await enqueueSyncAction({
        type: 'DELETE_SESSION',
        payload: { sessionId },
      });
    }
  }

  async fetchRoutines(userId: string): Promise<(Routine & { exercises: RoutineExercise[] })[]> {
    if (syncEngine.isOnline()) {
      try {
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

        const routines = routinesData.map((r) => ({
          ...r,
          exercises: (exercisesData || []).filter((e) => e.routine_id === r.id),
        }));

        await setItemIndexedDB('routines_cache', `user_${userId}`, routines);
        return routines;
      } catch (e) {
        console.warn('Error fetching routines online, using cache:', e);
      }
    }

    const cached = await getItemIndexedDB<(Routine & { exercises: RoutineExercise[] })[]>('routines_cache', `user_${userId}`);
    return cached || [];
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
