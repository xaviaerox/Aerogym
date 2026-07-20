import { supabase } from '../infrastructure/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ualgaluxhznwavksguuu.supabase.co';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/groq-proxy`;

// Groq usa la API compatible con OpenAI
interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequestBody {
  model?: string;
  messages: GroqMessage[];
  max_tokens?: number;
  temperature?: number;
}

/**
 * Llama al proxy de Supabase que contiene la API Key de Groq de forma segura.
 * La API Key NUNCA sale del servidor.
 */
export async function callGroqProxy(body: GroqRequestBody): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuario no autenticado');

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq proxy error ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respuesta vacía de Groq');
  return text.trim();
}

// ================================================================
// SERVICIOS DE IA — Reescritos para usar Groq (OpenAI-compatible)
// ================================================================

export interface UserContextForAI {
  name: string;
  goal: string;
  level: string;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sessionsCount: number;
  lastSessionName?: string;
  lastSessionDate?: string;
  lastSessionVolume?: number;
}

import { z } from 'zod';

const GeneratedRoutineSchema = z.object({
  name: z.string().default('Rutina Personalizada IA'),
  description: z.string().default('Diseñada específicamente para tu objetivo'),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      defaultSets: z.number().default(3),
      defaultReps: z.string().default('8-12'),
      defaultWeight: z.number().default(0),
    })
  ).min(1),
});

/**
 * Genera una rutina personalizada usando IA (via proxy seguro)
 */
export async function generateRoutineWithAI(
  profile: UserContextForAI,
  availableExercises: { id: string; name: string; type: string; muscle_group: string }[]
): Promise<{ name: string; description: string; exercises: { exerciseId: string; defaultSets: number; defaultReps: string; defaultWeight: number }[] }> {
  const exercisesContext = availableExercises
    .map((e) => `- ID: ${e.id}, Nombre: ${e.name}, Tipo: ${e.type}, Músculo: ${e.muscle_group}`)
    .join('\n');

  const text = await callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en diseño de rutinas de entrenamiento. Responde EXCLUSIVAMENTE con JSON válido, sin texto adicional antes ni después.',
      },
      {
        role: 'user',
        content: `Diseña UNA rutina de entrenamiento óptima para este perfil:

PERFIL:
- Nombre: ${profile.name}
- Nivel: ${profile.level}  
- Objetivo: ${profile.goal}

EJERCICIOS DISPONIBLES (usa SOLO estos IDs exactos):
${exercisesContext}

Responde EXCLUSIVAMENTE con JSON válido:
{
  "name": "Nombre creativo",
  "description": "Por qué es ideal para el usuario",
  "exercises": [
    { "exerciseId": "id-exacto", "defaultSets": 3, "defaultReps": "8-12", "defaultWeight": 0 }
  ]
}

Selecciona 5-7 ejercicios coherentes. Sin texto antes/después del JSON.`,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const rawData = JSON.parse(jsonStr);
  return GeneratedRoutineSchema.parse(rawData);
}

/**
 * Analiza el progreso y genera un consejo estoico personalizado
 */
export async function analyzeProgressionWithAI(
  profile: UserContextForAI,
  recentSessions: { date: string; volume: number; exercises: { id: string; bestWeight: number }[] }[],
  healthMetrics?: { date: string; steps: number; sleepHrs: string }[]
): Promise<string> {
  return callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres Aero, el coach estoico de AeroGym. Inspirado en Marco Aurelio, Séneca y Epicteto. 
Sé breve (máximo 3 frases), directo y basado en datos reales del usuario. 
NO uses markdown. NO uses listas. Habla en primera persona refiriéndote al usuario por nombre.`,
      },
      {
        role: 'user',
        content: `Analiza el progreso de ${profile.name}:

HISTORIAL RECIENTE:
${JSON.stringify(recentSessions, null, 2)}

SALUD (últimos días):
${JSON.stringify(healthMetrics || 'No disponible', null, 2)}

CONTEXTO: Nivel ${profile.level}, Objetivo: ${profile.goal}

Da un consejo estoico breve cruzando los datos.`,
      },
    ],
    max_tokens: 512,
    temperature: 0.8,
  }).catch(() => 'La disciplina es el puente entre las metas y los logros. Sigue adelante.');
}

/**
 * Chat interactivo del Coach Aero con contexto RAG dinámico
 */
export async function sendChatMessage(
  profile: UserContextForAI,
  chatHistory: { role: 'user' | 'model'; content: string }[],
  newMessage: string,
  extraContext?: {
    recentSessionsSummary?: string;
    recentHealthSummary?: string;
  }
): Promise<string> {
  // Convertir historial de Gemini (role: 'model') a OpenAI (role: 'assistant')
  const historyMessages: GroqMessage[] = chatHistory.slice(-10).map((m) => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.content,
  }));

  const userMessageContent = `[CONTEXTO DE ${profile.name}: Nivel ${profile.level}, objetivo ${profile.goal}.
Historial total: ${profile.sessionsCount} entrenamientos.
${extraContext?.recentSessionsSummary ? `Entrenamientos recientes:\n${extraContext.recentSessionsSummary}\n` : ''}${extraContext?.recentHealthSummary ? `Métricas de salud y descanso recientes:\n${extraContext.recentHealthSummary}\n` : ''}]

Pregunta: ${newMessage}`;

  return callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres Aero, entrenador personal de élite experto en biomecánica y nutrición deportiva.
- Sé directo, motivador y científico.
- No uses emojis en tus respuestas, mantén un tono profesional, limpio y minimalista.
- Ofrece respuestas breves optimizadas para móvil.
- Utiliza la información del contexto RAG del usuario para dar respuestas personalizadas y precisas sobre su progreso.
- Basa tus respuestas en evidencia científica (ACSM, NIH, ISSN).`,
      },
      ...historyMessages,
      {
        role: 'user',
        content: userMessageContent,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });
}

/**
 * Genera un reporte de progreso semanal estoico e impulsado por datos reales
 */
export async function generateWeeklyReport(
  profile: UserContextForAI,
  weeklyStats: {
    totalSessions: number;
    totalVolumeKg: number;
    avgDurationMin: number;
    totalSteps: number;
    avgSleepHours: number;
    avgSleepQuality: number;
    weightTrend?: string;
  }
): Promise<string> {
  return callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres Aero, el coach estoico y analítico de AeroGym. Genera un reporte de auditoría semanal estructurado, directo y sabio.
- Organiza el reporte en 3 secciones limpias y estructuradas sin usar emojis:
  1. AUDITORÍA SEMANAL: (análisis riguroso de su consistencia, volumen de entrenamiento y métricas de salud/sueño).
  2. PERSPECTIVA ESTOICA: (un recordatorio filosófico estoico de Epicteto, Marco Aurelio o Séneca aplicable a sus logros o deslices de la semana).
  3. PLAN DE ACCIÓN: (2 directrices súper claras y accionables para la próxima semana).
- Mantén las frases concisas y optimizadas para leer en móvil.
- Habla en primera persona refiriéndote al usuario por su nombre.`,
      },
      {
        role: 'user',
        content: `Genera mi reporte semanal con estas métricas:
- Nombre: ${profile.name}
- Nivel: ${profile.level}, Objetivo: ${profile.goal}
- Sesiones entrenadas esta semana: ${weeklyStats.totalSessions} sesiones
- Volumen total acumulado: ${weeklyStats.totalVolumeKg} kg
- Duración media por sesión: ${weeklyStats.avgDurationMin} minutos
- Pasos acumulados esta semana: ${weeklyStats.totalSteps.toLocaleString()} pasos
- Horas de sueño promedio: ${weeklyStats.avgSleepHours.toFixed(1)}h (Calidad media: ${weeklyStats.avgSleepQuality.toFixed(1)}/5)
- Tendencia de peso corporal: ${weeklyStats.weightTrend || 'Estable'}`,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });
}

/**
 * Genera consejo nutricional personalizado
 */
export async function getNutritionalAdvice(
  profile: UserContextForAI,
  nutrition: { targetCalories: number; macros: { protein: number; fat: number; carbs: number } }
): Promise<string> {
  return callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'Eres un nutricionista deportivo experto. Sé breve y directo. Sin listas ni markdown.',
      },
      {
        role: 'user',
        content: `Consejo nutricional breve (2-3 frases) para ${profile.name}:
- Calorías: ${nutrition.targetCalories} kcal
- Proteínas: ${nutrition.macros.protein}g, Grasas: ${nutrition.macros.fat}g, Carbos: ${nutrition.macros.carbs}g
- Objetivo: ${profile.goal}
Sugiere un alimento o hábito concreto. Sin listas ni markdown.`,
      },
    ],
    max_tokens: 256,
    temperature: 0.8,
  }).catch(() => 'Trata tu nutrición como entrenas: con consistencia y propósito.');
}
