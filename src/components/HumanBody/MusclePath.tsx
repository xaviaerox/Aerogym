import React, { memo } from 'react';
import type { MuscleDefinition } from '../../types/HumanBody';
import type { MuscleColorStyle } from '../../utils/colorUtils';

interface MusclePathProps {
  definition: MuscleDefinition;
  style: MuscleColorStyle;
  isSelected?: boolean;
  isHovered?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function MusclePathBase({
  definition,
  style,
  isSelected = false,
  isHovered = false,
  selectable = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MusclePathProps) {
  const isOutline = definition.group === 'outline';

  const handleKeyDown = (e: React.KeyboardEvent<SVGPathElement>) => {
    if (!isOutline && selectable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <path
      id={definition.id}
      data-name={definition.name}
      data-group={definition.group}
      d={definition.pathD}
      fill={style.fill}
      fillOpacity={style.opacity}
      stroke={style.stroke}
      strokeWidth={isSelected ? 0.35 : isHovered ? 0.25 : 0.15}
      strokeLinejoin="round"
      strokeLinecap="round"
      filter={style.filter}
      tabIndex={selectable && !isOutline ? 0 : -1}
      role={selectable && !isOutline ? 'button' : undefined}
      aria-label={!isOutline ? `Grupo muscular: ${definition.name}` : undefined}
      aria-pressed={isSelected}
      className={selectable && !isOutline ? 'cursor-pointer transition-all duration-200 hover:opacity-100 focus:outline-none focus:stroke-brand-blue' : ''}
      onClick={isOutline ? undefined : onClick}
      onKeyDown={isOutline ? undefined : handleKeyDown}
      onMouseEnter={isOutline ? undefined : onMouseEnter}
      onMouseLeave={isOutline ? undefined : onMouseLeave}
    >
      {!isOutline && <title>{definition.name}</title>}
    </path>
  );
}

export const MusclePath = memo(MusclePathBase);
