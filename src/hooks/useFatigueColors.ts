import { useMemo } from 'react';
import type { FatigueInput, MuscleDefinition } from '../types/HumanBody';
import { normalizeFatigueData } from '../utils/bodyUtils';
import { getMuscleColorStyle, type MuscleColorStyle } from '../utils/colorUtils';

export function useFatigueColors(
  fatigueInput?: FatigueInput,
  secondaryFatigueInput?: FatigueInput,
  selectedId?: string,
  hoveredId?: string
) {
  const normalizedPrimary = useMemo(
    () => normalizeFatigueData(fatigueInput),
    [fatigueInput]
  );

  const normalizedSecondary = useMemo(
    () => normalizeFatigueData(secondaryFatigueInput),
    [secondaryFatigueInput]
  );

  const getStyleForMuscle = useMemo(() => {
    const styleCache = new Map<string, MuscleColorStyle>();

    return (definition: MuscleDefinition): MuscleColorStyle => {
      const isOutline = definition.group === 'outline';
      const isSelected = selectedId === definition.id;
      const isHovered = hoveredId === definition.id;
      const cacheKey = `${definition.id}_${isSelected}_${isHovered}`;

      if (styleCache.has(cacheKey)) {
        return styleCache.get(cacheKey)!;
      }

      const primaryVal = normalizedPrimary[definition.group] ?? 0;
      const secondaryVal = normalizedSecondary[definition.group] ?? 0;
      const isSecondary = primaryVal === 0 && secondaryVal > 0;
      const fatigueVal = primaryVal > 0 ? primaryVal : secondaryVal;

      const style = getMuscleColorStyle(
        fatigueVal,
        isHovered,
        isSelected,
        isOutline,
        isSecondary
      );

      styleCache.set(cacheKey, style);
      return style;
    };
  }, [normalizedPrimary, normalizedSecondary, selectedId, hoveredId]);

  return {
    normalizedFatigue: normalizedPrimary,
    getStyleForMuscle,
  };
}
