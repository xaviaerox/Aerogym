import React from 'react';
import { Plus, Droplets, Footprints, Moon, Activity } from 'lucide-react';
import type { DailyHealth } from '../../infrastructure/supabase/types';

interface QuickHealthStatsProps {
  todayHealth: DailyHealth | null | undefined;
  onOpenLogger: () => void;
}

export default function QuickHealthStats({
  todayHealth,
  onOpenLogger,
}: QuickHealthStatsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
        Log del Día
      </h2>
      <button
        onClick={onOpenLogger}
        className="w-full p-5 glass border-white/5 hover:border-brand-blue/20 rounded-3xl text-left flex justify-between items-center transition-all group"
      >
        <div className="space-y-1">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            Registrar métricas diarias
            <Plus size={16} className="text-brand-blue group-hover:rotate-90 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {todayHealth
              ? 'Actualiza tu agua, pasos, sueño o peso corporal'
              : 'Registra agua, pasos, sueño y energía en 10 seg'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {todayHealth?.water_ml ? (
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Droplets size={16} />
            </div>
          ) : null}
          {todayHealth?.steps ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Footprints size={16} />
            </div>
          ) : null}
          {todayHealth?.sleep_hours ? (
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Moon size={16} />
            </div>
          ) : null}
          <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
            <Activity size={16} />
          </div>
        </div>
      </button>
    </section>
  );
}
