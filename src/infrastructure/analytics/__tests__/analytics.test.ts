import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics';
import type { TelemetryProvider, ProductAnalyticsProvider } from '../analytics.types';

describe('Analytics & Observabilidad Architecture', () => {
  let mockTelemetry: TelemetryProvider;
  let mockProduct: ProductAnalyticsProvider;
  let analytics: AnalyticsService;

  beforeEach(() => {
    mockTelemetry = {
      name: 'mock-sentry',
      init: vi.fn(),
      captureException: vi.fn(),
      setUser: vi.fn(),
    };

    mockProduct = {
      name: 'mock-posthog',
      init: vi.fn(),
      capture: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
    };

    analytics = new AnalyticsService(mockTelemetry, mockProduct);
    analytics.init({ enabled: true, debug: false });
  });

  describe('Principio Fail-Safe & Non-Blocking', () => {
    it('no debe lanzar error ni interrumpir la app si un proveedor falla en track()', () => {
      mockProduct.capture = vi.fn().mockImplementation(() => {
        throw new Error('Network error or adblocker blocked request');
      });

      expect(() => {
        analytics.track('workout_started', { routine_id: 'routine-123' });
      }).not.toThrow();
    });

    it('no debe lanzar error ni interrumpir la app si el proveedor de observabilidad falla en error()', () => {
      mockTelemetry.captureException = vi.fn().mockImplementation(() => {
        throw new Error('Sentry transport failed');
      });

      expect(() => {
        analytics.error(new Error('Fatal UI crash'));
      }).not.toThrow();
    });

    it('no debe lanzar error si init() falla internamente', () => {
      mockProduct.init = vi.fn().mockImplementation(() => {
        throw new Error('PostHog script load error');
      });

      expect(() => {
        analytics.init({ enabled: true });
      }).not.toThrow();
    });
  });

  describe('Privacidad Estricta y Sanitización de PII', () => {
    it('debe filtrar y eliminar claves sensibles (email, password, notas, prompts, datos médicos)', () => {
      const sensitiveData = {
        routine_id: 'r-1',
        email: 'user@example.com',
        user_notes: 'Dolor en la rodilla derecha',
        prompt: 'Dame una rutina para ganar masa muscular',
        diagnosis: 'Tendinitis rotuliana',
        weight_kg: 82.5,
        exercise_count: 5,
      };

      const sanitized = analytics.sanitizeData(sensitiveData);

      expect(sanitized).toHaveProperty('routine_id', 'r-1');
      expect(sanitized).toHaveProperty('exercise_count', 5);
      expect(sanitized).not.toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('user_notes');
      expect(sanitized).not.toHaveProperty('prompt');
      expect(sanitized).not.toHaveProperty('diagnosis');
      expect(sanitized).not.toHaveProperty('weight_kg');
    });

    it('debe redactar correos electrónicos embebidos dentro de strings permitidos', () => {
      const data = {
        source_description: 'Error reportado por contactar a support@aerogym.app para ayuda',
        valid_metric: 10,
      };

      const sanitized = analytics.sanitizeData(data);

      expect(sanitized.source_description).toBe(
        'Error reportado por contactar a [REDACTED_EMAIL] para ayuda'
      );
    });

    it('debe anonimizar el identificador si por error se envía un correo en identify()', () => {
      analytics.identify('atleta@aerogym.es');

      expect(mockProduct.identify).toHaveBeenCalledWith('anonymized-user', undefined);
      expect(mockTelemetry.setUser).toHaveBeenCalledWith('anonymized-user');
    });

    it('debe permitir UUIDs o identificadores internos limpios', () => {
      const internalId = 'usr_9f4b-22c1';
      analytics.identify(internalId);

      expect(mockProduct.identify).toHaveBeenCalledWith(internalId, undefined);
      expect(mockTelemetry.setUser).toHaveBeenCalledWith(internalId);
    });
  });

  describe('Eventos Tipados y Core User Journey', () => {
    it('debe registrar workout_completed con métricas agregadas', () => {
      analytics.track('workout_completed', {
        duration_seconds: 3600,
        exercise_count: 6,
        set_count: 18,
        total_volume_kg: 12450,
        has_cardio: true,
        is_pr: true,
      });

      expect(mockProduct.capture).toHaveBeenCalledWith('workout_completed', {
        duration_seconds: 3600,
        exercise_count: 6,
        set_count: 18,
        total_volume_kg: 12450,
        has_cardio: true,
        is_pr: true,
      });
    });

    it('debe registrar cambios de vista con analytics.page()', () => {
      analytics.page('workouts');

      expect(mockProduct.capture).toHaveBeenCalledWith('view_changed', {
        view_name: 'workouts',
      });
    });

    it('debe reiniciar sesión en ambos proveedores con reset()', () => {
      analytics.reset();

      expect(mockProduct.reset).toHaveBeenCalled();
      expect(mockTelemetry.setUser).toHaveBeenCalledWith(null);
    });
  });
});
