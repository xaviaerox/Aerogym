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
    if (!data || data.fatiguePercent === 0) return 'rgba(30, 41, 59, 0.4)'; // Slate-800 translucent when 0%
    const pct = data.fatiguePercent;
    if (pct > 80) return 'rgba(239, 68, 68, 0.7)'; // Red-500
    if (pct > 60) return 'rgba(249, 115, 22, 0.7)'; // Orange-500
    if (pct > 35) return 'rgba(234, 179, 8, 0.7)'; // Yellow-500
    return 'rgba(16, 185, 129, 0.7)'; // Emerald-500
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
    return `drop-shadow(0px 0px 6px ${stroke})`;
  };

  const handleMuscleClick = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (data) setSelectedMuscle(data);
  };

  return (
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/90 shadow-2xl">
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

      {/* Pure High-Precision 2D Vector Anatomical Visualizer (Pure SVG - No External Files) */}
      <div className="relative flex justify-center items-center py-4 px-2 bg-slate-950/80 rounded-2xl border border-white/5 overflow-hidden min-h-[350px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <svg
          viewBox="0 0 400 370"
          className="w-full max-w-[480px] h-auto drop-shadow-2xl select-none"
        >
          {/* Labels Front / Back */}
          <text x="100" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="900" letterSpacing="1.5">
            FRONTAL
          </text>
          <text x="300" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="900" letterSpacing="1.5">
            POSTERIOR
          </text>

          {/* Central Vertical Divider */}
          <line x1="200" y1="26" x2="200" y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA FRONTAL (LEFT FIGURE: Center X = 100) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Body Outer Line Contour (Frontal Muscular Physique) */}
          <path
            d="M 100 24 C 108 24 114 30 114 42 C 114 52 108 58 103 62 C 116 65 138 74 144 94 L 160 156 C 162 162 153 167 148 162 L 138 122 L 130 182 L 124 250 L 120 344 C 119 350 108 350 106 344 L 97 242 L 91 242 L 82 344 C 80 350 69 350 68 344 L 64 250 L 58 182 L 50 122 L 40 162 C 35 167 26 162 28 156 L 44 94 C 50 74 72 65 85 62 C 80 58 74 52 74 42 C 74 30 80 24 100 24 Z"
            fill="#0b1329"
            stroke="#475569"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cabeza / Cuello */}
          <ellipse cx="100" cy="42" rx="16" ry="19" fill="#1e293b" stroke="#475569" strokeWidth="1.3" />
          <path d="M 90 60 C 90 68, 94 74, 94 78 M 110 60 C 110 68, 106 74, 106 78" fill="none" stroke="#475569" strokeWidth="1.2" />

          {/* Hombros (Deltoides Frontales) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 62 82 C 48 86 40 98 42 116 C 46 120 54 114 60 102 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 138 82 C 152 86 160 98 158 116 C 154 120 146 114 140 102 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Hombros (Deltoides)</title>
          </g>

          {/* Pecho (Pectoral Mayor Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Pecho')}>
            <path
              d="M 76 82 C 90 82 98 84 99 108 C 84 114 70 108 66 96 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <path
              d="M 124 82 C 110 82 102 84 101 108 C 116 114 130 108 134 96 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <title>Pecho (Pectoral Mayor)</title>
          </g>

          {/* Bíceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Bíceps')}>
            <path
              d="M 42 116 C 38 135 44 152 50 150 C 54 140 54 124 48 116 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <path
              d="M 158 116 C 162 135 156 152 150 150 C 146 140 146 124 152 116 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <title>Bíceps Braquial</title>
          </g>

          {/* Antebrazos / Manos */}
          <path d="M 50 150 L 36 190 M 150 150 L 164 190" fill="none" stroke="#475569" strokeWidth="1.2" />

          {/* Abdominales (Core / 6-Pack Grid Anatómico) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Abdominales')}>
            <path
              d="M 82 110 L 118 110 L 114 175 L 86 175 Z"
              fill={getMuscleColor('Abdominales')}
              stroke={getMuscleStroke('Abdominales')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Abdominales') }}
            />
            <line x1="100" y1="110" x2="100" y2="175" stroke="#334155" strokeWidth="1.2" />
            <line x1="84" y1="131" x2="116" y2="131" stroke="#334155" strokeWidth="1.2" />
            <line x1="85" y1="153" x2="115" y2="153" stroke="#334155" strokeWidth="1.2" />
            <title>Abdominales (Recto Abdominal)</title>
          </g>

          {/* Oblicuos */}
          <path d="M 68 110 C 68 135 74 160 86 175 M 132 110 C 132 135 126 160 114 175" fill="none" stroke="#475569" strokeWidth="1.2" />

          {/* Cuádriceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Cuádriceps')}>
            <path
              d="M 70 185 C 62 215 66 258 92 260 C 96 235 94 200 84 185 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <path
              d="M 130 185 C 138 215 134 258 108 260 C 104 235 106 200 116 185 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <title>Cuádriceps (Muslos Frontales)</title>
          </g>

          {/* Rótulas Rodillas */}
          <ellipse cx="86" cy="270" rx="5" ry="6" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
          <ellipse cx="114" cy="270" rx="5" ry="6" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />

          {/* Gemelos Frontales */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 70 280 C 62 305 70 340 84 340 C 88 315 84 290 78 280 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 130 280 C 138 305 130 340 116 340 C 112 315 116 290 122 280 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos (Pantorrilla)</title>
          </g>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA POSTERIOR (RIGHT FIGURE: Center X = 300) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Body Outer Line Contour (Posterior Muscular Physique) */}
          <path
            d="M 300 24 C 308 24 314 30 314 42 C 314 52 308 58 303 62 C 316 65 338 74 344 94 L 360 156 C 362 162 353 167 348 162 L 338 122 L 330 182 L 324 250 L 320 344 C 319 350 308 350 306 344 L 297 242 L 291 242 L 282 344 C 280 350 269 350 268 344 L 264 250 L 258 182 L 250 122 L 240 162 C 235 167 226 162 228 156 L 244 94 C 250 74 272 65 285 62 C 280 58 274 52 274 42 C 274 30 280 24 300 24 Z"
            fill="#0b1329"
            stroke="#475569"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cabeza Posterior */}
          <ellipse cx="300" cy="42" rx="16" ry="19" fill="#1e293b" stroke="#475569" strokeWidth="1.3" />

          {/* Espalda (Trapecios & Dorsal Ancho V-Taper) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Espalda')}>
            {/* Trapecio superior */}
            <path d="M 300 64 L 270 78 L 300 118 L 330 78 Z" fill={getMuscleColor('Espalda')} stroke={getMuscleStroke('Espalda')} strokeWidth="1.2" />
            {/* Dorsal Ancho */}
            <path
              d="M 270 78 C 256 88 250 120 270 165 L 300 172 L 330 165 C 350 120 344 88 330 78 L 300 118 Z"
              fill={getMuscleColor('Espalda')}
              stroke={getMuscleStroke('Espalda')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Espalda') }}
            />
            <title>Espalda (Dorsales / Trapecios / Lumbar)</title>
          </g>

          {/* Deltoides Posteriores (Hombros Espalda) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 270 78 C 256 82 244 95 246 114 C 252 118 262 112 268 98 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 330 78 C 344 82 356 95 354 114 C 348 118 338 112 332 98 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Deltoides Posterior</title>
          </g>

          {/* Tríceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Tríceps')}>
            <path
              d="M 246 114 C 242 132 248 154 256 152 C 262 142 264 124 256 114 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <path
              d="M 354 114 C 358 132 352 154 344 152 C 338 142 336 124 344 114 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <title>Tríceps Braquial</title>
          </g>

          {/* Glúteos (Gluteus Maximus - Twin Rounded Muscular Bellies) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Glúteos')}>
            <path
              d="M 300 172 C 270 172 260 190 264 224 C 284 228 298 210 300 172 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <path
              d="M 300 172 C 330 172 340 190 336 224 C 316 228 302 210 300 172 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <title>Glúteos (Glúteo Mayor)</title>
          </g>

          {/* Isquiosururales (Isquiotibiales Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Isquios')}>
            <path
              d="M 264 226 C 256 245 262 275 280 278 C 286 260 284 235 276 226 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <path
              d="M 336 226 C 344 245 338 275 320 278 C 314 260 316 235 324 226 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <title>Isquiotibiales (Femorales)</title>
          </g>

          {/* Gemelos Posteriores (Gastrocnemio) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 270 282 C 260 305 266 346 280 348 C 286 348 284 320 278 282 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 330 282 C 340 305 334 346 320 348 C 314 348 316 320 322 282 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
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
