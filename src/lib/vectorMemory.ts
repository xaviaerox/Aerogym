import type { WorkoutSession, WorkoutSet } from '../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../constants/exercises';

export interface MemoryDocument {
  id: string;
  type: 'session' | 'pr' | 'note' | 'summary';
  date: string;
  title: string;
  content: string;
  keywords: string[];
}

export class VectorMemoryEngine {
  /**
   * Construye documentos de memoria a partir del historial completo de sesiones y series.
   */
  public buildMemoryDocuments(
    sessions: WorkoutSession[],
    setsHistory: WorkoutSet[]
  ): MemoryDocument[] {
    const docs: MemoryDocument[] = [];

    // Map para acelerar búsqueda de nombre de ejercicio
    const exerciseMap = new Map<string, string>(
      BASE_EXERCISES.map((e) => [e.id, e.name])
    );

    // 1. Documentos por sesión
    sessions.forEach((session) => {
      const sessionSets = setsHistory.filter((s) => s.session_id === session.id);
      const exercisesUsed = [...new Set(sessionSets.map((s) => exerciseMap.get(s.exercise_id) || s.exercise_id))];
      const dateStr = session.started_at.split('T')[0];

      let details = `Sesión: ${session.name} el ${dateStr}. Duración: ${session.duration_minutes || 0} min. Volumen total: ${session.total_volume_kg || 0} kg. Ejercicios realizados: ${exercisesUsed.join(', ')}.`;
      if (session.notes) {
        details += ` Notas: "${session.notes}".`;
      }

      docs.push({
        id: `session-${session.id}`,
        type: 'session',
        date: dateStr,
        title: session.name,
        content: details,
        keywords: [
          session.name.toLowerCase(),
          dateStr,
          ...exercisesUsed.map((e) => e.toLowerCase()),
        ],
      });
    });

    // 2. Documentos por Récords Personales (PRs)
    const prSets = setsHistory.filter((s) => s.is_pr);
    prSets.forEach((set) => {
      const exName = exerciseMap.get(set.exercise_id) || set.exercise_id;
      const dateStr = set.logged_at ? set.logged_at.split('T')[0] : 'fecha desconocida';
      const content = `Récord Personal (PR) en ${exName}: ${set.weight_kg} kg x ${set.reps} reps (1RM estimado: ${set.e1rm_kg ? Math.round(Number(set.e1rm_kg)) : 0} kg) el ${dateStr}.`;

      docs.push({
        id: `pr-${set.id}`,
        type: 'pr',
        date: dateStr,
        title: `PR ${exName}`,
        content,
        keywords: ['pr', 'récord', 'record', exName.toLowerCase(), dateStr],
      });
    });

    return docs;
  }

  /**
   * Recupera los fragmentos de memoria más relevantes para una consulta usando puntuación por coincidencia semántica y palabras clave.
   */
  public searchRelevantHistory(
    query: string,
    sessions: WorkoutSession[],
    setsHistory: WorkoutSet[],
    limit = 4
  ): string[] {
    const docs = this.buildMemoryDocuments(sessions, setsHistory);
    if (!docs.length) return [];

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (!queryTokens.length) {
      // Si la consulta es genérica, devolver los 3 eventos más recientes
      return docs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
        .map((d) => d.content);
    }

    const scoredDocs = docs.map((doc) => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();

      queryTokens.forEach((token) => {
        if (contentLower.includes(token)) score += 3;
        if (doc.keywords.some((k) => k.includes(token))) score += 5;
      });

      // Bonus por ser reciente
      const ageDays = (Date.now() - new Date(doc.date).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 14) score += 2;

      return { doc, score };
    });

    return scoredDocs
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.doc.content);
  }
}

export const vectorMemoryEngine = new VectorMemoryEngine();
