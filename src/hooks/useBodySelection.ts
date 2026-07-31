import { useState, useCallback } from 'react';
import type { MuscleData, MuscleDefinition } from '../types/HumanBody';
import { MUSCLE_DEFINITIONS } from '../data/muscleDefinitions';

interface UseBodySelectionProps {
  initialSelectedId?: string;
  onSelect?: (muscle: MuscleData) => void;
  selectable?: boolean;
}

export function useBodySelection({
  initialSelectedId,
  onSelect,
  selectable = true,
}: UseBodySelectionProps = {}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);

  const handleSelect = useCallback(
    (definition: MuscleDefinition, fatigueVal: number) => {
      if (!selectable) return;
      setSelectedId(definition.id);

      if (onSelect) {
        onSelect({
          id: definition.id,
          name: definition.name,
          side: definition.side,
          view: definition.view,
          group: definition.group,
          fatigue: fatigueVal,
          selected: true,
        });
      }
    },
    [selectable, onSelect]
  );

  const handleHover = useCallback((id?: string) => {
    setHoveredId(id);
  }, []);

  const getActiveMuscleData = useCallback(
    (fatigueMap: Record<string, number>): MuscleData | null => {
      const activeId = selectedId || hoveredId;
      if (!activeId) return null;

      const def = MUSCLE_DEFINITIONS.find((m) => m.id === activeId);
      if (!def || def.group === 'outline') return null;

      return {
        id: def.id,
        name: def.name,
        side: def.side,
        view: def.view,
        group: def.group,
        fatigue: fatigueMap[def.group] ?? 0,
        selected: def.id === selectedId,
        hovered: def.id === hoveredId,
      };
    },
    [selectedId, hoveredId]
  );

  return {
    selectedId,
    hoveredId,
    handleSelect,
    handleHover,
    getActiveMuscleData,
  };
}
