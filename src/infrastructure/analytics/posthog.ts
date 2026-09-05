/**
 * posthog.ts
 * Proveedor de analítica de producto mediante PostHog.
 * Diseñado con autocaptura desactivada, sin grabación de sesiones y modo no-op fail-safe.
 */

import posthog from 'posthog-js';
import type { ProductAnalyticsProvider, TelemetryInitOptions } from './analytics.types';

export class PostHogAnalyticsProvider implements ProductAnalyticsProvider {
  public readonly name = 'posthog';
  private isInitialized = false;
  private isEnabled = false;
  private debug = false;

  public init(options: TelemetryInitOptions): void {
    this.debug = !!options.debug;

    if (!options.posthogKey || options.enabled === false) {
      if (this.debug) {
        console.log('[Analytics:PostHog] API Key no provista o deshabilitado. Modo simulación activo.');
      }
      return;
    }

    try {
      posthog.init(options.posthogKey, {
        api_host: options.posthogHost || 'https://eu.i.posthog.com',
        autocapture: false, // Prohibir autocaptura de clicks o formularios en DOM
        capture_pageview: false, // Controlado manualmente por la aplicación
        capture_pageleave: false,
        disable_session_recording: true, // Prohibir grabación de pantalla por privacidad
        respect_dnt: true,
        persistence: 'localStorage',
        loaded: () => {
          if (this.debug) {
            console.log('[Analytics:PostHog] Cliente PostHog cargado e inicializado.');
          }
        },
      });

      this.isInitialized = true;
      this.isEnabled = true;
    } catch (err) {
      console.warn('[Analytics:PostHog] Fallo seguro al inicializar PostHog:', err);
    }
  }

  public capture(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isEnabled || !this.isInitialized) {
      if (this.debug) {
        console.log(`[Analytics:PostHog Mock] capture: ${eventName}`, properties);
      }
      return;
    }

    try {
      posthog.capture(eventName, properties);
    } catch (err) {
      if (this.debug) {
        console.warn(`[Analytics:PostHog] Error en capture(${eventName}):`, err);
      }
    }
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isEnabled || !this.isInitialized) {
      if (this.debug) {
        console.log(`[Analytics:PostHog Mock] identify: ${userId}`, traits);
      }
      return;
    }

    try {
      posthog.identify(userId, traits);
    } catch (err) {
      if (this.debug) {
        console.warn('[Analytics:PostHog] Error en identify:', err);
      }
    }
  }

  public reset(): void {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      posthog.reset();
    } catch (err) {
      if (this.debug) {
        console.warn('[Analytics:PostHog] Error en reset:', err);
      }
    }
  }
}
