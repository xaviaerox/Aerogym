import React from 'react';
import { Footprints, Moon, Activity } from 'lucide-react';
import type { DailyHealth } from '../../infrastructure/supabase/types';

interface HealthTrendsCardProps {
  dailyHealth: DailyHealth[];
  avgSleep: number;
  maxSteps: number;
}

export default function HealthTrendsCard({
  dailyHealth,
  avgSleep,
  maxSteps,
}: HealthTrendsCardProps) {
  const recentHealth = dailyHealth.slice(-7);

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Activity size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Tendencias de Salud</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
            <Moon size={14} />
            <span>Sueño Medio</span>
          </div>
          <p className="text-xl font-bold text-slate-50">
            {avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : 'N/D'}
          </p>
          <span className="text-[10px] text-slate-400 block">Objetivo: 7-8h</span>
        </div>

        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <Footprints size={14} />
            <span>Récord Pasos</span>
          </div>
          <p className="text-xl font-bold text-slate-50">
            {maxSteps > 0 ? maxSteps.toLocaleString() : 'N/D'}
          </p>
          <span className="text-[10px] text-slate-400 block">Máximo registrado</span>
        </div>
      </div>
    </div>
  );
}
