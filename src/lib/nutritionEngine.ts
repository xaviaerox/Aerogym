import type { Profile } from '../infrastructure/supabase/types';

export interface NutritionPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  groceryList: { category: string; items: string[] }[];
}

export function calculateAdaptiveNutrition(
  profile: Partial<Profile>,
  overallFatiguePercent = 0
): NutritionPlan {
  const weight = Number(profile.weight_kg) || 75;
  const height = Number(profile.height_cm) || 175;
  const age = Number(profile.age) || 25;
  const isFemale = profile.gender === 'female';

  // Tasa de Metabolismo Basal (BMR - Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age + (isFemale ? -161 : 5);
  if (isNaN(bmr) || bmr < 1000) bmr = 1800;

  // Factor de actividad
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[profile.activity_level || 'moderate'] || 1.55;
  let maintenanceCalories = Math.round(bmr * multiplier);

  // Ajuste por objetivo deportivo
  let targetCalories = maintenanceCalories;
  if (profile.goal === 'hypertrophy') {
    targetCalories += 300; // Superávit magro
  } else if (profile.goal === 'fat_loss') {
    targetCalories -= 400; // Déficit sostenido
  } else if (profile.goal === 'strength') {
    targetCalories += 200;
  }

  // Ajuste adaptativo por fatiga acumulada (+100-200 kcal para recuperación si fatiga > 65%)
  if (overallFatiguePercent > 65) {
    targetCalories += 150;
  }

  // Cálculo de macronutrientes
  // Proteína: 2.0g/kg (o 2.2g si está en definición)
  const proteinPerKg = profile.goal === 'fat_loss' ? 2.2 : 2.0;
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Grasas: 0.9g/kg
  const fatGrams = Math.round(weight * 0.9);
  const fatCalories = fatGrams * 9;

  // Carbohidratos: el resto de calorías
  const remainingCalories = Math.max(400, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Agua recomendada (litros): 35ml por kg de peso corporal
  const waterLiters = Number(((weight * 35) / 1000).toFixed(1));

  // Generación de lista de la compra limpia
  const groceryList = [
    {
      category: '🥩 Fuentes de Proteína Limpia',
      items: ['Pechuga de Pollo / Pavo', 'Lomo de Salmón / Atún', 'Huevos Camperos', 'Requesón / Queso Batido 0%', 'Aislado de Proteína de Suero (Whey)'],
    },
    {
      category: '🌾 Carbohidratos Complejos & Energía',
      items: ['Avena Integral', 'Arroz Basmati / Integral', 'Boniato / Patata', 'Pan de Centeno Integral', 'Quinoa'],
    },
    {
      category: '🥑 Grasas Saludables',
      items: ['Aguacate', 'Aceite de Oliva Virgen Extra', 'Nueces y Almendras al Natural', 'Crema de Cacahuete 100%'],
    },
    {
      category: '🥦 Vegetales & Antioxidantes',
      items: ['Brócoli y Espinacas', 'Arándanos y Frutos Rojos', 'Plátanos (Pre-entrenamiento)'],
    },
  ];

  return {
    dailyCalories: Math.round(targetCalories),
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    groceryList,
  };
}
