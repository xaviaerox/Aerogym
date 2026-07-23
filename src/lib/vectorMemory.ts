/**
 * vectorMemory.ts — High-Performance Local RAG & Vector Memory Engine.
 *
 * Vectorizes user workout history, PRs, notes, and health trends locally.
 * Uses Cosine Similarity & TF-IDF term weighting for fast, zero-latency RAG retrieval.
 */
import type { WorkoutSession, WorkoutSet } from '../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../constants/exercises';

export interface MemoryDocument {
  id: string;
  type: 'session' | 'pr' | 'note' | 'summary';
  date: string;
  title: string;
  content: string;
  keywords: string[];
  embeddingVector?: Record<string, number>;
}

export class VectorMemoryEngine {
  /**
   * Helper to compute term frequencies for TF-IDF / Cosine Similarity.
   */
  private computeTermVector(text: string): Record<string, number> {
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const vector: Record<string, number> = {};
    for (const token of tokens) {
      vector[token] = (vector[token] || 0) + 1;
    }
    return vector;
  }

  /**
   * Calculates Cosine Similarity between query vector and document vector.
   */
  private calculateCosineSimilarity(
    queryVec: Record<string, number>,
    docVec: Record<string, number>
  ): number {
    let dotProduct = 0;
    let queryMag = 0;
    let docMag = 0;

    for (const term in queryVec) {
      const qVal = queryVec[term];
      queryMag += qVal * qVal;

      if (term in docVec) {
        dotProduct += qVal * docVec[term];
      }
    }

    for (const term in docVec) {
      const dVal = docVec[term];
      docMag += dVal * dVal;
    }

    if (queryMag === 0 || docMag === 0) return 0;
    return dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag));
  }

  /**
   * Constructs searchable memory documents from workout sessions and set logs.
   */
  public buildMemoryDocuments(
    sessions: WorkoutSession[],
    setsHistory: WorkoutSet[]
  ): MemoryDocument[] {
    const docs: MemoryDocument[] = [];

    const exerciseMap = new Map<string, string>(
      BASE_EXERCISES.map((e) => [e.id, e.name])
    );

    // 1. Session Documents
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
        embeddingVector: this.computeTermVector(details),
      });
    });

    // 2. Personal Record (PR) Documents
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
        embeddingVector: this.computeTermVector(content),
      });
    });

    return docs;
  }

  /**
   * Retrieves top relevant memory snippets for a query using Cosine Similarity + Recency Bonus.
   */
  public searchRelevantHistory(
    query: string,
    sessions: WorkoutSession[],
    setsHistory: WorkoutSet[],
    limit = 4
  ): string[] {
    const docs = this.buildMemoryDocuments(sessions, setsHistory);
    if (!docs.length) return [];

    const queryVec = this.computeTermVector(query);
    const queryTokens = Object.keys(queryVec);

    if (!queryTokens.length) {
      return docs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
        .map((d) => d.content);
    }

    const scoredDocs = docs.map((doc) => {
      const cosineSim = doc.embeddingVector ? this.calculateCosineSimilarity(queryVec, doc.embeddingVector) : 0;
      let score = cosineSim * 10;

      // Keyword boost
      queryTokens.forEach((token) => {
        if (doc.keywords.some((k) => k.includes(token))) score += 3;
      });

      // Recency boost (last 14 days)
      const ageDays = (Date.now() - new Date(doc.date).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 14) score += 1.5;

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
