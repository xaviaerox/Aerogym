import React from 'react';
import { Footprints, Moon, Activity, Flame, ShieldCheck } from 'lucide-react';
import type { DailyHealth } from '../../infrastructure/supabase/types';
import { cn } from '../../lib/utils';

interface HealthTrendsCardProps {
  dailyHealth: DailyHealth[];
  avgSleep: number;
  maxSteps: number;
}

export default function HealthTrendsCard({
  dailyHealth,
  avgSleep,
}: HealthTrendsCardProps) {
  const recentHealth = dailyHealth.slice(-7);
  
  // Calculate real 7-day averages
  const healthWithSteps = recentHealth.filter((h) => h.steps > 0);
  const avgSteps7d = healthWithSteps.length > 0
    ? Math.round(healthWithSteps.reduce((acc, h) => acc + h.steps, 0) / healthWithSteps.length)
    : 0;

  const stepGoal = 10000;
  const stepGoalPct = Math.min(100, Math.round((avgSteps7d / stepGoal) * 100));

  const sleepStatus = avgSleep >= 7.5
    ? { label: 'Óptimo', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    : avgSleep >= 6.5
    ? { label: 'Aceptable', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }
    : { label: 'Insuficiente', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Tendencias de Salud (7d)</h3>
            <p className="text-[10px] text-slate-400">Hábitos biológicos y recuperación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Media Sueño */}
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
              <Moon size={14} />
              <span>Media Sueño</span>
            </div>
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md font-extrabold border', sleepStatus.color)}>
              {sleepStatus.label}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-50">
            {avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : 'N/D'}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Rango recomendado: 7.5 - 9.0h</span>
        </div>

        {/* Promedio Pasos 7d */}
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Footprints size={14} />
              <span>Media Pasos (7d)</span>
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-400">
              {stepGoalPct}%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-50">
            {avgSteps7d > 0 ? avgSteps7d.toLocaleString() : 'N/D'}
          </p>
          {/* Progress bar to 10k goal */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${stepGoalPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
