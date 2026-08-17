import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WorkoutSet } from '../../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../../constants/exercises';

interface E1RMProgressChartProps {
  workoutSets: WorkoutSet[];
}

export default function E1RMProgressChart({ workoutSets }: E1RMProgressChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('bench-press');

  const availableExercises = useMemo(() => {
    const setExerciseIds = new Set(workoutSets.map((s) => s.exercise_id));
    return BASE_EXERCISES.filter((e) => setExerciseIds.has(e.id));
  }, [workoutSets]);

  const chartData = useMemo(() => {
    const filtered = workoutSets.filter(
      (s) => s.exercise_id === selectedExercise && s.is_completed && s.e1rm_kg
    );

    const sorted = [...filtered].sort(
      (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );

    return sorted.slice(-15).map((s) => {
      const dateObj = new Date(s.logged_at);
      return {
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        e1RM: Math.round(Number(s.e1rm_kg || 0)),
        peso: Number(s.weight_kg || 0),
        reps: s.reps,
      };
    });
  }, [workoutSets, selectedExercise]);

  return (
    <div className="w-full space-y-4">
      {/* Exercise Selector */}
      <div className="flex items-center justify-between">
        <label htmlFor="e1rm-exercise-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Seleccionar Ejercicio
        </label>
        <select
          id="e1rm-exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          {availableExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
          {!availableExercises.length && <option value="bench-press">Press de Banca</option>}
        </select>
      </div>

      {!chartData.length ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
          No hay suficientes registros de e1RM para este ejercicio.
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '1rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} kg`, 'e1RM Estimado']}
              />
              <Line
                type="monotone"
                dataKey="e1RM"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
