import React from 'react';
import {
  Shield,
  Footprints,
  Dumbbell,
  Briefcase,
  BookOpen,
  Droplets,
  Flame,
  Brain,
  Heart,
  Sparkles,
  CheckCircle2,
  Target,
  Moon,
  Scale,
  Coffee,
  Smile,
  Trophy,
  Zap,
  Activity,
  Award,
  Sun,
  type LucideIcon,
} from 'lucide-react';

export const HABIT_ICONS_MAP: Record<string, LucideIcon> = {
  Shield,
  Footprints,
  Dumbbell,
  Briefcase,
  BookOpen,
  Droplets,
  Flame,
  Brain,
  Heart,
  Sparkles,
  CheckCircle2,
  Target,
  Moon,
  Scale,
  Coffee,
  Smile,
  Trophy,
  Zap,
  Activity,
  Award,
  Sun,
};

interface HabitIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function HabitIcon({ name, size = 20, className }: HabitIconProps) {
  const IconComponent = HABIT_ICONS_MAP[name] || CheckCircle2;
  return <IconComponent size={size} className={className} />;
}
