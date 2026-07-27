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
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleFatigue | null>(null);

  // Mapeo rápido por nombre de grupo muscular
  const fatigueMap = new Map<string, MuscleFatigue>(
    muscleFatigueList.map((m) => [m.muscleGroup, m])
  );

  const getMuscleColor = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent === 0) return '#1e293b'; // Slate-800 deshabilitado/neutro
    const pct = data.fatiguePercent;
    if (pct > 80) return '#ef4444'; // Red-500
    if (pct > 60) return '#f97316'; // Orange-500
    if (pct > 35) return '#eab308'; // Yellow-500
    return '#10b981'; // Emerald-500
  };

  const getMuscleOpacity = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent === 0) return 0.35;
    return 0.85;
  };

  const getMuscleGlow = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent <= 35) return 'none';
    const color = getMuscleColor(muscleName);
    return `drop-shadow(0px 0px 8px ${color})`;
  };

  const handleMuscleClick = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (data) setSelectedMuscle(data);
  };

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/70 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-blue animate-pulse" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Mapa Anatómico 2D de Fatiga (Frontal & Posterior)
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-full border border-white/5 text-[10px] font-mono text-slate-300">
          <span>Global:</span>
          <span className={cn(
            'font-bold',
            overallFatiguePercent > 70 ? 'text-red-400' : overallFatiguePercent > 45 ? 'text-yellow-400' : 'text-emerald-400'
          )}>
            {overallFatiguePercent}%
          </span>
        </div>
      </div>

      {/* Side-by-Side Anatomical Visualizer Container */}
      <div className="relative flex flex-col sm:flex-row justify-around items-center gap-4 py-4 px-2 bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden min-h-[340px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* ─── VISTA FRONTAL (FRONT VIEW) ─── */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block" /> Frontal
          </span>

          <svg
            viewBox="0 0 200 380"
            className="w-44 h-72 drop-shadow-2xl transition-all duration-300"
          >
            {/* Base Silhouette Outline (Front) */}
            <path
              d="M 100 18 C 112 18, 122 28, 122 45 C 122 56, 116 64, 110 68 C 126 72, 150 80, 158 102 L 176 172 C 178 180, 168 185, 162 180 L 150 132 L 142 195 L 136 265 L 132 355 C 131 362, 118 362, 115 355 L 105 245 L 95 245 L 85 355 C 82 362, 69 362, 68 355 L 64 265 L 58 195 L 50 132 L 38 180 C 32 185, 22 180, 24 172 L 42 102 C 50 80, 74 72, 90 68 C 84 64, 78 56, 78 45 C 78 28, 88 18, 100 18 Z"
              fill="#0b1329"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cabeza / Cuello */}
            <ellipse cx="100" cy="42" rx="18" ry="22" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Hombro Izquierdo (Deltoides) */}
            <path
              d="M 60 78 C 48 82, 40 94, 42 110 C 46 114, 54 110, 60 98 Z"
              fill={getMuscleColor('Hombros')}
              fillOpacity={getMuscleOpacity('Hombros')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Hombros') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Hombros')}
            >
              <title>Hombro Izquierdo (Deltoides)</title>
            </path>

            {/* Hombro Derecho (Deltoides) */}
            <path
              d="M 140 78 C 152 82, 160 94, 158 110 C 154 114, 146 110, 140 98 Z"
              fill={getMuscleColor('Hombros')}
              fillOpacity={getMuscleOpacity('Hombros')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Hombros') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Hombros')}
            >
              <title>Hombro Derecho (Deltoides)</title>
            </path>

            {/* Pecho (Pectoral Mayor Izquierdo) */}
            <path
              d="M 74 78 C 88 78, 97 80, 98 104 C 84 110, 70 106, 66 94 Z"
              fill={getMuscleColor('Pecho')}
              fillOpacity={getMuscleOpacity('Pecho')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Pecho') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Pecho')}
            >
              <title>Pectoral Izquierdo</title>
            </path>

            {/* Pecho (Pectoral Mayor Derecho) */}
            <path
              d="M 126 78 C 112 78, 103 80, 102 104 C 116 110, 130 106, 134 94 Z"
              fill={getMuscleColor('Pecho')}
              fillOpacity={getMuscleOpacity('Pecho')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Pecho') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Pecho')}
            >
              <title>Pectoral Derecho</title>
            </path>

            {/* Bíceps Izquierdo */}
            <path
              d="M 42 112 C 40 130, 46 148, 52 146 C 56 136, 56 120, 50 112 Z"
              fill={getMuscleColor('Bíceps')}
              fillOpacity={getMuscleOpacity('Bíceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Bíceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Bíceps')}
            >
              <title>Bíceps Izquierdo</title>
            </path>

            {/* Bíceps Derecho */}
            <path
              d="M 158 112 C 160 130, 154 148, 148 146 C 144 136, 144 120, 150 112 Z"
              fill={getMuscleColor('Bíceps')}
              fillOpacity={getMuscleOpacity('Bíceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Bíceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Bíceps')}
            >
              <title>Bíceps Derecho</title>
            </path>

            {/* Abdominales (Core) — Rejilla Anatómica de 6 Cuadrantes */}
            <g
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Abdominales')}
              style={{ filter: getMuscleGlow('Abdominales') }}
            >
              <path
                d="M 80 110 L 120 110 L 116 172 L 84 172 Z"
                fill={getMuscleColor('Abdominales')}
                fillOpacity={getMuscleOpacity('Abdominales')}
                stroke="#475569"
                strokeWidth="1.2"
              />
              {/* Líneas divisoras del 6-pack */}
              <line x1="100" y1="110" x2="100" y2="172" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="82" y1="130" x2="118" y2="130" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="83" y1="150" x2="117" y2="150" stroke="#1e293b" strokeWidth="1.5" />
              <title>Abdominales / Recto Abdominal</title>
            </g>

            {/* Cuádriceps Izquierdo */}
            <path
              d="M 68 182 C 64 212, 68 252, 92 255 C 96 232, 94 198, 84 182 Z"
              fill={getMuscleColor('Cuádriceps')}
              fillOpacity={getMuscleOpacity('Cuádriceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Cuádriceps')}
            >
              <title>Cuádriceps Izquierdo</title>
            </path>

            {/* Cuádriceps Derecho */}
            <path
              d="M 132 182 C 136 212, 132 252, 108 255 C 104 232, 106 198, 116 182 Z"
              fill={getMuscleColor('Cuádriceps')}
              fillOpacity={getMuscleOpacity('Cuádriceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Cuádriceps')}
            >
              <title>Cuádriceps Derecho</title>
            </path>

            {/* Gemelos Frontales */}
            <path
              d="M 70 272 C 66 298, 72 335, 86 335 C 88 308, 84 282, 78 272 Z"
              fill={getMuscleColor('Gemelos')}
              fillOpacity={getMuscleOpacity('Gemelos')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Izquierdo</title>
            </path>
            <path
              d="M 130 272 C 134 298, 128 335, 114 335 C 112 308, 116 282, 122 272 Z"
              fill={getMuscleColor('Gemelos')}
              fillOpacity={getMuscleOpacity('Gemelos')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Derecho</title>
            </path>
          </svg>
        </div>

        {/* Divider vertical en pantallas medianas/grandes */}
        <div className="hidden sm:block w-px h-64 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* ─── VISTA POSTERIOR (BACK VIEW) ─── */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block" /> Posterior
          </span>

          <svg
            viewBox="0 0 200 380"
            className="w-44 h-72 drop-shadow-2xl transition-all duration-300"
          >
            {/* Base Silhouette Outline (Back) */}
            <path
              d="M 100 18 C 112 18, 122 28, 122 45 C 122 56, 116 64, 110 68 C 126 72, 150 80, 158 102 L 176 172 C 178 180, 168 185, 162 180 L 150 132 L 142 195 L 136 265 L 132 355 C 131 362, 118 362, 115 355 L 105 245 L 95 245 L 85 355 C 82 362, 69 362, 68 355 L 64 265 L 58 195 L 50 132 L 38 180 C 32 185, 22 180, 24 172 L 42 102 C 50 80, 74 72, 90 68 C 84 64, 78 56, 78 45 C 78 28, 88 18, 100 18 Z"
              fill="#0b1329"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cabeza Posterior */}
            <ellipse cx="100" cy="42" rx="18" ry="22" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Espalda (Dorsal Ancho & Trapecios - V Taper) */}
            <path
              d="M 74 74 C 88 68, 112 68, 126 74 C 144 88, 138 146, 120 160 L 80 160 C 62 146, 56 88, 74 74 Z"
              fill={getMuscleColor('Espalda')}
              fillOpacity={getMuscleOpacity('Espalda')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Espalda') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Espalda')}
            >
              <title>Dorsales & Espalda Alta</title>
            </path>

            {/* Tríceps Izquierdo */}
            <path
              d="M 38 110 C 40 130, 46 150, 50 148 C 54 136, 52 118, 46 110 Z"
              fill={getMuscleColor('Tríceps')}
              fillOpacity={getMuscleOpacity('Tríceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Tríceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Tríceps')}
            >
              <title>Tríceps Izquierdo</title>
            </path>

            {/* Tríceps Derecho */}
            <path
              d="M 162 110 C 160 130, 154 150, 150 148 C 146 136, 148 118, 154 110 Z"
              fill={getMuscleColor('Tríceps')}
              fillOpacity={getMuscleOpacity('Tríceps')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Tríceps') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Tríceps')}
            >
              <title>Tríceps Derecho</title>
            </path>

            {/* Glúteos (Curvas Anatómicas Simétricas) */}
            <g
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Glúteos')}
              style={{ filter: getMuscleGlow('Glúteos') }}
            >
              <path
                d="M 68 165 C 68 165, 96 165, 98 212 C 78 215, 64 195, 68 165 Z"
                fill={getMuscleColor('Glúteos')}
                fillOpacity={getMuscleOpacity('Glúteos')}
                stroke="#475569"
                strokeWidth="1.2"
              />
              <path
                d="M 132 165 C 132 165, 104 165, 102 212 C 122 215, 136 195, 132 165 Z"
                fill={getMuscleColor('Glúteos')}
                fillOpacity={getMuscleOpacity('Glúteos')}
                stroke="#475569"
                strokeWidth="1.2"
              />
              <title>Glúteos</title>
            </g>

            {/* Isquiosururales (Isquios Izquierdo) */}
            <path
              d="M 66 216 C 62 240, 66 265, 90 265 C 94 248, 92 226, 82 216 Z"
              fill={getMuscleColor('Isquios')}
              fillOpacity={getMuscleOpacity('Isquios')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Isquios') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Isquios')}
            >
              <title>Isquiotibial Izquierdo</title>
            </path>

            {/* Isquiosururales (Isquios Derecho) */}
            <path
              d="M 134 216 C 138 240, 134 265, 110 265 C 106 248, 108 226, 118 216 Z"
              fill={getMuscleColor('Isquios')}
              fillOpacity={getMuscleOpacity('Isquios')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Isquios') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Isquios')}
            >
              <title>Isquiotibial Derecho</title>
            </path>

            {/* Gemelos Posteriores */}
            <path
              d="M 68 272 C 62 298, 70 338, 86 338 C 88 308, 84 282, 78 272 Z"
              fill={getMuscleColor('Gemelos')}
              fillOpacity={getMuscleOpacity('Gemelos')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Posterior Izquierdo</title>
            </path>
            <path
              d="M 132 272 C 138 298, 130 338, 114 338 C 112 308, 116 282, 122 272 Z"
              fill={getMuscleColor('Gemelos')}
              fillOpacity={getMuscleOpacity('Gemelos')}
              stroke="#475569"
              strokeWidth="1.2"
              style={{ filter: getMuscleGlow('Gemelos') }}
              className="cursor-pointer hover:opacity-100 transition-all"
              onClick={() => handleMuscleClick('Gemelos')}
            >
              <title>Gemelo Posterior Derecho</title>
            </path>
          </svg>
        </div>
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
