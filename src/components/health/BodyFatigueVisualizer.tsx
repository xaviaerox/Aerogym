import React, { useState } from 'react';
import type { MuscleFatigue } from '../../lib/fatigueEngine';
import { cn } from '../../lib/utils';
import { Activity, Info } from 'lucide-react';
import HumanBody from '../HumanBody/HumanBody';
import type { MuscleData } from '../../types/HumanBody';

interface BodyFatigueVisualizerProps {
  muscleFatigueList: MuscleFatigue[];
  overallFatiguePercent: number;
}

export default function BodyFatigueVisualizer({
  muscleFatigueList,
  overallFatiguePercent,
}: BodyFatigueVisualizerProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleFatigue | null>(null);

  const handleSelectMuscle = (muscle: MuscleData) => {
    const found = muscleFatigueList.find(
      (m) => m.muscleGroup.toLowerCase() === muscle.group.toLowerCase()
    );
    if (found) {
      setSelectedMuscle(found);
    }
  };

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/95 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-blue animate-pulse" />
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
            Mapa Anatómico 2D de Fatiga Muscular
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-full border border-white/10 text-[11px] font-mono text-slate-300">
          <span>Global:</span>
          <span
            className={cn(
              'font-extrabold',
              overallFatiguePercent > 70
                ? 'text-red-400'
                : overallFatiguePercent > 45
                ? 'text-yellow-400'
                : 'text-emerald-400'
            )}
          >
            {overallFatiguePercent}%
          </span>
        </div>
      </div>

      {/* Clean Staff-Engineered <HumanBody /> Visualizer (MuscleWiki Classic Style) */}
      <div className="relative flex justify-center items-center py-4 px-2 bg-slate-950/90 rounded-2xl border border-white/5 overflow-hidden min-h-[380px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <HumanBody
          view="all"
          fatigue={muscleFatigueList}
          onSelect={handleSelectMuscle}
          selectable
        />
      </div>

      {/* Legend & Status breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Leyenda de Fatiga:</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold text-center">
          <div className="bg-slate-800/80 border border-slate-700 text-slate-300 p-1.5 rounded-xl">
            ⚪ 0% Fresco
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-1.5 rounded-xl">
            🟢 20% Leve
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-1.5 rounded-xl">
            🟡 40-60% Medio
          </div>
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-1.5 rounded-xl">
            🔴 80-100% Crítico
          </div>
        </div>
      </div>

      {/* Selected Muscle Detail Modal / Drawer inline */}
      {selectedMuscle && (
        <div className="bg-slate-800/90 border border-white/10 p-3.5 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-100 flex items-center gap-1.5">
              <Info size={14} className="text-brand-blue" />
              {selectedMuscle.muscleGroup}
            </span>
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase',
                selectedMuscle.fatiguePercent > 80
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : selectedMuscle.fatiguePercent > 60
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : selectedMuscle.fatiguePercent > 35
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              )}
            >
              {selectedMuscle.fatiguePercent}% Fatiga
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
            <div className="bg-slate-900/50 p-2 rounded-xl border border-white/5">
              <p className="text-slate-500 font-bold uppercase text-[8px]">Series 7d</p>
              <p className="font-extrabold text-xs text-slate-100">{selectedMuscle.setsCount} series</p>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-xl border border-white/5">
              <p className="text-slate-500 font-bold uppercase text-[8px]">Volumen Total</p>
              <p className="font-extrabold text-xs text-slate-100">{selectedMuscle.volumeKg} kg</p>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-xl border border-white/5">
              <p className="text-slate-500 font-bold uppercase text-[8px]">Efectivas</p>
              <p className="font-extrabold text-xs text-slate-100">{selectedMuscle.effectiveFatigueSets} s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
