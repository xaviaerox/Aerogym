import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface VolumeDataPoint {
  date: string;
  volume: number;
}

interface VolumeTrendsWidgetProps {
  data: VolumeDataPoint[];
  totalVolume: number;
}

export const VolumeTrendsWidget: React.FC<VolumeTrendsWidgetProps> = React.memo(({
  data,
  totalVolume,
}) => {
  return (
    <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Volumen de Carga Acumulado
          </h3>
          <p className="text-xl font-bold text-white tracking-tight mt-0.5">
            {totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
          <TrendingUp size={20} className="text-brand-blue" />
        </div>
      </div>

      <div className="h-44 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Sin sesiones registradas aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVolumeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
});

VolumeTrendsWidget.displayName = 'VolumeTrendsWidget';
