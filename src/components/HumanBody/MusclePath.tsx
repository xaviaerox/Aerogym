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
      className={selectable && !isOutline ? 'cursor-pointer transition-all duration-200 hover:opacity-100' : ''}
      onClick={isOutline ? undefined : onClick}
      onMouseEnter={isOutline ? undefined : onMouseEnter}
      onMouseLeave={isOutline ? undefined : onMouseLeave}
    >
      {!isOutline && <title>{definition.name}</title>}
    </path>
  );
}

export const MusclePath = memo(MusclePathBase);
