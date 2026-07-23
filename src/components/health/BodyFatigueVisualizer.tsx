import React, { useState } from 'react';
import type { MuscleFatigue } from '../../lib/fatigueEngine';
import { cn } from '../../lib/utils';
import { Activity, Info } from 'lucide-react';

interface BodyFatigueVisualizerProps {
  muscleFatigueList: MuscleFatigue[];
  overallFatiguePercent: number;
}

export default function BodyFatigueVisualizer({
  muscleFatigueList,
  overallFatiguePercent,
}: BodyFatigueVisualizerProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleFatigue | null>(null);

  // Mapeo rápido por nombre de grupo muscular
  const fatigueMap = new Map<string, MuscleFatigue>(
    muscleFatigueList.map((m) => [m.muscleGroup, m])
  );

  const getMuscleColor = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data) return '#334155'; // Slate-700 deshabilitado/neutro
    const pct = data.fatiguePercent;
    if (pct > 80) return '#ef4444'; // Red-500
    if (pct > 60) return '#f97316'; // Orange-500
    if (pct > 35) return '#eab308'; // Yellow-500
    return '#22c55e'; // Green-500
  };

  const getMuscleGlow = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent <= 35) return 'none';
    const color = getMuscleColor(muscleName);
    return `drop-shadow(0px 0px 6px ${color})`;
  };

  const handleMuscleClick = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (data) setSelectedMuscle(data);
  };

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/60 shadow-xl">
      {/* Header & Controls */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-blue animate-pulse" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Mapa Anatómico 2D de Fatiga
          </span>
        </div>

        {/* Switch Front / Back */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setView('front')}
            className={cn(
              'px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all',
              view === 'front'
                ? 'bg-brand-blue text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Frontal
          </button>
          <button
            onClick={() => setView('back')}
            className={cn(
              'px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all',
              view === 'back'
                ? 'bg-brand-blue text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Posterior
          </button>
        </div>
      </div>

      {/* SVG Human Body Visualizer Frame */}
      <div className="relative flex justify-center items-center py-4 bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden min-h-[310px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {view === 'front' ? (
          <svg
            viewBox="0 0 200 380"
            className="w-48 h-72 drop-shadow-2xl transition-all duration-300"
          >
            {/* Outline Silhouette (Ghost silhouette) */}
            <path
              d="M 100 20 C 115 20, 125 30, 125 48 C 125 60, 118 68, 112 72 C 130 75, 155 85, 160 110 L 175 180 L 160 185 L 148 130 L 140 200 L 135 270 L 132 350 L 105 350 L 102 240 L 98 240 L 95 350 L 68 350 L 65 270 L 60 200 L 52 130 L 40 185 L 25 180 L 40 110 C 45 85, 70 75, 88 72 C 82 68, 75 60, 75 48 C 75 30, 85 20, 100 20 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Cabeza / Cuello */}
            <ellipse cx="100" cy="45" rx="20" ry="24" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Hombro Izquierdo (Deltoides) */}
            <path
              d="M 62 82 C 50 85, 42 98, 44 115 C 48 118, 56 112, 60 100 Z"
              fill={getMuscleColor('Hombros')}
              style={{ filter: getMuscleGlow('Hombros') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Hombros')}
            >
              <title>Hombro Izquierdo (Deltoides)</title>
            </path>

            {/* Hombro Derecho (Deltoides) */}
            <path
              d="M 138 82 C 150 85, 158 98, 156 115 C 152 118, 144 112, 140 100 Z"
              fill={getMuscleColor('Hombros')}
              style={{ filter: getMuscleGlow('Hombros') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Hombros')}
            >
              <title>Hombro Derecho (Deltoides)</title>
            </path>

            {/* Pecho (Pectoral Mayor) */}
            <path
              d="M 76 84 C 90 84, 98 86, 99 108 C 84 114, 72 108, 68 96 Z"
              fill={getMuscleColor('Pecho')}
              style={{ filter: getMuscleGlow('Pecho') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Pecho')}
            >
              <title>Pectoral Izquierdo</title>
            </path>
            <path
              d="M 124 84 C 110 84, 102 86, 101 108 C 116 114, 128 108, 132 96 Z"
              fill={getMuscleColor('Pecho')}
              style={{ filter: getMuscleGlow('Pecho') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Pecho')}
            >
              <title>Pectoral Derecho</title>
            </path>

            {/* Bíceps Izquierdo */}
            <path
              d="M 44 118 C 42 135, 48 152, 54 150 C 58 140, 58 124, 52 118 Z"
              fill={getMuscleColor('Bíceps')}
              style={{ filter: getMuscleGlow('Bíceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Bíceps')}
            >
              <title>Bíceps Izquierdo</title>
            </path>

            {/* Bíceps Derecho */}
            <path
              d="M 156 118 C 158 135, 152 152, 146 150 C 142 140, 142 124, 148 118 Z"
              fill={getMuscleColor('Bíceps')}
              style={{ filter: getMuscleGlow('Bíceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Bíceps')}
            >
              <title>Bíceps Derecho</title>
            </path>

            {/* Abdominales (Core) */}
            <path
              d="M 80 115 L 120 115 L 116 172 L 84 172 Z"
              fill={getMuscleColor('Abdominales')}
              style={{ filter: getMuscleGlow('Abdominales') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Abdominales')}
            >
              <title>Abdominales</title>
            </path>

            {/* Cuádriceps Izquierdo */}
            <path
              d="M 68 185 C 64 215, 68 255, 92 258 C 96 235, 94 200, 84 185 Z"
              fill={getMuscleColor('Cuádriceps')}
              style={{ filter: getMuscleGlow('Cuádriceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Cuádriceps')}
            >
              <title>Cuádriceps Izquierdo</title>
            </path>

            {/* Cuádriceps Derecho */}
            <path
              d="M 132 185 C 136 215, 132 255, 108 258 C 104 235, 106 200, 116 185 Z"
              fill={getMuscleColor('Cuádriceps')}
              style={{ filter: getMuscleGlow('Cuádriceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Cuádriceps')}
            >
              <title>Cuádriceps Derecho</title>
            </path>

            {/* Gemelos Frontales */}
            <path
              d="M 70 275 C 66 300, 72 335, 86 335 C 88 310, 84 285, 78 275 Z"
              fill={getMuscleColor('Gemelos')}
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Izquierdo</title>
            </path>
            <path
              d="M 130 275 C 134 300, 128 335, 114 335 C 112 310, 116 285, 122 275 Z"
              fill={getMuscleColor('Gemelos')}
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Derecho</title>
            </path>
          </svg>
        ) : (
          <svg
            viewBox="0 0 200 380"
            className="w-48 h-72 drop-shadow-2xl transition-all duration-300"
          >
            {/* Outline Silhouette Back */}
            <path
              d="M 100 20 C 115 20, 125 30, 125 48 C 125 60, 118 68, 112 72 C 130 75, 155 85, 160 110 L 175 180 L 160 185 L 148 130 L 140 200 L 135 270 L 132 350 L 105 350 L 102 240 L 98 240 L 95 350 L 68 350 L 65 270 L 60 200 L 52 130 L 40 185 L 25 180 L 40 110 C 45 85, 70 75, 88 72 C 82 68, 75 60, 75 48 C 75 30, 85 20, 100 20 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Cabeza Posterior */}
            <ellipse cx="100" cy="45" rx="20" ry="24" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Espalda (Dorsal / Trapecios) */}
            <path
              d="M 76 76 C 90 70, 110 70, 124 76 C 142 90, 136 148, 120 162 L 80 162 C 64 148, 58 90, 76 76 Z"
              fill={getMuscleColor('Espalda')}
              style={{ filter: getMuscleGlow('Espalda') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Espalda')}
            >
              <title>Dorsales & Espalda Alta</title>
            </path>

            {/* Tríceps Izquierdo */}
            <path
              d="M 40 114 C 42 135, 48 155, 52 152 C 56 140, 54 120, 48 114 Z"
              fill={getMuscleColor('Tríceps')}
              style={{ filter: getMuscleGlow('Tríceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Tríceps')}
            >
              <title>Tríceps Izquierdo</title>
            </path>

            {/* Tríceps Derecho */}
            <path
              d="M 160 114 C 158 135, 152 155, 148 152 C 144 140, 146 120, 152 114 Z"
              fill={getMuscleColor('Tríceps')}
              style={{ filter: getMuscleGlow('Tríceps') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Tríceps')}
            >
              <title>Tríceps Derecho</title>
            </path>

            {/* Glúteos */}
            <path
              d="M 70 168 L 130 168 C 138 185, 132 215, 102 215 L 98 215 C 68 215, 62 185, 70 168 Z"
              fill={getMuscleColor('Glúteos')}
              style={{ filter: getMuscleGlow('Glúteos') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Glúteos')}
            >
              <title>Glúteos</title>
            </path>

            {/* Isquiosururales (Isquios) */}
            <path
              d="M 68 220 C 64 245, 68 268, 92 268 C 96 250, 94 230, 84 220 Z"
              fill={getMuscleColor('Isquios')}
              style={{ filter: getMuscleGlow('Isquios') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Isquios')}
            >
              <title>Isquiotibial Izquierdo</title>
            </path>
            <path
              d="M 132 220 C 136 245, 132 268, 108 268 C 104 250, 106 230, 116 220 Z"
              fill={getMuscleColor('Isquios')}
              style={{ filter: getMuscleGlow('Isquios') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Isquios')}
            >
              <title>Isquiotibial Derecho</title>
            </path>

            {/* Gemelos Posteriores */}
            <path
              d="M 68 275 C 62 300, 70 338, 86 338 C 88 310, 84 285, 78 275 Z"
              fill={getMuscleColor('Gemelos')}
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Posterior Izquierdo</title>
            </path>
            <path
              d="M 132 275 C 138 300, 130 338, 114 338 C 112 310, 116 285, 122 275 Z"
              fill={getMuscleColor('Gemelos')}
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Posterior Derecho</title>
            </path>
          </svg>
        )}
      </div>

      {/* Legend & Status breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Leyenda de Fatiga:</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-1.5 rounded-xl">
            🟢 0-35% Fresco
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-1.5 rounded-xl">
            🟡 36-60% Medio
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-1.5 rounded-xl">
            🟠 61-80% Alto
          </div>
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-1.5 rounded-xl">
            🔴 81-100% Crítico
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
