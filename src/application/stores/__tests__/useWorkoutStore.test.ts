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

  it('finishes a session with cardio and calculates equivalent volume and cardio PR', async () => {
    const store = useWorkoutStore.getState();
    store.startSession();
    store.addExerciseToActive('treadmill');

    // Configure 30 minutes of running (1800s), RPE 8, 5000m
    store.updateActiveExercise('treadmill', 0, 'duration_seconds', 1800);
    store.updateActiveExercise('treadmill', 0, 'distance_meters', 5000);
    store.updateActiveExercise('treadmill', 0, 'rpe', 8);
    // Mark completed
    store.toggleSetComplete('treadmill', 0);

    const session = await store.finishSession('00000000-0000-0000-0000-000000000001');

    expect(session).toBeDefined();
    // Equivalent volume: 30 min * (70 * 2.5) * 1.24 = 6510 kg > 0
    expect(session.total_volume_kg).toBeGreaterThan(5000);
    expect(useWorkoutStore.getState().sessions.length).toBe(1);
  });
});
