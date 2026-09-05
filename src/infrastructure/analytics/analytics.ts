/**
 * analytics.ts
 * Fachada centralizada y desacoplada de Analytics y Observabilidad para AeroGym.
 * 
 * Principios:
 * 1. Non-blocking & Fail-safe: Cualquier error interno o del proveedor es silenciado.
 * 2. Privacy-first: Sanitización proactiva de PII y datos de salud antes de despachar.
 * 3. Eventos fuertemente tipados.
 */

import type {
  TelemetryInitOptions,
  TelemetryProvider,
  ProductAnalyticsProvider,
  TelemetryErrorContext,
} from './analytics.types';
import type { AnalyticsEvent, EventProperties } from './analytics.events';
import { SentryTelemetryProvider } from './sentry';
import { PostHogAnalyticsProvider } from './posthog';

const EXACT_SENSITIVE_KEYS = new Set([
  'name',
  'fullname',
  'full_name',
  'first_name',
  'last_name',
  'username',
  'user_name',
  'email',
  'user_email',
  'phone',
  'phone_number',
  'telephone',
  'address',
  'password',
  'passwd',
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'secret',
  'authorization',
  'notes',
  'user_notes',
  'prompt',
  'response',
  'diagnosis',
  'clinical',
  'medical',
  'blood_pressure',
  'glucose',
  'sleep_records',
  'weight',
  'weight_kg',
  'height',
  'body_fat',
  'body_fat_percentage',
]);

const SENSITIVE_SUBSTRINGS = [
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'diagnosis',
  'medical',
  'clinical',
  'notes',
  'prompt',
  'weight',
  'glucose',
  'blood_pressure',
];


const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export class AnalyticsService {
  private telemetryProvider: TelemetryProvider;
  private productAnalyticsProvider: ProductAnalyticsProvider;
  private isInitialized = false;
  private debug = false;

  constructor(
    telemetryProvider?: TelemetryProvider,
    productAnalyticsProvider?: ProductAnalyticsProvider
  ) {
    this.telemetryProvider = telemetryProvider || new SentryTelemetryProvider();
    this.productAnalyticsProvider = productAnalyticsProvider || new PostHogAnalyticsProvider();
  }

  /**
   * Permite inyectar proveedores (útil para testing y mocks).
   */
  public setProviders(
    telemetryProvider: TelemetryProvider,
    productAnalyticsProvider: ProductAnalyticsProvider
  ): void {
    this.telemetryProvider = telemetryProvider;
    this.productAnalyticsProvider = productAnalyticsProvider;
  }

  /**
   * Inicializa los proveedores configurados con variables de entorno o parámetros explícitos.
   */
  public init(customOptions?: Partial<TelemetryInitOptions>): void {
    try {
      const isEnabled =
        customOptions?.enabled !== undefined
          ? customOptions.enabled
          : import.meta.env.VITE_TELEMETRY_ENABLED !== 'false';

      const options: TelemetryInitOptions = {
        enabled: isEnabled,
        environment: customOptions?.environment || import.meta.env.MODE || 'development',
        release: customOptions?.release || import.meta.env.VITE_APP_VERSION,
        sentryDsn: customOptions?.sentryDsn || import.meta.env.VITE_SENTRY_DSN,
        posthogKey: customOptions?.posthogKey || import.meta.env.VITE_POSTHOG_KEY,
        posthogHost: customOptions?.posthogHost || import.meta.env.VITE_POSTHOG_HOST,
        debug:
          customOptions?.debug !== undefined
            ? customOptions.debug
            : import.meta.env.DEV || import.meta.env.VITE_ANALYTICS_DEBUG === 'true',
      };

      this.debug = !!options.debug;

      this.telemetryProvider.init(options);
      this.productAnalyticsProvider.init(options);
      this.isInitialized = true;

      if (this.debug) {
        console.log('[AnalyticsFacade] Inicializado con éxito. Debug activado.');
      }
    } catch (err) {
      // Fail-safe: nunca romper el arranque de la app
      console.warn('[AnalyticsFacade] Error seguro durante init():', err);
    }
  }

  /**
   * Registra un evento de producto tipado tras pasar por el filtro de privacidad.
   */
  public track<E extends AnalyticsEvent>(
    eventName: E,
    properties?: EventProperties<E>
  ): void {
    try {
      const sanitizedProps = this.sanitizeData(properties as Record<string, unknown>);
      this.productAnalyticsProvider.capture(eventName, sanitizedProps);
    } catch (err) {
      if (this.debug) {
        console.warn(`[AnalyticsFacade] Error seguro en track(${eventName}):`, err);
      }
    }
  }

  /**
   * Identifica de forma anónima al usuario utilizando exclusivamente su UUID interno.
   */
  public identify(userId: string, traits?: Record<string, unknown>): void {
    try {
      if (!userId) return;

      // Cortafuegos: si por error se pasa un email como userId, anonimizarlo
      const cleanUserId = userId.includes('@') ? 'anonymized-user' : userId;
      const sanitizedTraits = traits ? this.sanitizeData(traits) : undefined;

      this.productAnalyticsProvider.identify(cleanUserId, sanitizedTraits);
      this.telemetryProvider.setUser(cleanUserId);
    } catch (err) {
      if (this.debug) {
        console.warn('[AnalyticsFacade] Error seguro en identify():', err);
      }
    }
  }

  /**
   * Registra la navegación entre vistas o pestañas.
   */
  public page(viewName: string, extraProperties?: Record<string, unknown>): void {
    try {
      this.track('view_changed', {
        view_name: viewName,
        ...(extraProperties || {}),
      });
    } catch (err) {
      if (this.debug) {
        console.warn(`[AnalyticsFacade] Error seguro en page(${viewName}):`, err);
      }
    }
  }

  /**
   * Captura errores y excepciones no controladas en Sentry.
   */
  public error(error: unknown, context?: TelemetryErrorContext): void {
    try {
      const sanitizedContext: TelemetryErrorContext | undefined = context
        ? {
            ...context,
            extra: context.extra ? this.sanitizeData(context.extra) : undefined,
          }
        : undefined;

      this.telemetryProvider.captureException(error, sanitizedContext);
    } catch (err) {
      if (this.debug) {
        console.warn('[AnalyticsFacade] Error seguro en error():', err);
      }
    }
  }

  /**
   * Limpia la identidad del usuario en caso de logout.
   */
  public reset(): void {
    try {
      this.productAnalyticsProvider.reset();
      this.telemetryProvider.setUser(null);
    } catch (err) {
      if (this.debug) {
        console.warn('[AnalyticsFacade] Error seguro en reset():', err);
      }
    }
  }

  /**
   * Filtro de privacidad estricto:
   * - Elimina propiedades prohibidas (nombres, emails, contraseñas, notas, datos médicos).
   * - Redacta cadenas que coincidan con patrones de email.
   */
  public sanitizeData(data?: Record<string, unknown>): Record<string, unknown> {
    if (!data || typeof data !== 'object') return {};

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Descartar claves sensibles
      const isForbidden =
        EXACT_SENSITIVE_KEYS.has(lowerKey) ||
        SENSITIVE_SUBSTRINGS.some((pattern) => lowerKey.includes(pattern)) ||
        lowerKey.endsWith('_email') ||
        lowerKey.startsWith('email_') ||
        (lowerKey.endsWith('_name') &&
          !['view_name', 'routine_name', 'exercise_name', 'event_name'].includes(lowerKey));

      if (isForbidden) {
        continue;
      }

      // Sanitizar valores recursivos o strings
      if (typeof value === 'string') {
        sanitized[key] = value.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
      } else if (Array.isArray(value)) {
        // En arrays, sanitizar cada elemento si es objeto
        sanitized[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? this.sanitizeData(item as Record<string, unknown>)
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

export const analytics = new AnalyticsService();
