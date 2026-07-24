import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Dumbbell } from 'lucide-react';

interface VolumeDataPoint {
  name: string;
  vol: number;
}

interface VolumeChartCardProps {
  volumeData: VolumeDataPoint[];
}

export default function VolumeChartCard({ volumeData }: VolumeChartCardProps) {
  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Dumbbell size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Progreso de Volumen (kg)</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Total por sesión
        </span>
      </div>

      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={volumeData}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: number) => [`${val.toLocaleString()} kg`, 'Volumen']}
            />
            <Area
              type="monotone"
              dataKey="vol"
              stroke="#38bdf8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#volGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
