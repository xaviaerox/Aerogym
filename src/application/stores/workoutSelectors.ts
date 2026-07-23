/**
 * workoutSelectors.ts — Granular Zustand selectors for useWorkoutStore.
 *
 * Each selector subscribes a component only to the slice of state it needs,
 * preventing unnecessary re-renders when unrelated state changes.
 *
 * Usage:
 *   const sessions = useWorkoutStore(selectSessions);
 *   const activeSession = useWorkoutStore(selectActiveSession);
 */
import type { WorkoutState } from './useWorkoutStore';

// ─── State Slices ────────────────────────────────────────────────────────────
export const selectSessions = (s: WorkoutState) => s.sessions;
export const selectActiveSession = (s: WorkoutState) => s.activeSession;
export const selectWorkoutSetsHistory = (s: WorkoutState) => s.workoutSetsHistory;
export const selectRoutines = (s: WorkoutState) => s.routines;
export const selectIsLoading = (s: WorkoutState) => s.isLoading;

// ─── Action Selectors ────────────────────────────────────────────────────────
// Actions are stable references in Zustand (they never change between renders).
// Selecting only actions prevents the consumer from re-rendering on any state change.
export const selectSessionActions = (s: WorkoutState) => ({
  fetchSessions: s.fetchSessions,
  fetchWorkoutHistory: s.fetchWorkoutHistory,
  startSession: s.startSession,
  finishSession: s.finishSession,
  cancelSession: s.cancelSession,
  addExerciseToActive: s.addExerciseToActive,
  updateActiveExercise: s.updateActiveExercise,
  addSetToActive: s.addSetToActive,
  toggleSetComplete: s.toggleSetComplete,
  updatePastSession: s.updatePastSession,
  deletePastSession: s.deletePastSession,
  saveSessionEdits: s.saveSessionEdits,
});

export const selectRoutineActions = (s: WorkoutState) => ({
  fetchRoutines: s.fetchRoutines,
  createRoutine: s.createRoutine,
  deleteRoutine: s.deleteRoutine,
  updateRoutineExercises: s.updateRoutineExercises,
});

// ─── Derived Selectors ───────────────────────────────────────────────────────
/** Returns the number of completed sessions. */
export const selectSessionCount = (s: WorkoutState) => s.sessions.length;

/** Returns the total volume across all recorded sets. */
export const selectTotalVolume = (s: WorkoutState) =>
  s.workoutSetsHistory
    .filter((set) => set.is_completed)
    .reduce((acc, set) => acc + (Number(set.weight_kg) || 0) * (Number(set.reps) || 0), 0);

/** Returns the personal record e1RM for a given exercise. */
export const selectBestE1RMForExercise =
  (exerciseId: string) => (s: WorkoutState) =>
    s.workoutSetsHistory
      .filter((set) => set.exercise_id === exerciseId && set.is_completed)
      .reduce((max, set) => Math.max(max, Number(set.e1rm_kg) || 0), 0);
