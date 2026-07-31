import React, { memo } from 'react';
import type { MuscleDefinition } from '../../types/HumanBody';
import type { MuscleColorStyle } from '../../utils/colorUtils';
import { MusclePath } from './MusclePath';

interface FrontBodyProps {
  definitions: MuscleDefinition[];
  getStyleForMuscle: (definition: MuscleDefinition) => MuscleColorStyle;
  selectedId?: string;
  hoveredId?: string;
  selectable?: boolean;
  onSelect: (definition: MuscleDefinition) => void;
  onHover: (id?: string) => void;
}

function FrontBodyBase({
  definitions,
  getStyleForMuscle,
  selectedId,
  hoveredId,
  selectable = true,
  onSelect,
  onHover,
}: FrontBodyProps) {
  const frontMuscles = definitions.filter((m) => m.view === 'front');
  return (
    <g id="front_body_group">
      {frontMuscles.map((def) => (
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

export const FrontBody = memo(FrontBodyBase);
