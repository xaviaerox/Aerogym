import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WorkoutSession } from '../../infrastructure/supabase/types';

interface VolumeChartProps {
  sessions: WorkoutSession[];
}

export default function VolumeChart({ sessions }: VolumeChartProps) {
  const chartData = useMemo(() => {
    if (!sessions.length) return [];
    
    // Agrupar por fecha/semana ordenado cronológicamente
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    );

    return sorted.slice(-12).map((s) => {
      const dateObj = new Date(s.started_at);
      const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
      return {
        date: label,
        volumen: Math.round(Number(s.total_volume_kg || 0)),
        nombre: s.name,
      };
    });
  }, [sessions]);

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
        No hay suficientes sesiones para mostrar el gráfico de volumen.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            formatter={(value: any) => [`${value} kg`, 'Volumen Total']}
          />
          <Bar dataKey="volumen" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
