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
import { cn } from '../../lib/utils';

export type TimeFilter = 'week' | 'month' | 'all';

interface VolumeDataPoint {
  name: string;
  vol: number;
}

interface VolumeChartCardProps {
  volumeData: VolumeDataPoint[];
  filter?: TimeFilter;
  setFilter?: (f: TimeFilter) => void;
}

export default function VolumeChartCard({
  volumeData,
  filter,
  setFilter,
}: VolumeChartCardProps) {
  const maxVol = volumeData.length > 0 ? Math.max(...volumeData.map((d) => d.vol)) : 0;
  const avgVol = volumeData.length > 0 ? Math.round(volumeData.reduce((acc, d) => acc + d.vol, 0) / volumeData.length) : 0;

  return (
    <div className="glass p-4 sm:p-5 rounded-3xl space-y-4 border border-white/5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0">
            <Dumbbell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Progreso de Volumen de Carga</h3>
            <p className="text-[10px] text-slate-400">Total acumulado por sesión (kg)</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {filter && setFilter && (
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/5">
              {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                    filter === f
                      ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 text-right">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Pico Máx</span>
              <span className="text-xs font-black text-slate-200">{(maxVol / 1000).toFixed(1)}t</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Promedio</span>
              <span className="text-xs font-black text-brand-blue">{(avgVol / 1000).toFixed(1)}t</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-48 sm:h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}t` : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#f8fafc',
              }}
              formatter={(val: number) => [`${val.toLocaleString()} kg`, 'Volumen Carga']}
            />
            <Area
              type="monotone"
              dataKey="vol"
              stroke="#38bdf8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#volGrad)"
              dot={{ fill: '#38bdf8', r: 3 }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
