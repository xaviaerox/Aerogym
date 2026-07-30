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
    if (!data || data.fatiguePercent === 0) return 'rgba(0, 0, 0, 0)'; // Transparent when 0% so line-art image is pristine
    const pct = data.fatiguePercent;
    if (pct > 80) return 'rgba(239, 68, 68, 0.65)'; // Red-500
    if (pct > 60) return 'rgba(249, 115, 22, 0.65)'; // Orange-500
    if (pct > 35) return 'rgba(234, 179, 8, 0.65)'; // Yellow-500
    return 'rgba(16, 185, 129, 0.65)'; // Emerald-500
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
    return `drop-shadow(0px 0px 10px ${stroke})`;
  };

  const handleMuscleClick = (muscleName: string) => {
    const data = fatigueMap.get(muscleName);
    if (data) setSelectedMuscle(data);
  };

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const imageSrc = `${cleanBase}images/body_map_2d.png`;

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

      {/* Realistic Anatomical Model (User Line Art + SVG Coordinate Lock 1022x645) */}
      <div className="relative flex justify-center items-center py-4 px-2 bg-slate-950/90 rounded-2xl border border-white/5 overflow-hidden min-h-[380px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <svg
          viewBox="0 0 1022 645"
          className="w-full max-w-[560px] h-auto drop-shadow-2xl select-none"
        >
          {/* Base Realistic Line-Art Image from User */}
          <image
            href={imageSrc}
            x="0"
            y="0"
            width="1022"
            height="645"
            preserveAspectRatio="none"
            style={{ filter: 'brightness(1.15) contrast(1.1)' }}
          />

          {/* Section Titles */}
          <text x="275" y="32" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="900" letterSpacing="3">
            FRONTAL
          </text>
          <text x="750" y="32" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="900" letterSpacing="3">
            POSTERIOR
          </text>

          {/* Central Divider */}
          <line x1="511" y1="40" x2="511" y2="635" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA FRONTAL (LEFT FIGURE: Center X = 275) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Hombros Frontales */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 220 135 C 175 150 150 185 155 225 C 175 230 205 210 215 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 330 135 C 375 150 400 185 395 225 C 375 230 345 210 335 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Hombros (Deltoides)</title>
          </g>

          {/* Pecho (Pectorales) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Pecho')}>
            <path
              d="M 275 150 C 240 145 200 160 190 195 C 190 230 220 245 275 245 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <path
              d="M 275 150 C 310 145 350 160 360 195 C 360 230 330 245 275 245 Z"
              fill={getMuscleColor('Pecho')}
              stroke={getMuscleStroke('Pecho')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Pecho') }}
            />
            <title>Pecho (Pectoral Mayor)</title>
          </g>

          {/* Bíceps */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Bíceps')}>
            <path
              d="M 155 225 C 140 260 155 300 175 290 C 195 270 195 235 180 220 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <path
              d="M 395 225 C 410 260 395 300 375 290 C 355 270 355 235 370 220 Z"
              fill={getMuscleColor('Bíceps')}
              stroke={getMuscleStroke('Bíceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Bíceps') }}
            />
            <title>Bíceps Braquial</title>
          </g>

          {/* Abdominales (6-Pack) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Abdominales')}>
            <path
              d="M 240 245 L 310 245 L 298 380 L 252 380 Z"
              fill={getMuscleColor('Abdominales')}
              stroke={getMuscleStroke('Abdominales')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Abdominales') }}
            />
            <title>Abdominales (Recto Abdominal)</title>
          </g>

          {/* Cuádriceps */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Cuádriceps')}>
            <path
              d="M 250 385 C 200 410 195 500 210 540 C 235 550 265 540 270 490 C 275 440 265 400 250 385 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <path
              d="M 300 385 C 350 410 355 500 340 540 C 315 550 285 540 280 490 C 275 440 285 400 300 385 Z"
              fill={getMuscleColor('Cuádriceps')}
              stroke={getMuscleStroke('Cuádriceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Cuádriceps') }}
            />
            <title>Cuádriceps (Muslos Frontales)</title>
          </g>

          {/* Gemelos Frontales */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 205 565 C 185 595 200 640 230 640 C 240 605 230 575 220 565 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 345 565 C 365 595 350 640 320 640 C 310 605 320 575 330 565 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <title>Gemelos (Pantorrilla)</title>
          </g>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ─── VISTA POSTERIOR (RIGHT FIGURE: Center X = 750) ─── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}

          {/* Espalda (Dorsales / Trapecios) */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Espalda')}>
            <path
              d="M 750 150 L 670 180 C 640 200 635 270 680 340 L 750 350 L 820 340 C 865 270 860 200 830 180 Z"
              fill={getMuscleColor('Espalda')}
              stroke={getMuscleStroke('Espalda')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Espalda') }}
            />
            <title>Espalda (Dorsales / Trapecios)</title>
          </g>

          {/* Deltoides Posteriores */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Hombros')}>
            <path
              d="M 695 135 C 650 150 625 185 630 225 C 650 230 680 210 690 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <path
              d="M 805 135 C 850 150 875 185 870 225 C 850 230 820 210 810 180 Z"
              fill={getMuscleColor('Hombros')}
              stroke={getMuscleStroke('Hombros')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Hombros') }}
            />
            <title>Deltoides Posterior</title>
          </g>

          {/* Tríceps */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Tríceps')}>
            <path
              d="M 630 225 C 615 260 630 300 650 290 C 670 270 670 235 655 220 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <path
              d="M 870 225 C 885 260 870 300 850 290 C 830 270 830 235 845 220 Z"
              fill={getMuscleColor('Tríceps')}
              stroke={getMuscleStroke('Tríceps')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Tríceps') }}
            />
            <title>Tríceps Braquial</title>
          </g>

          {/* Glúteos */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Glúteos')}>
            <path
              d="M 750 350 C 690 350 670 390 680 450 C 720 460 745 430 750 350 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <path
              d="M 750 350 C 810 350 830 390 820 450 C 780 460 755 430 750 350 Z"
              fill={getMuscleColor('Glúteos')}
              stroke={getMuscleStroke('Glúteos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Glúteos') }}
            />
            <title>Glúteos (Glúteo Mayor)</title>
          </g>

          {/* Isquiotibiales */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Isquios')}>
            <path
              d="M 680 452 C 665 490 675 540 710 545 C 725 510 720 470 705 452 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <path
              d="M 820 452 C 835 490 825 540 790 545 C 775 510 780 470 795 452 Z"
              fill={getMuscleColor('Isquios')}
              stroke={getMuscleStroke('Isquios')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Isquios') }}
            />
            <title>Isquiotibiales (Femorales)</title>
          </g>

          {/* Gemelos Posteriores */}
          <g className="cursor-pointer transition-all hover:brightness-125" onClick={() => handleMuscleClick('Gemelos')}>
            <path
              d="M 685 565 C 665 595 680 640 710 640 C 720 605 710 575 700 565 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2.5"
              style={{ filter: getMuscleGlow('Gemelos') }}
            />
            <path
              d="M 815 565 C 835 595 820 640 790 640 C 780 605 790 575 800 565 Z"
              fill={getMuscleColor('Gemelos')}
              stroke={getMuscleStroke('Gemelos')}
              strokeWidth="2.5"
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
