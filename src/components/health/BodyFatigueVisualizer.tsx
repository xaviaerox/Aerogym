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
    if (!data || data.fatiguePercent === 0) return 'rgba(30, 41, 59, 0.4)'; // Subtle slate-800 translucent
    const pct = data.fatiguePercent;
    if (pct > 80) return 'rgba(239, 68, 68, 0.65)'; // Red-500
    if (pct > 60) return 'rgba(249, 115, 22, 0.65)'; // Orange-500
    if (pct > 35) return 'rgba(234, 179, 8, 0.65)'; // Yellow-500
    return 'rgba(16, 185, 129, 0.65)'; // Emerald-500
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
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/80 shadow-2xl">
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

      {/* High Precision Anatomical 2D Vector Visualizer (Unified Front & Back Side-by-Side) */}
      <div className="relative flex justify-center items-center py-4 px-2 bg-slate-950/80 rounded-2xl border border-white/5 overflow-hidden min-h-[360px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <svg
          viewBox="0 0 440 370"
          className="w-full max-w-[500px] h-auto drop-shadow-2xl select-none"
        >
          <defs>
            {/* Outline Glow filter for active muscles */}
            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Labels Front / Back */}
          <text x="110" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="900" letterSpacing="2">
            VISTA FRONTAL
          </text>
          <text x="330" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="900" letterSpacing="2">
            VISTA POSTERIOR
          </text>

          {/* Central Vertical Divider */}
          <line x1="220" y1="28" x2="220" y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA FRONTAL (LEFT FIGURE: Center X = 110) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Full Body Outer Line Contour (Front) */}
          <path
            d="M 110 24 C 119 24 126 31 126 44 C 126 55 120 62 114 66 C 128 69 150 78 156 98 L 172 162 C 174 168 165 174 160 169 L 148 126 L 140 188 L 134 256 L 130 350 C 129 356 118 356 115 350 L 106 248 L 100 248 L 91 350 C 88 356 77 356 76 350 L 72 256 L 66 188 L 58 126 L 46 169 C 41 174 32 168 34 162 L 50 98 C 56 78 78 69 92 66 C 86 62 80 55 80 44 C 80 31 87 24 110 24 Z"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Head & Neck Contour */}
          <ellipse cx="110" cy="44" rx="17" ry="21" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <path d="M 98 64 C 98 72, 102 78, 102 82 M 122 64 C 122 72, 118 78, 118 82" fill="none" stroke="#64748b" strokeWidth="1.2" />

          {/* Hombros (Deltoides Frontales) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 80 78 C 66 82 54 95 56 114 C 62 118 72 112 78 98 C 80 90 80 84 80 78 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 140 78 C 154 82 166 95 164 114 C 158 118 148 112 142 98 C 140 90 140 84 140 78 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Hombros (Deltoides)</title>
          </g>

          {/* Pecho (Pectorales Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Pecho')}>
            <path
              d="M 110 82 C 102 82 86 84 80 96 C 76 108 84 122 108 122 C 109 122 110 105 110 82 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <path
              d="M 110 82 C 118 82 134 84 140 96 C 144 108 136 122 112 122 C 111 122 110 105 110 82 Z"
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
              d="M 56 115 C 52 132 58 154 66 152 C 72 142 74 124 66 115 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <path
              d="M 164 115 C 168 132 162 154 154 152 C 148 142 146 124 154 115 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <title>Bíceps Braquial</title>
          </g>

          {/* Antebrazos / Manos Contorno */}
          <path d="M 64 152 C 58 172 48 198 44 204 M 156 152 C 162 172 172 198 176 204" fill="none" stroke="#64748b" strokeWidth="1.2" />

          {/* Abdominales (Core / 6-Pack Grid Anatómico) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Abdominales')}>
            <path
              d="M 94 124 L 126 124 L 122 192 L 98 192 Z"
              fill={getMuscleColor('Abdominales')}
              stroke={getMuscleStroke('Abdominales')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Abdominales') }}
            />
            {/* Linea Alba & Tendinous intersections */}
            <line x1="110" y1="124" x2="110" y2="192" stroke="#64748b" strokeWidth="1.2" />
            <line x1="95" y1="144" x2="125" y2="144" stroke="#64748b" strokeWidth="1.2" />
            <line x1="96" y1="166" x2="124" y2="166" stroke="#64748b" strokeWidth="1.2" />
            <title>Abdominales (Recto Abdominal)</title>
          </g>

          {/* Cuádriceps (Izquierdo y Derecho con definición Vasto) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Cuádriceps')}>
            <path
              d="M 96 196 C 82 210 74 242 78 280 C 88 284 100 282 104 260 C 106 238 104 208 96 196 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <path
              d="M 124 196 C 138 210 146 242 142 280 C 132 284 120 282 116 260 C 114 238 116 208 124 196 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <title>Cuádriceps (Muslos Frontales)</title>
          </g>

          {/* Rótulas / Rodillas */}
          <ellipse cx="86" cy="290" rx="6" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <ellipse cx="134" cy="290" rx="6" ry="7" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />

          {/* Gemelos Frontales (Gastrocnemio / Tibial) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 80 302 C 72 320 76 346 90 348 C 96 348 94 320 88 302 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 140 302 C 148 320 144 346 130 348 C 124 348 126 320 132 302 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos (Gemelo / Pantorrilla)</title>
          </g>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA POSTERIOR (RIGHT FIGURE: Center X = 330) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Full Body Outer Line Contour (Back) */}
          <path
            d="M 330 24 C 339 24 346 31 346 44 C 346 55 340 62 334 66 C 348 69 370 78 376 98 L 392 162 C 394 168 385 174 380 169 L 368 126 L 360 188 L 354 256 L 350 350 C 349 356 338 356 335 350 L 326 248 L 320 248 L 311 350 C 308 356 297 356 296 350 L 292 256 L 286 188 L 278 126 L 266 169 C 261 174 252 168 254 162 L 270 98 C 276 78 298 69 312 66 C 306 62 300 55 300 44 C 300 31 307 24 330 24 Z"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Head & Neck Contour (Back) */}
          <ellipse cx="330" cy="44" rx="17" ry="21" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />

          {/* Espalda (Trapecios, Dorsal Ancho & Zona Lumbar en V-Taper) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Espalda')}>
            {/* Trapecio superior */}
            <path d="M 330 64 L 300 78 L 330 118 L 360 78 Z" fill={getMuscleColor('Espalda')} stroke={getMuscleStroke('Espalda')} strokeWidth="1.2" />
            {/* Dorsal Ancho */}
            <path
              d="M 300 78 C 286 88 280 120 300 165 L 330 172 L 360 165 C 380 120 374 88 360 78 L 330 118 Z"
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
              d="M 300 78 C 286 82 274 95 276 114 C 282 118 292 112 298 98 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 360 78 C 374 82 386 95 384 114 C 378 118 368 112 362 98 Z"
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
              d="M 276 114 C 272 132 278 154 286 152 C 292 142 294 124 286 114 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <path
              d="M 384 114 C 388 132 382 154 374 152 C 368 142 366 124 374 114 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <title>Tríceps Braquial</title>
          </g>

          {/* Glúteos (Gluteus Maximus - Twin Rounded Muscle Bellies) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Glúteos')}>
            <path
              d="M 330 172 C 300 172 290 190 294 224 C 314 228 328 210 330 172 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <path
              d="M 330 172 C 360 172 370 190 366 224 C 346 228 332 210 330 172 Z"
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
              d="M 294 226 C 286 245 292 275 310 278 C 316 260 314 235 306 226 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <path
              d="M 366 226 C 374 245 368 275 350 278 C 344 260 346 235 354 226 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <title>Isquiotibiales (Femorales)</title>
          </g>

          {/* Gemelos Posteriores (Gastrocnemio Cabeza Medial / Lateral) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 300 282 C 290 305 296 346 310 348 C 316 348 314 320 308 282 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="1.4"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 360 282 C 370 305 364 346 350 348 C 344 348 346 320 352 282 Z"
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
