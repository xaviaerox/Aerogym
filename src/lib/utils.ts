import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMuscleWikiUrl(muscleGroup: string): string {
  const mapping: Record<string, string> = {
    'Pecho': 'chest',
    'Espalda': 'back',
    'Hombros': 'shoulders',
    'Cuádriceps': 'quads',
    'Isquios': 'hamstrings',
    'Glúteos': 'glutes',
    'Gemelos': 'calves',
    'Bíceps': 'biceps',
    'Tríceps': 'triceps',
    'Antebrazos': 'forearms',
    'Abdominales': 'abs',
  };
  const slug = mapping[muscleGroup];
  return slug ? `https://musclewiki.com/${slug}` : 'https://musclewiki.com';
}
