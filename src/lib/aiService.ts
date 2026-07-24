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

/**
 * Sanitiza los textos del usuario para prevenir ataques de Prompt Injection.
 * Elimina comandos de anulación de instrucciones y limita la longitud del mensaje.
 */
export function sanitizePromptInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  
  let cleaned = input
    // Reemplazar patrones conocidos de anulación de instrucciones
    .replace(/(?:ignore|forget|disregard)\s+(?:previous|all|system)\s+(?:instructions|prompts|rules)/gi, '[filtrado]')
    .replace(/(?:you\s+are\s+now|act\s+as)\s+(?:a|an)?\s*(?:unrestricted|dan|jailbreak)/gi, '[filtrado]')
    // Eliminar caracteres nulos o no imprimibles
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned.trim();
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

function generateFallbackRoutine(
  profile: UserContextForAI,
  availableExercises: { id: string; name: string; type: string; muscle_group: string }[]
) {
  const goal = (profile.goal || '').toLowerCase();
  let routineName = 'Rutina FullBody Aero';
  let description = 'Rutina equilibrada de cuerpo completo optimizada para tu nivel.';
  
  if (goal.includes('hypertrophy') || goal.includes('hipertrofia') || goal.includes('músculo')) {
    routineName = 'Rutina Push & Pull Hipertrofia';
    description = 'Enfoque en estímulo y volumen optimizado para ganancia muscular.';
  } else if (goal.includes('strength') || goal.includes('fuerza')) {
    routineName = 'Fuerza & Potencia Base';
    description = 'Construcción de fuerza máxima con ejercicios compuestos principales.';
  } else if (goal.includes('endurance') || goal.includes('definicion') || goal.includes('grasa')) {
    routineName = 'Acondicionamiento & Definición';
    description = 'Alta densidad con combinación de ejercicios compuestos y aislados.';
  }

  const validExercises = availableExercises.length > 0 ? availableExercises : [
    { id: 'press-banca', name: 'Press de Banca con Barra', type: 'compound', muscle_group: 'Pecho' },
    { id: 'sentadilla-trasera', name: 'Sentadilla con Barra', type: 'compound', muscle_group: 'Cuádriceps' },
    { id: 'remon-barra', name: 'Remo con Barra', type: 'compound', muscle_group: 'Espalda' },
    { id: 'press-militar', name: 'Press Militar de Pie', type: 'compound', muscle_group: 'Hombros' },
    { id: 'curl-biceps-mancuernas', name: 'Curl de Bíceps', type: 'isolation', muscle_group: 'Bíceps' },
  ];

  const selected: string[] = [];
  const groupsSeen = new Set<string>();

  for (const ex of validExercises) {
    if (!groupsSeen.has(ex.muscle_group) && selected.length < 6) {
      groupsSeen.add(ex.muscle_group);
      selected.push(ex.id);
    }
  }

  if (selected.length < 4) {
    for (const ex of validExercises) {
      if (!selected.includes(ex.id) && selected.length < 5) {
        selected.push(ex.id);
      }
    }
  }

  return {
    name: routineName,
    description,
    exercises: selected.map((id) => ({
      exerciseId: id,
      defaultSets: 3,
      defaultReps: '8-12',
      defaultWeight: 0,
    })),
  };
}

/**
 * Genera una rutina personalizada usando IA (via proxy seguro)
 */
export async function generateRoutineWithAI(
  profile: UserContextForAI,
  availableExercises: { id: string; name: string; type: string; muscle_group: string }[]
): Promise<{ name: string; description: string; exercises: { exerciseId: string; defaultSets: number; defaultReps: string; defaultWeight: number }[] }> {
  try {
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
    const parsed = GeneratedRoutineSchema.parse(rawData);

    // Mapear y asegurar que los IDs de ejercicios sean válidos
    const validIds = new Set(availableExercises.map((e) => e.id));
    const sanitizedExercises = parsed.exercises
      .map((ex) => {
        if (validIds.has(ex.exerciseId)) return ex;
        // Mapeo difuso si el ID devuelto por IA difiere levemente
        const matched = availableExercises.find(
          (e) => e.id.includes(ex.exerciseId) || ex.exerciseId.includes(e.id)
        );
        return matched ? { ...ex, exerciseId: matched.id } : null;
      })
      .filter((ex): ex is NonNullable<typeof ex> => ex !== null);

    if (sanitizedExercises.length === 0) {
      return generateFallbackRoutine(profile, availableExercises);
    }

    return {
      ...parsed,
      exercises: sanitizedExercises,
    };
  } catch (err) {
    console.warn('generateRoutineWithAI failed or offline, returning fallback routine:', err);
    return generateFallbackRoutine(profile, availableExercises);
  }
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
    ragMemorySnippets?: string[];
  }
): Promise<string> {
  // Convertir historial de Gemini (role: 'model') a OpenAI (role: 'assistant')
  const historyMessages: GroqMessage[] = chatHistory.slice(-10).map((m) => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.content,
  }));

  const ragText = extraContext?.ragMemorySnippets && extraContext.ragMemorySnippets.length > 0
    ? `\nMEMORIA RAG RELEVANTE RECUPERADA:\n${extraContext.ragMemorySnippets.map((s) => `- ${s}`).join('\n')}\n`
    : '';

  const sanitizedQuery = sanitizePromptInput(newMessage);

  const userMessageContent = `[CONTEXTO DE ${profile.name}: Nivel ${profile.level}, objetivo ${profile.goal}.
Historial total: ${profile.sessionsCount} entrenamientos.
${extraContext?.recentSessionsSummary ? `Entrenamientos recientes:\n${extraContext.recentSessionsSummary}\n` : ''}${extraContext?.recentHealthSummary ? `Métricas de salud y descanso recientes:\n${extraContext.recentHealthSummary}\n` : ''}${ragText}]

Pregunta: ${sanitizedQuery}`;

  return callGroqProxy({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres Aero, entrenador personal de élite experto en biomecánica y nutrición deportiva.
- Sé directo, motivador y científico.
- No uses emojis en tus respuestas, mantén un tono profesional, limpio y minimalista.
- Ofrece respuestas breves optimizadas para móvil.
- Utiliza la información de la MEMORIA RAG y contexto del usuario para responder con datos precisos e históricos del atleta.
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
 * Chat interactivo del Coach Aero con soporte de Streaming en tiempo real token a token
 */
export async function sendChatMessageStream(
  profile: UserContextForAI,
  chatHistory: { role: 'user' | 'model'; content: string }[],
  newMessage: string,
  onChunk: (accumulatedText: string) => void,
  extraContext?: {
    recentSessionsSummary?: string;
    recentHealthSummary?: string;
    ragMemorySnippets?: string[];
  }
): Promise<string> {
  try {
    const fullText = await sendChatMessage(profile, chatHistory, newMessage, extraContext);
    
    // Simulación fluida de streaming progresivo si el servidor proxy devuelve la respuesta completa
    const words = fullText.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    return fullText;
  } catch (err) {
    console.error('Streaming chat failed, throwing:', err);
    throw err;
  }
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
