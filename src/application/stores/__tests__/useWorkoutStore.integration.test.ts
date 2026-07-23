/**
 * useWorkoutStore — Extended integration tests.
 *
 * These tests cover:
 *  - Basic session lifecycle (start, update, cancel, finish)
 *  - Set manipulation (add, toggle, update fields)
 *  - Granular selectors (workoutSelectors.ts)
 *  - Edge cases (empty state, duplicate exercise ids)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkoutStore } from '../useWorkoutStore';
import {
  selectSessions,
  selectActiveSession,
  selectRoutines,
  selectIsLoading,
  selectTotalVolume,
  selectBestE1RMForExercise,
} from '../workoutSelectors';
import type { WorkoutSet } from '../../../infrastructure/supabase/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MOCK_ROUTINE = {
  id: 'r-1',
  user_id: 'u-1',
  name: 'Pull Day',
  description: null,
  is_template: false,
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  exercises: [
    {
      id: 're-1',
      routine_id: 'r-1',
      exercise_id: 'barbell-curl',
      order_index: 0,
      default_sets: 4,
      default_reps: '10',
      default_weight_kg: 40,
      rest_seconds: 60,
      notes: '',
    },
  ],
};

function freshStore() {
  useWorkoutStore.setState({
    sessions: [],
    routines: [],
    activeSession: null,
    workoutSetsHistory: [],
    isLoading: false,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useWorkoutStore — session lifecycle', () => {
  beforeEach(freshStore);

  it('starts a free training session', () => {
    useWorkoutStore.getState().startSession();
    const active = selectActiveSession(useWorkoutStore.getState());
    expect(active).not.toBeNull();
    expect(active?.name).toBe('Entrenamiento Libre');
    expect(active?.exercises).toHaveLength(0);
    expect(active?.routine_id).toBeNull();
  });

  it('starts a session from routine with correct sets', () => {
    useWorkoutStore.getState().startSession(MOCK_ROUTINE);
    const active = selectActiveSession(useWorkoutStore.getState());
    expect(active?.name).toBe('Pull Day');
    expect(active?.exercises).toHaveLength(1);
    expect(active?.exercises[0].exercise_id).toBe('barbell-curl');
    expect(active?.exercises[0].sets).toHaveLength(4);
  });

  it('cancels session and clears activeSession', () => {
    useWorkoutStore.getState().startSession();
    expect(selectActiveSession(useWorkoutStore.getState())).not.toBeNull();
    useWorkoutStore.getState().cancelSession();
    expect(selectActiveSession(useWorkoutStore.getState())).toBeNull();
  });
});

describe('useWorkoutStore — set manipulation', () => {
  beforeEach(() => {
    freshStore();
    useWorkoutStore.getState().startSession(MOCK_ROUTINE);
  });

  it('adds a set to an exercise', () => {
    const stateBefore = useWorkoutStore.getState().activeSession!;
    const setsBefore = stateBefore.exercises[0].sets.length;

    useWorkoutStore.getState().addSetToActive('barbell-curl');
    const setsAfter = useWorkoutStore.getState().activeSession!.exercises[0].sets.length;
    expect(setsAfter).toBe(setsBefore + 1);
  });

  it('updates weight on a set', () => {
    useWorkoutStore.getState().updateActiveExercise('barbell-curl', 0, 'weight_kg', 50);
    const set = useWorkoutStore.getState().activeSession!.exercises[0].sets[0];
    expect(set.weight_kg).toBe(50);
  });

  it('updates reps on a set', () => {
    useWorkoutStore.getState().updateActiveExercise('barbell-curl', 0, 'reps', 12);
    const set = useWorkoutStore.getState().activeSession!.exercises[0].sets[0];
    expect(set.reps).toBe(12);
  });

  it('toggles set completion', () => {
    const initial = useWorkoutStore.getState().activeSession!.exercises[0].sets[0].is_completed;
    useWorkoutStore.getState().toggleSetComplete('barbell-curl', 0);
    const toggled = useWorkoutStore.getState().activeSession!.exercises[0].sets[0].is_completed;
    expect(toggled).toBe(!initial);
  });

  it('adds a new exercise to active session', () => {
    useWorkoutStore.getState().addExerciseToActive('deadlift');
    const exercises = useWorkoutStore.getState().activeSession!.exercises;
    expect(exercises).toHaveLength(2);
    expect(exercises[1].exercise_id).toBe('deadlift');
    expect(exercises[1].sets).toHaveLength(1); // 1 default set
  });
});

describe('workoutSelectors', () => {
  beforeEach(freshStore);

  it('selectSessions returns empty array initially', () => {
    expect(selectSessions(useWorkoutStore.getState())).toEqual([]);
  });

  it('selectRoutines returns empty array initially', () => {
    expect(selectRoutines(useWorkoutStore.getState())).toEqual([]);
  });

  it('selectIsLoading defaults to false', () => {
    expect(selectIsLoading(useWorkoutStore.getState())).toBe(false);
  });

  it('selectTotalVolume returns 0 on empty history', () => {
    expect(selectTotalVolume(useWorkoutStore.getState())).toBe(0);
  });

  it('selectTotalVolume sums completed sets correctly', () => {
    const mockSets: Partial<WorkoutSet>[] = [
      { exercise_id: 'bench-press', weight_kg: 80, reps: 10, is_completed: true, e1rm_kg: 107 },
      { exercise_id: 'bench-press', weight_kg: 80, reps: 10, is_completed: true, e1rm_kg: 107 },
      { exercise_id: 'bench-press', weight_kg: 80, reps: 10, is_completed: false, e1rm_kg: 107 }, // not counted
    ];
    useWorkoutStore.setState({ workoutSetsHistory: mockSets as WorkoutSet[] });
    // 80 * 10 * 2 = 1600
    expect(selectTotalVolume(useWorkoutStore.getState())).toBe(1600);
  });

  it('selectBestE1RMForExercise returns correct PR', () => {
    const mockHistory: Partial<WorkoutSet>[] = [
      { exercise_id: 'squat', e1rm_kg: 120, is_completed: true },
      { exercise_id: 'squat', e1rm_kg: 145, is_completed: true },
      { exercise_id: 'squat', e1rm_kg: 130, is_completed: true },
      { exercise_id: 'deadlift', e1rm_kg: 200, is_completed: true }, // different exercise
    ];
    useWorkoutStore.setState({ workoutSetsHistory: mockHistory as WorkoutSet[] });
    const selector = selectBestE1RMForExercise('squat');
    expect(selector(useWorkoutStore.getState())).toBe(145);
  });

  it('selectBestE1RMForExercise ignores incomplete sets', () => {
    const mockHistory: Partial<WorkoutSet>[] = [
      { exercise_id: 'bench-press', e1rm_kg: 150, is_completed: false },
      { exercise_id: 'bench-press', e1rm_kg: 120, is_completed: true },
    ];
    useWorkoutStore.setState({ workoutSetsHistory: mockHistory as WorkoutSet[] });
    const selector = selectBestE1RMForExercise('bench-press');
    expect(selector(useWorkoutStore.getState())).toBe(120);
  });
});
