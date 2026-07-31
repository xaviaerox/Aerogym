import React from 'react';
import type { HumanBodyProps } from '../../types/HumanBody';
import { MUSCLE_DEFINITIONS } from '../../data/muscleDefinitions';
import { useBodySelection } from '../../hooks/useBodySelection';
import { useFatigueColors } from '../../hooks/useFatigueColors';
import { FrontBody } from './FrontBody';
import { BackBody } from './BackBody';
import { cn } from '../../lib/utils';

/**
 * HumanBody — Interactive anatomical 2D body map component for Aerogym.
 *
 * Uses professional SVG paths from the body-muscles open source library (MIT).
 * Styled specifically to match Aerogym's dark glassmorphism theme.
 */
export default function HumanBody({
  view = 'all',
  fatigue,
  secondaryFatigue,
  selectedMuscleId,
  onSelect,
  selectable = true,
  className,
  showLabels = true,
}: HumanBodyProps) {
  const { selectedId, hoveredId, handleSelect, handleHover, getActiveMuscleData } =
    useBodySelection({
      initialSelectedId: selectedMuscleId,
      onSelect,
      selectable,
    });

  const { normalizedFatigue, getStyleForMuscle } = useFatigueColors(
    fatigue,
    secondaryFatigue,
    selectedId,
    hoveredId
  );

  const activeMuscle = getActiveMuscleData(normalizedFatigue);

  const showFront = view === 'all' || view === 'front';
  const showBack = view === 'all' || view === 'back';

  // ViewBox matching the body-muscles SVG coordinate system with top space for labels
  const viewBox = view === 'front'
    ? '-1 -6 35 102'
    : view === 'back'
    ? '35 -6 35 102'
    : '-1 -6 71 102';

  return (
    <div className={cn(
      'relative flex flex-col items-center select-none p-4 rounded-2xl',
      'bg-slate-950/90 border border-white/5 shadow-2xl overflow-hidden',
      className
    )}>
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      <svg
        viewBox={viewBox}
        className="w-full max-w-[540px] h-auto overflow-visible relative z-10 drop-shadow-md"
        style={{ background: 'transparent' }}
        role="img"
        aria-label="Mapa anatómico muscular interactivo"
      >
        {/* Section labels above the heads */}
        {showLabels && view === 'all' && (
          <>
            <text
              x="16"
              y="-1.5"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="2.0"
              fontWeight="800"
              letterSpacing="0.12"
              fontFamily="Inter, system-ui, sans-serif"
            >
              FRONTAL
            </text>
            <text
              x="52.5"
              y="-1.5"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="2.0"
              fontWeight="800"
              letterSpacing="0.12"
              fontFamily="Inter, system-ui, sans-serif"
            >
              POSTERIOR
            </text>
            <line
              x1="34"
              y1="-4"
              x2="34"
              y2="94"
              stroke="#334155"
              strokeWidth="0.15"
              strokeDasharray="0.6 0.6"
            />
          </>
        )}

        {/* Front body muscles */}
        {showFront && (
          <FrontBody
            definitions={MUSCLE_DEFINITIONS}
            getStyleForMuscle={getStyleForMuscle}
            selectedId={selectedId}
            hoveredId={hoveredId}
            selectable={selectable}
            onSelect={(def) => handleSelect(def, normalizedFatigue[def.group] ?? 0)}
            onHover={handleHover}
          />
        )}

        {/* Back body muscles */}
        {showBack && (
          <BackBody
            definitions={MUSCLE_DEFINITIONS}
            getStyleForMuscle={getStyleForMuscle}
            selectedId={selectedId}
            hoveredId={hoveredId}
            selectable={selectable}
            onSelect={(def) => handleSelect(def, normalizedFatigue[def.group] ?? 0)}
            onHover={handleHover}
          />
        )}
      </svg>

      {/* Active muscle tooltip */}
      {activeMuscle && (
        <div className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in duration-150 relative z-20">
          <span>{activeMuscle.name}</span>
          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-brand-blue font-mono font-extrabold">
            {activeMuscle.fatigue}% Fatiga
          </span>
        </div>
      )}
    </div>
  );
}
