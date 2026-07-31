import React, { memo } from 'react';
import type { MuscleDefinition } from '../../types/HumanBody';
import type { MuscleColorStyle } from '../../utils/colorUtils';
import { MusclePath } from './MusclePath';

interface BackBodyProps {
  definitions: MuscleDefinition[];
  getStyleForMuscle: (definition: MuscleDefinition) => MuscleColorStyle;
  selectedId?: string;
  hoveredId?: string;
  selectable?: boolean;
  onSelect: (definition: MuscleDefinition) => void;
  onHover: (id?: string) => void;
}

function BackBodyBase({
  definitions,
  getStyleForMuscle,
  selectedId,
  hoveredId,
  selectable = true,
  onSelect,
  onHover,
}: BackBodyProps) {
  const backMuscles = definitions.filter((m) => m.view === 'back');
  return (
    <g id="back_body_group">
      {backMuscles.map((def) => (
        <MusclePath
          key={def.id}
          definition={def}
          style={getStyleForMuscle(def)}
          isSelected={selectedId === def.id}
          isHovered={hoveredId === def.id}
          selectable={selectable}
          onClick={() => onSelect(def)}
          onMouseEnter={() => onHover(def.id)}
          onMouseLeave={() => onHover(undefined)}
        />
      ))}
    </g>
  );
}

export const BackBody = memo(BackBodyBase);
