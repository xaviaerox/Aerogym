import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { WorkoutSet } from '../../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../../constants/exercises';

interface MuscleDistributionChartProps {
  workoutSets: WorkoutSet[];
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#64748b', '#84cc16', '#a855f7'
];

export default function MuscleDistributionChart({ workoutSets }: MuscleDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!workoutSets.length) return [];

    const muscleCounts: Record<string, number> = {};

    workoutSets.forEach((set) => {
      if (!set.is_completed) return;
      const ex = BASE_EXERCISES.find((e) => e.id === set.exercise_id);
      const mg = ex ? ex.muscleGroup : 'Otros';
      muscleCounts[mg] = (muscleCounts[mg] || 0) + 1;
    });

    return Object.entries(muscleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [workoutSets]);

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
        No hay datos de series completadas para mostrar la distribución muscular.
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex flex-col md:flex-row items-center justify-center gap-4">
      <div className="w-full md:w-1/2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '1rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value} series`, 'Volumen']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 text-xs">
        {chartData.slice(0, 6).map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-slate-300 font-medium truncate">{item.name}</span>
            <span className="ml-auto font-bold text-slate-400">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
