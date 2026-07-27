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
    if (!data || data.fatiguePercent === 0) return 'rgba(30, 41, 59, 0.05)';
    const pct = data.fatiguePercent;
    if (pct > 80) return 'rgba(239, 68, 68, 0.6)'; // Red-500
    if (pct > 60) return 'rgba(249, 115, 22, 0.6)'; // Orange-500
    if (pct > 35) return 'rgba(234, 179, 8, 0.6)'; // Yellow-500
    return 'rgba(16, 185, 129, 0.6)'; // Emerald-500
  };

  const getMuscleStroke = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (!data || data.fatiguePercent === 0) return 'transparent';
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
    <div className="glass p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-900/90 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-blue animate-pulse" />
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
            Mapa Anatómico 2D de Fatiga Muscular (Frontal & Posterior)
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

      {/* Embedded 2D Anatomical Map Container */}
      <div className="relative w-full max-w-[550px] mx-auto rounded-2xl border border-white/10 overflow-hidden bg-[#eef2f6] shadow-inner p-1">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-auto drop-shadow-2xl select-none"
        >
          {/* Base Anatomical Line-Art Image (Embedded inside SVG coordinate space for 100% perfect lock) */}
          <image
            href="/Aerogym/images/body_map_2d.png"
            x="0"
            y="0"
            width="1000"
            height="650"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* ─── VISTA FRONTAL (FRONT VIEW — LEFT SIDE) ─── */}

          {/* Hombros (Deltoides Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 175 145 C 150 152 135 180 138 215 C 155 220 178 205 185 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 325 145 C 350 152 365 180 362 215 C 345 220 322 205 315 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Hombros (Deltoides)</title>
          </g>

          {/* Pecho (Pectorales Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Pecho')}>
            <path
              d="M 250 150 C 220 150 190 155 182 185 C 178 208 200 235 248 235 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <path
              d="M 250 150 C 280 150 310 155 318 185 C 322 208 300 235 252 235 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <title>Pecho (Pectoral Mayor)</title>
          </g>

          {/* Bíceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Bíceps')}>
            <path
              d="M 136 218 C 120 250 135 295 152 290 C 165 270 168 238 152 218 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <path
              d="M 364 218 C 380 250 365 295 348 290 C 335 270 332 238 348 218 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <title>Bíceps Braquial</title>
          </g>

          {/* Abdominales (Core / 6-Pack Column) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Abdominales')}>
            <path
              d="M 225 240 L 275 240 L 268 375 L 232 375 Z"
              fill={getMuscleColor('Abdominales')}
              stroke={getMuscleStroke('Abdominales')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Abdominales') }}
            />
            <title>Abdominales (Recto Abdominal)</title>
          </g>

          {/* Cuádriceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Cuádriceps')}>
            <path
              d="M 225 390 C 190 415 180 480 190 540 C 215 550 240 540 248 490 C 252 450 245 405 225 390 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <path
              d="M 275 390 C 310 415 320 480 310 540 C 285 550 260 540 252 490 C 248 450 255 405 275 390 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <title>Cuádriceps (Muslos Frontales)</title>
          </g>

          {/* Gemelos Frontales */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 195 560 C 180 595 192 640 220 640 C 230 600 220 570 210 560 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 305 560 C 320 595 308 640 280 640 C 270 600 280 570 290 560 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos (Espinilla / Pantorrilla)</title>
          </g>

          {/* ─── VISTA POSTERIOR (BACK VIEW — RIGHT SIDE) ─── */}

          {/* Espalda (Dorsales / Trapecios / Lumbar) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Espalda')}>
            <path
              d="M 730 135 L 650 150 C 610 180 605 240 640 330 L 730 345 L 820 330 C 855 240 850 180 810 150 Z"
              fill={getMuscleColor('Espalda')}
              stroke={getMuscleStroke('Espalda')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Espalda') }}
            />
            <title>Espalda (Dorsales / Trapecios / Lumbar)</title>
          </g>

          {/* Hombros Posteriores (Deltoides Espalda) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 650 150 C 625 155 610 180 615 215 C 630 220 652 205 658 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 810 150 C 835 155 850 180 845 215 C 830 220 808 205 802 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Deltoides Posterior</title>
          </g>

          {/* Tríceps (Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Tríceps')}>
            <path
              d="M 615 218 C 600 250 612 295 628 290 C 640 270 642 238 628 218 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <path
              d="M 845 218 C 860 250 848 295 832 290 C 840 270 838 238 852 218 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <title>Tríceps Braquial</title>
          </g>

          {/* Glúteos (Gluteus Maximus - Twin Rounded Bellies) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Glúteos')}>
            <path
              d="M 730 350 C 660 350 640 380 650 445 C 690 455 725 425 730 350 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <path
              d="M 730 350 C 800 350 820 380 810 445 C 770 455 735 425 730 350 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <title>Glúteos (Glúteo Mayor)</title>
          </g>

          {/* Isquiosururales (Isquiotibiales Izquierdo y Derecho) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Isquios')}>
            <path
              d="M 670 450 C 650 480 660 535 700 540 C 712 510 710 470 690 450 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <path
              d="M 810 450 C 830 480 820 535 780 540 C 768 510 770 470 790 450 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <title>Isquiotibiales (Femorales)</title>
          </g>

          {/* Gemelos Posteriores (Gastrocnemio) */}
          <g className="cursor-pointer transition-all hover:opacity-90" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 645 560 C 630 595 642 640 670 640 C 680 600 670 570 660 560 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 815 560 C 830 595 818 640 790 640 C 780 600 790 570 800 560 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2"
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
