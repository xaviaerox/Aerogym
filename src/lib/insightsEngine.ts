import type { DailyHealth, WorkoutSession } from '../infrastructure/supabase/types';
import { isSameDay, subDays } from 'date-fns';

export interface HealthInsight {
  type: 'sleep_volume' | 'steps_energy' | 'consistency_readiness' | 'general';
  title: string;
  description: string;
  impactLevel: 'positive' | 'negative' | 'neutral';
  value: number; // Porcentaje de impacto
}

/**
 * Calcula correlaciones locales entre datos de salud e historial de entrenamiento
 */
export function calculateLocalInsights(
  sessions: WorkoutSession[],
  dailyHealth: DailyHealth[]
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  if (sessions.length < 3 || dailyHealth.length < 3) {
    return [
      {
        type: 'general',
        title: 'Generando Insights...',
        description: 'Registra al menos 3 entrenamientos y 3 logs de salud diarios para que la IA calcule tus correlaciones personalizadas.',
        impactLevel: 'neutral',
        value: 0
      }
    ];
  }

  // 1. CORRELACIÓN SUEÑO VS VOLUMEN
  // Para cada sesión, buscar el sueño registrado en el mismo día
  const sleepVolumePoints: { sleep: number; volume: number }[] = [];
  
  sessions.forEach(session => {
    const sessionDateStr = session.started_at.split('T')[0];
    const healthDay = dailyHealth.find(h => h.date === sessionDateStr);
    if (healthDay && healthDay.sleep_hours && session.total_volume_kg) {
      sleepVolumePoints.push({
        sleep: Number(healthDay.sleep_hours),
        volume: Number(session.total_volume_kg)
      });
    }
  });

  if (sleepVolumePoints.length >= 2) {
    const goodSleepSessions = sleepVolumePoints.filter(p => p.sleep >= 7.5);
    const poorSleepSessions = sleepVolumePoints.filter(p => p.sleep < 7.0);

    if (goodSleepSessions.length > 0 && poorSleepSessions.length > 0) {
      const avgVolGood = goodSleepSessions.reduce((acc, p) => acc + p.volume, 0) / goodSleepSessions.length;
      const avgVolPoor = poorSleepSessions.reduce((acc, p) => acc + p.volume, 0) / poorSleepSessions.length;

      if (avgVolGood > avgVolPoor && avgVolPoor > 0) {
        const pctDiff = Math.round(((avgVolGood - avgVolPoor) / avgVolPoor) * 100);
        insights.push({
          type: 'sleep_volume',
          title: 'Sueño y Rendimiento',
          description: `Tu volumen total levantado aumenta en promedio un ${pctDiff}% los días que duermes 7.5 horas o más, en comparación con noches de menos de 7 horas.`,
          impactLevel: 'positive',
          value: pctDiff
        });
      }
    }
  }

  // 2. CORRELACIÓN PASOS DEL DÍA ANTERIOR VS ENERGÍA DE HOY
  const stepsEnergyPoints: { stepsYesterday: number; energyToday: number }[] = [];

  dailyHealth.forEach(today => {
    const yesterday = new Date(today.date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayHealth = dailyHealth.find(h => h.date === yesterdayStr);

    if (yesterdayHealth && yesterdayHealth.steps && today.energy_level) {
      stepsEnergyPoints.push({
        stepsYesterday: yesterdayHealth.steps,
        energyToday: today.energy_level
      });
    }
  });

  if (stepsEnergyPoints.length >= 2) {
    const highStepsYesterday = stepsEnergyPoints.filter(p => p.stepsYesterday > 12000);
    const lowStepsYesterday = stepsEnergyPoints.filter(p => p.stepsYesterday < 7000);

    if (highStepsYesterday.length > 0 && lowStepsYesterday.length > 0) {
      const avgEnergyHigh = highStepsYesterday.reduce((acc, p) => acc + p.energyToday, 0) / highStepsYesterday.length;
      const avgEnergyLow = lowStepsYesterday.reduce((acc, p) => acc + p.energyToday, 0) / lowStepsYesterday.length;

      if (avgEnergyHigh < avgEnergyLow && avgEnergyLow > 0) {
        const pctDiff = Math.round(((avgEnergyLow - avgEnergyHigh) / avgEnergyLow) * 100);
        insights.push({
          type: 'steps_energy',
          title: 'Actividad y Fatiga',
          description: `Tu nivel subjetivo de energía reportado al día siguiente suele disminuir un ${pctDiff}% cuando caminas más de 12,000 pasos el día anterior, evidenciando fatiga residual.`,
          impactLevel: 'negative',
          value: pctDiff
        });
      }
    }
  }

  // 3. CORRELACIÓN DE CONSISTENCIA VS READINESS
  const recentDays = 7;
  let activeWorkoutDays = 0;
  let readinessSum = 0;
  let readinessCount = 0;

  for (let i = 0; i < recentDays; i++) {
    const d = subDays(new Date(), i);
    const dStr = d.toISOString().split('T')[0];
    const hasWorkout = sessions.some(s => isSameDay(new Date(s.started_at), d));
    if (hasWorkout) activeWorkoutDays++;

    const health = dailyHealth.find(h => h.date === dStr);
    if (health) {
      // Simular cálculo simple de readiness
      let r = 60;
      if (health.sleep_hours) r += Number(health.sleep_hours) * 3;
      if (health.energy_level) r += health.energy_level * 2.5;
      readinessSum += Math.min(100, r);
      readinessCount++;
    }
  }

  const avgReadiness = readinessCount > 0 ? Math.round(readinessSum / readinessCount) : 75;

  if (activeWorkoutDays >= 4 && avgReadiness >= 80) {
    insights.push({
      type: 'consistency_readiness',
      title: 'Consistencia Óptima',
      description: `Has mantenido una frecuencia alta esta semana (${activeWorkoutDays} entrenos) y tu Readiness medio se mantiene excelente (${avgReadiness}%), indicando una óptima adaptación y recuperación muscular.`,
      impactLevel: 'positive',
      value: avgReadiness
    });
  } else if (activeWorkoutDays < 2) {
    insights.push({
      type: 'consistency_readiness',
      title: 'Falta de Estímulo',
      description: `Tu frecuencia de entrenamiento esta semana ha sido baja (${activeWorkoutDays} entrenos). Recuerda que la consistencia es indispensable para la adaptación neuromuscular.`,
      impactLevel: 'neutral',
      value: 0
    });
  }

  // Fallback si no se encontró ninguna correlación específica relevante
  if (insights.length === 0) {
    insights.push({
      type: 'general',
      title: 'Patrón de Consistencia',
      description: 'Tus métricas muestran una constancia saludable. Sigue registrando tus entrenamientos y logs de salud para desbloquear correlaciones avanzadas de fatiga.',
      impactLevel: 'positive',
      value: 100
    });
  }

  return insights;
}
