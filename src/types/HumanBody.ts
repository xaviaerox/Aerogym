export type BodySide = 'left' | 'right' | 'center';
export type BodyView = 'front' | 'back';

export type MuscleGroup =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'back'
  | 'traps'
  | 'lower_back'
  | 'quads'
  | 'glutes'
  | 'hamstrings'
  | 'calves'
  | 'outline';

export interface MuscleDefinition {
  id: string;
  name: string;
  side: BodySide;
  view: BodyView;
  group: MuscleGroup;
  pathD: string;
}

export interface MuscleData {
  id: string;
  name: string;
  side: BodySide;
  view: BodyView;
  group: MuscleGroup;
  fatigue: number;
  selected?: boolean;
  hovered?: boolean;
  isSecondary?: boolean;
}

export type FatigueInput =
  | Record<string, number>
  | Map<string, number>
  | Array<{ muscleGroup: string; fatiguePercent: number; isSecondary?: boolean }>;

export interface HumanBodyProps {
  view?: 'all' | 'front' | 'back';
  fatigue?: FatigueInput;
  secondaryFatigue?: FatigueInput;
  selectedMuscleId?: string;
  onSelect?: (muscle: MuscleData) => void;
  selectable?: boolean;
  className?: string;
  showLabels?: boolean;
}
