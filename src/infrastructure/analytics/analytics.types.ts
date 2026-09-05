/**
 * analytics.types.ts
 * Definiciones de tipos y contratos para la capa desacoplada de Analytics y Observabilidad.
 * Diseñado bajo el principio de no-bloqueo (fail-safe), bajo acoplamiento y privacidad estricta.
 */

export interface TelemetryInitOptions {
  enabled?: boolean;
  environment?: string;
  release?: string;
  sentryDsn?: string;
  posthogKey?: string;
  posthogHost?: string;
  debug?: boolean;
}

export interface TelemetryErrorContext {
  fatal?: boolean;
  componentStack?: string;
  source?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export interface TelemetryProvider {
  readonly name: string;
  init(options: TelemetryInitOptions): Promise<void> | void;
  captureException(error: unknown, context?: TelemetryErrorContext): void;
  setUser(userId: string | null): void;
}

export interface ProductAnalyticsProvider {
  readonly name: string;
  init(options: TelemetryInitOptions): Promise<void> | void;
  capture(eventName: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  reset(): void;
}
