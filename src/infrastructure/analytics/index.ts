/**
 * index.ts
 * Exportaciones públicas de la capa de Analytics & Observabilidad de AeroGym.
 */

export * from './analytics.types';
export * from './analytics.events';
export * from './sentry';
export * from './posthog';
export { analytics, AnalyticsService } from './analytics';
