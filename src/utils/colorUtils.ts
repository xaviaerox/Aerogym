export interface MuscleColorStyle {
  fill: string;
  stroke: string;
  opacity: number;
  filter?: string;
}

const FATIGUE_COLOR_STOPS: Array<[number, number, number, number]> = [
  [0, 30, 41, 59],       // 0%: Dark slate (#1e293b)
  [20, 74, 222, 128],    // 20%: Emerald Green (#4ade80)
  [40, 250, 204, 21],    // 40%: Amber Yellow (#facc15)
  [60, 251, 146, 60],    // 60%: Orange (#fb923c)
  [80, 244, 63, 94],     // 80%: Rose (#f43f5e)
  [100, 225, 29, 72],    // 100%: Crimson (#e11d48)
];

export function getInterpolatedRgb(percent: number): { r: number; g: number; b: number } {
  const clamped = Math.max(0, Math.min(100, percent));
  let lower = FATIGUE_COLOR_STOPS[0];
  let upper = FATIGUE_COLOR_STOPS[FATIGUE_COLOR_STOPS.length - 1];
  for (let i = 0; i < FATIGUE_COLOR_STOPS.length - 1; i++) {
    if (clamped >= FATIGUE_COLOR_STOPS[i][0] && clamped <= FATIGUE_COLOR_STOPS[i + 1][0]) {
      lower = FATIGUE_COLOR_STOPS[i];
      upper = FATIGUE_COLOR_STOPS[i + 1];
      break;
    }
  }
  const range = upper[0] - lower[0];
  const factor = range === 0 ? 0 : (clamped - lower[0]) / range;
  return {
    r: Math.round(lower[1] + factor * (upper[1] - lower[1])),
    g: Math.round(lower[2] + factor * (upper[2] - lower[2])),
    b: Math.round(lower[3] + factor * (upper[3] - lower[3])),
  };
}

export function getMuscleColorStyle(
  fatiguePercent: number,
  isHovered: boolean = false,
  isSelected: boolean = false,
  isOutline: boolean = false,
  isSecondary: boolean = false
): MuscleColorStyle {
  // Aerogym Dark Theme Base Colors
  const neutralFill = '#1e293b';       // slate-800
  const neutralHoverFill = '#334155';  // slate-700
  const neutralStroke = '#475569';     // slate-600
  const selectedStroke = '#38bdf8';    // cyan-400

  // 1. Structural outline elements (head, hands, feet, etc.)
  if (isOutline) {
    return {
      fill: isHovered ? neutralHoverFill : neutralFill,
      stroke: neutralStroke,
      opacity: 1.0,
    };
  }

  // Cyan glow filter for selected & hovered states
  let filter: string | undefined = undefined;
  if (isSelected) {
    filter = 'drop-shadow(0 0 3px #38bdf8) drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))';
  } else if (isHovered) {
    filter = 'drop-shadow(0 0 2.5px rgba(56, 189, 248, 0.5))';
  }

  // 2. Selected state styling
  if (isSelected) {
    const { r, g, b } = fatiguePercent > 0 ? getInterpolatedRgb(fatiguePercent) : { r: 56, g: 189, b: 248 };
    return {
      fill: `rgb(${r}, ${g}, ${b})`,
      stroke: selectedStroke,
      opacity: 1.0,
      filter,
    };
  }

  // 3. 0% Fatigue (fresh)
  if (fatiguePercent <= 0) {
    return {
      fill: isHovered ? neutralHoverFill : neutralFill,
      stroke: isHovered ? '#64748b' : neutralStroke,
      opacity: 1.0,
      filter,
    };
  }

  // 4. Primary or Secondary fatigue coloring
  const { r, g, b } = getInterpolatedRgb(fatiguePercent);
  const opacity = isSecondary ? 0.55 : isHovered ? 1.0 : 0.95;
  const strokeColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;

  return {
    fill: `rgb(${r}, ${g}, ${b})`,
    stroke: strokeColor,
    opacity,
    filter,
  };
}
