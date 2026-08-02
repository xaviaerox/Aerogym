/**
 * telemetryService.ts — Servicio desacoplado de telemetría de errores y logs estructurados.
 */
import { supabase } from '../infrastructure/supabase/client';

export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

export interface TelemetryPayload {
  level?: LogLevel;
  category: string;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
}

export class TelemetryService {
  public async log(payload: TelemetryPayload): Promise<void> {
    const level = payload.level || 'info';
    console[level === 'fatal' ? 'error' : level](
      `[Telemetry][${payload.category.toUpperCase()}] ${payload.message}`,
      payload.context || ''
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = payload.userId || session?.user?.id || null;

      await supabase.from('telemetry_logs').insert({
        user_id: userId,
        level,
        category: payload.category,
        message: payload.message,
        context: payload.context || {},
      });
    } catch {
      // Ignorar errores de telemetría si se está fuera de línea
    }
  }
}

export const telemetryService = new TelemetryService();
