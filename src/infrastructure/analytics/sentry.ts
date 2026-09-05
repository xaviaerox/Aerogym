/**
 * sentry.ts
 * Proveedor de observabilidad técnica y gestión de excepciones mediante Sentry.
 * Implementa filtrado riguroso de PII, tagging de versión y modo no-op fail-safe.
 */

import * as Sentry from '@sentry/react';
import type { TelemetryProvider, TelemetryInitOptions, TelemetryErrorContext } from './analytics.types';

export class SentryTelemetryProvider implements TelemetryProvider {
  public readonly name = 'sentry';
  private isInitialized = false;
  private isEnabled = false;
  private debug = false;

  public init(options: TelemetryInitOptions): void {
    this.debug = !!options.debug;

    if (!options.sentryDsn || options.enabled === false) {
      if (this.debug) {
        console.log('[Telemetry:Sentry] DSN no provisto o deshabilitado. Modo simulación activo.');
      }
      return;
    }

    try {
      Sentry.init({
        dsn: options.sentryDsn,
        environment: options.environment || 'development',
        release: options.release ? `aerogym@${options.release}` : undefined,
        tracesSampleRate: options.environment === 'production' ? 0.2 : 1.0,
        beforeSend: (event) => {
          // Cortafuegos de privacidad: suprimir URLs con tokens o datos sensibles
          if (event.request?.url) {
            try {
              const parsedUrl = new URL(event.request.url);
              parsedUrl.search = '';
              event.request.url = parsedUrl.toString();
            } catch {
              // fallback silencioso
            }
          }
          // Garantizar que no se adjunten IPs directas si el SDK las capturase
          if (event.user) {
            delete event.user.ip_address;
            delete event.user.email;
            delete event.user.username;
          }
          return event;
        },
      });

      this.isInitialized = true;
      this.isEnabled = true;
      if (this.debug) {
        console.log('[Telemetry:Sentry] Inicializado correctamente en entorno:', options.environment);
      }
    } catch (err) {
      console.warn('[Telemetry:Sentry] Fallo seguro al inicializar Sentry:', err);
    }
  }

  public captureException(error: unknown, context?: TelemetryErrorContext): void {
    if (!this.isEnabled || !this.isInitialized) {
      if (this.debug) {
        console.log('[Telemetry:Sentry Mock] captureException:', error, context);
      }
      return;
    }

    try {
      Sentry.withScope((scope) => {
        if (context?.fatal) {
          scope.setLevel('fatal');
        }
        if (context?.source) {
          scope.setTag('error_source', context.source);
        }
        if (context?.tags) {
          scope.setTags(context.tags);
        }
        if (context?.componentStack) {
          scope.setExtra('componentStack', context.componentStack);
        }
        if (context?.extra) {
          scope.setExtras(context.extra);
        }

        Sentry.captureException(error);
      });
    } catch (err) {
      if (this.debug) {
        console.warn('[Telemetry:Sentry] Error interno en captureException:', err);
      }
    }
  }

  public setUser(userId: string | null): void {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      if (userId) {
        // Solo enviamos el ID anónimo/interno. NUNCA email ni nombre.
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }
    } catch (err) {
      if (this.debug) {
        console.warn('[Telemetry:Sentry] Error al actualizar usuario:', err);
      }
    }
  }
}
