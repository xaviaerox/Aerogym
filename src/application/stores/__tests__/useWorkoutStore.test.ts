import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../useWorkoutStore';

describe('useWorkoutStore', () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      sessions: [],
      routines: [],
      activeSession: null,
      workoutSetsHistory: [],
      isLoading: false,
    });
  });

  it('starts a workout session with free training when no routine provided', () => {
    const store = useWorkoutStore.getState();
    store.startSession();

    const active = useWorkoutStore.getState().activeSession;
    expect(active).not.toBeNull();
    expect(active?.name).toBe('Entrenamiento Libre');
    expect(active?.exercises).toEqual([]);
  });

  it('starts a workout session with routine exercises', () => {
    const mockRoutine = {
      id: 'routine-1',
      user_id: 'user-1',
      name: 'Push Day',
      description: 'Empuje',
      is_template: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: [
        {
          id: 're-1',
          routine_id: 'routine-1',
          exercise_id: 'bench-press',
          order_index: 0,
          default_sets: 3,
          default_reps: '8-12',
          default_weight_kg: 60,
          rest_seconds: 90,
          notes: '',
        },
      ],
    };

    useWorkoutStore.getState().startSession(mockRoutine);
    const active = useWorkoutStore.getState().activeSession;

    expect(active).not.toBeNull();
    expect(active?.name).toBe('Push Day');
    expect(active?.exercises.length).toBe(1);
    expect(active?.exercises[0].exercise_id).toBe('bench-press');
    expect(active?.exercises[0].sets.length).toBe(3);
  });

  it('cancels active session', () => {
    useWorkoutStore.getState().startSession();
    expect(useWorkoutStore.getState().activeSession).not.toBeNull();

    useWorkoutStore.getState().cancelSession();
    expect(useWorkoutStore.getState().activeSession).toBeNull();
  });
});
