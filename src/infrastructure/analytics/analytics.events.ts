/**
 * analytics.events.ts
 * Catálogo canónico y tipado estricto de eventos de producto para AeroGym.
 * 
 * Reglas de diseño:
 * - Nombres descriptivos, en inglés, snake_case y orientados a acciones.
 * - Sin PII ni datos de salud individuales.
 * - Tipado exhaustivo de propiedades por evento.
 */

export type AnalyticsEvent =
  | 'app_opened'
  | 'view_changed'
  | 'signup_completed'
  | 'login_completed'
  | 'logout_completed'
  | 'workout_started'
  | 'workout_completed'
  | 'workout_cancelled'
  | 'routine_created'
  | 'routine_deleted'
  | 'health_imported'
  | 'coach_message_sent'
  | 'achievement_unlocked'
  | 'pwa_update_available'
  | 'sync_completed';

export interface AnalyticsEventPropertiesMap {
  app_opened: {
    platform?: string;
    is_pwa?: boolean;
    app_version?: string;
  };
  view_changed: {
    view_name: string;
  };
  signup_completed: {
    auth_method: 'email' | 'google';
  };
  login_completed: {
    auth_method: 'email' | 'google' | 'guest';
  };
  logout_completed: Record<string, never>;
  workout_started: {
    routine_id?: string;
    is_custom?: boolean;
  };
  workout_completed: {
    duration_seconds: number;
    exercise_count: number;
    set_count: number;
    total_volume_kg: number;
    has_cardio: boolean;
    is_pr?: boolean;
  };
  workout_cancelled: {
    duration_seconds: number;
    sets_completed: number;
  };
  routine_created: {
    split_type?: string;
    exercise_count: number;
  };
  routine_deleted: {
    split_type?: string;
  };
  health_imported: {
    source: 'zepp' | 'google_fit';
    records_count: number;
  };
  coach_message_sent: {
    has_context: boolean;
    length_bucket: '<50' | '50-200' | '>200';
  };
  achievement_unlocked: {
    achievement_id: string;
    xp_awarded: number;
  };
  pwa_update_available: {
    current_version: string;
    new_version?: string;
  };
  sync_completed: {
    actions_count: number;
    duration_ms: number;
    status: 'success' | 'partial';
  };
}

export type EventProperties<E extends AnalyticsEvent> = AnalyticsEventPropertiesMap[E];
