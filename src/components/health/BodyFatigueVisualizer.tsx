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

  // Map by muscle group name
  const fatigueMap = new Map<string, MuscleFatigue>(
    muscleFatigueList.map((m) => [m.muscleGroup, m])
  );

  const getMuscleColor = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent === 0) return 'rgba(30, 41, 59, 0.35)'; // Slate translucent when 0%
    const pct = data.fatiguePercent;
    if (pct > 80) return 'rgba(239, 68, 68, 0.75)'; // Red-500
    if (pct > 60) return 'rgba(249, 115, 22, 0.75)'; // Orange-500
    if (pct > 35) return 'rgba(234, 179, 8, 0.75)'; // Yellow-500
    return 'rgba(16, 185, 129, 0.75)'; // Emerald-500
  };

  const getMuscleStroke = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent === 0) return '#475569'; // Slate-600 outline
    const pct = data.fatiguePercent;
    if (pct > 80) return '#f87171';
    if (pct > 60) return '#fb923c';
    if (pct > 35) return '#facc15';
    return '#34d399';
  };

  const getMuscleGlow = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent <= 35) return 'none';
    const stroke = getMuscleStroke(muscleName);
    return `drop-shadow(0px 0px 8px ${stroke})`;
  };

  const handleMuscleClick = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (data) setSelectedMuscle(data);
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

      {/* Pure High-Precision 2D Vector Visualizer (Unified 500x380 SVG - Zero External Files) */}
      <div className="relative flex justify-center items-center py-4 px-2 bg-slate-950/90 rounded-2xl border border-white/5 overflow-hidden min-h-[360px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <svg
          viewBox="0 0 500 380"
          className="w-full max-w-[500px] h-auto drop-shadow-2xl select-none"
        >
          {/* Section Titles */}
          <text x="125" y="18" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="900" letterSpacing="1.5">
            FRONTAL
          </text>
          <text x="375" y="18" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="900" letterSpacing="1.5">
            POSTERIOR
          </text>

          {/* Central Divider Line */}
          <line x1="250" y1="28" x2="250" y2="370" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA FRONTAL (LEFT FIGURE: Center X = 125) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Head & Neck Contour */}
          <path
            d="M 125 24 C 137 24 144 33 144 48 C 144 63 137 72 125 72 C 113 72 106 63 106 48 C 106 33 113 24 125 24 Z"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <path d="M 112 70 L 110 82 M 138 70 L 140 82" fill="none" stroke="#475569" strokeWidth="1.4" />

          {/* Hombros (Deltoides Frontales) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 108 82 C 92 84 75 94 72 118 C 80 124 94 116 102 102 C 106 94 108 88 108 82 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 142 82 C 158 84 175 94 178 118 C 170 124 156 116 148 102 C 144 94 142 88 142 82 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Hombros (Deltoides)</title>
          </g>

          {/* Pecho (Pectoral Mayor Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Pecho')}>
            <path
              d="M 125 86 C 114 86 96 88 90 102 C 86 116 94 130 123 130 L 125 86 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <path
              d="M 125 86 C 136 86 154 88 160 102 C 164 116 156 130 127 130 L 125 86 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <title>Pecho (Pectoral Mayor)</title>
          </g>

          {/* Bíceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Bíceps')}>
            <path
              d="M 72 118 C 66 140 72 165 82 162 C 90 150 90 130 82 118 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <path
              d="M 178 118 C 184 140 178 165 168 162 C 160 150 160 130 168 118 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <title>Bíceps Braquial</title>
          </g>

          {/* Antebrazos / Manos Contornos */}
          <path d="M 82 162 L 56 226 L 46 218 L 68 162 M 168 162 L 194 226 L 204 218 L 182 162" fill="#0f172a" stroke="#475569" strokeWidth="1.4" />

          {/* Abdominales (Core / 6-Pack Grid Anatómico) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Abdominales')}>
            <path
              d="M 103 132 L 147 132 L 142 205 L 108 205 Z"
              fill={getMuscleColor('Abdominales')}
              stroke={getMuscleStroke('Abdominales')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Abdominales') }}
            />
            <line x1="125" y1="132" x2="125" y2="205" stroke="#334155" strokeWidth="1.4" />
            <line x1="104" y1="156" x2="146" y2="156" stroke="#334155" strokeWidth="1.4" />
            <line x1="106" y1="180" x2="144" y2="180" stroke="#334155" strokeWidth="1.4" />
            <title>Abdominales (Recto Abdominal)</title>
          </g>

          {/* Oblicuos Lateral Line Outlines */}
          <path d="M 88 132 C 88 160 94 188 108 205 M 162 132 C 162 160 156 188 142 205" fill="none" stroke="#475569" strokeWidth="1.4" />

          {/* Cuádriceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Cuádriceps')}>
            <path
              d="M 108 212 C 90 230 82 268 88 306 C 100 312 116 308 122 282 C 124 258 120 224 108 212 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <path
              d="M 142 212 C 160 230 168 268 162 306 C 150 312 134 308 128 282 C 126 258 130 224 142 212 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <title>Cuádriceps (Muslos Frontales)</title>
          </g>

          {/* Rótulas Rodillas */}
          <ellipse cx="98" cy="316" rx="6" ry="7" fill="#0f172a" stroke="#475569" strokeWidth="1.4" />
          <ellipse cx="152" cy="316" rx="6" ry="7" fill="#0f172a" stroke="#475569" strokeWidth="1.4" />

          {/* Gemelos Frontales */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 90 326 C 80 345 88 368 104 368 C 110 348 106 335 100 326 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 160 326 C 170 345 162 368 146 368 C 140 348 144 335 150 326 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos (Pantorrilla)</title>
          </g>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA POSTERIOR (RIGHT FIGURE: Center X = 375) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Head & Neck Contour (Back) */}
          <path
            d="M 375 24 C 387 24 394 33 394 48 C 394 63 387 72 375 72 C 363 72 356 63 356 48 C 356 33 363 24 375 24 Z"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Espalda (Trapecios & Dorsal Ancho V-Taper) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Espalda')}>
            {/* Trapecio superior */}
            <path d="M 375 70 L 338 84 L 375 128 L 412 84 Z" fill={getMuscleColor('Espalda')} stroke={getMuscleStroke('Espalda')} strokeWidth="1.4" />
            {/* Dorsal Ancho */}
            <path
              d="M 338 84 C 322 96 316 132 338 180 L 375 188 L 412 180 C 434 132 428 96 412 84 L 375 128 Z"
              fill={getMuscleColor('Espalda')}
              stroke={getMuscleStroke('Espalda')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Espalda') }}
            />
            <title>Espalda (Dorsales / Trapecios / Lumbar)</title>
          </g>

          {/* Deltoides Posteriores (Hombros Espalda) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 338 84 C 322 88 305 98 308 118 C 316 122 328 116 336 102 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 412 84 C 428 88 445 98 442 118 C 434 122 422 116 414 102 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Deltoides Posterior</title>
          </g>

          {/* Tríceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Tríceps')}>
            <path
              d="M 308 118 C 302 138 310 162 318 160 C 326 148 326 130 318 118 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <path
              d="M 442 118 C 448 138 440 162 432 160 C 424 148 424 130 432 118 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <title>Tríceps Braquial</title>
          </g>

          {/* Antebrazos Posteriores */}
          <path d="M 318 160 L 292 226 L 282 218 L 304 160 M 432 160 L 458 226 L 468 218 L 446 160" fill="#0f172a" stroke="#475569" strokeWidth="1.4" />

          {/* Glúteos (Gluteus Maximus - Twin Rounded Muscular Bellies) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Glúteos')}>
            <path
              d="M 375 188 C 338 188 326 210 332 246 C 354 250 372 230 375 188 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <path
              d="M 375 188 C 412 188 424 210 418 246 C 396 250 378 230 375 188 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <title>Glúteos (Glúteo Mayor)</title>
          </g>

          {/* Isquiosururales (Isquiotibiales Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Isquios')}>
            <path
              d="M 332 248 C 322 270 328 302 350 305 C 356 285 354 258 346 248 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <path
              d="M 418 248 C 428 270 422 302 400 305 C 394 285 396 258 404 248 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <title>Isquiotibiales (Femorales)</title>
          </g>

          {/* Gemelos Posteriores (Gastrocnemio) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 336 312 C 324 332 332 368 348 368 C 354 368 352 345 344 312 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 414 312 C 426 332 418 368 402 368 C 396 368 398 345 406 312 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.6"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos Posteriores (Gastrocnemio)</title>
          </g>
        </svg>
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
