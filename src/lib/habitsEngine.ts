import type { Habit, HabitLog, HabitFrequency, HabitCategory } from '../infrastructure/supabase/types';

export interface PresetHabitTemplate {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  target_days: number[];
}

export const PRESET_HABITS: PresetHabitTemplate[] = [
  {
    id: 'noporn',
    name: 'NOPORN / Disciplina Mental',
    description: 'Abstinencia total de pornografía y estímulos dopaminérgicos artificiales',
    category: 'discipline',
    icon: 'Shield',
    color: '#ef4444',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 0],
  },
  {
    id: 'steps',
    name: '10.000 Pasos Diarios',
    description: 'Alcanzar el objetivo de movimiento cardiovascular activo diario',
    category: 'fitness',
    icon: 'Footprints',
    color: '#10b981',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 0],
  },
  {
    id: 'workout',
    name: 'Entrenamiento Completado',
    description: 'Sesión de fuerza, gimnasio o hipertrofia en AeroGym',
    category: 'fitness',
    icon: 'Dumbbell',
    color: '#3b82f6',
    frequency: 'custom_days',
    target_days: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
  },
  {
    id: 'work',
    name: 'Trabajo / Deep Work',
    description: 'Jornada laboral o bloque de trabajo enfocado de alta productividad',
    category: 'productivity',
    icon: 'Briefcase',
    color: '#8b5cf6',
    frequency: 'weekdays',
    target_days: [1, 2, 3, 4, 5], // Lunes a Viernes
  },
  {
    id: 'study',
    name: 'Estudio / Lectura 30 min',
    description: 'Lectura de libros formativos, estudio o adquisición de nuevas destrezas',
    category: 'learning',
    icon: 'BookOpen',
    color: '#f59e0b',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 0],
  },
  {
    id: 'water',
    name: 'Hidratación Óptima (2.5L)',
    description: 'Beber suficiente agua para rendimiento cognitivo y celular',
    category: 'health',
    icon: 'Droplets',
    color: '#06b6d4',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 0],
  },
];

/**
 * Determina si un hábito debe realizarse en una fecha dada según su periodicidad
 */
export function isHabitDueOnDate(habit: Habit, dateInput: string | Date): boolean {
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom_days':
      return Array.isArray(habit.target_days) && habit.target_days.includes(dayOfWeek);
    default:
      return true;
  }
}

/**
 * Parsea una cadena de fecha YYYY-MM-DD en hora local sin desajuste de zona horaria UTC
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

/**
 * Formatea un objeto Date en formato ISO YYYY-MM-DD local
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la racha actual y máxima de un hábito teniendo en cuenta su periodicidad
 */
export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  referenceDateInput: string | Date = new Date()
): { currentStreak: number; longestStreak: number } {
  const refDate = typeof referenceDateInput === 'string' ? parseDateString(referenceDateInput) : referenceDateInput;
  const refDateStr = formatDateString(refDate);

  // Mapa rápido de completado por fecha para este hábito
  const completedDates = new Set<string>();
  for (const log of logs) {
    if (log.habit_id === habit.id && log.completed) {
      completedDates.add(log.date);
    }
  }

  // 1. Calcular racha actual hacia atrás desde hoy/fecha de referencia
  let currentStreak = 0;
  const checkDate = new Date(refDate);

  // Si hoy el hábito es debido y ya se completó, suma 1
  const todayIsDue = isHabitDueOnDate(habit, refDate);
  const todayCompleted = completedDates.has(refDateStr);

  if (todayIsDue && todayCompleted) {
    currentStreak++;
  }

  // Retroceder un día y seguir verificando hacia atrás
  checkDate.setDate(checkDate.getDate() - 1);

  // Límite de búsqueda hacia atrás (ej. hasta 365 días)
  for (let i = 0; i < 365; i++) {
    const isDue = isHabitDueOnDate(habit, checkDate);
    const dateStr = formatDateString(checkDate);

    if (isDue) {
      if (completedDates.has(dateStr)) {
        currentStreak++;
      } else {
        // Rompe la racha si era un día debido y no se completó
        break;
      }
    }
    // Si no era debido (ej. fin de semana para hábito L-V), la racha continúa intacta
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 2. Calcular racha más larga histórica
  let longestStreak = currentStreak;
  let runningStreak = 0;

  // Recorrer los últimos 180 días en orden cronológico ascendente
  const scanDate = new Date(refDate);
  scanDate.setDate(scanDate.getDate() - 180);

  while (scanDate <= refDate) {
    const isDue = isHabitDueOnDate(habit, scanDate);
    const dateStr = formatDateString(scanDate);

    if (isDue) {
      if (completedDates.has(dateStr)) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
    }
    scanDate.setDate(scanDate.getDate() + 1);
  }

  return {
    currentStreak,
    longestStreak,
  };
}

/**
 * Calcula las estadísticas diarias de hábitos para una fecha dada
 */
export function calculateDailyStats(
  habits: Habit[],
  logs: HabitLog[],
  dateStr: string
): {
  dueHabits: Habit[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isAllCompleted: boolean;
} {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const dueHabits = activeHabits.filter((h) => isHabitDueOnDate(h, dateStr));

  const completedSet = new Set(
    logs
      .filter((l) => l.date === dateStr && l.completed)
      .map((l) => l.habit_id)
  );

  const completedCount = dueHabits.filter((h) => completedSet.has(h.id)).length;
  const totalCount = dueHabits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  return {
    dueHabits,
    completedCount,
    totalCount,
    percentage,
    isAllCompleted,
  };
}
