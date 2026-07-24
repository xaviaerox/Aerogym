/**
 * loggerService.ts — Servicio estructurado de observabilidad y registro de eventos/errores en AeroGym.
 * Proporciona soporte para niveles (info, warn, error) y preparación para integraciones con Sentry / LogRocket.
 */

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorContext = {
      ...(context || {}),
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    this.log('error', message, errorContext);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console with styled badges
    if (process.env.NODE_ENV !== 'test') {
      const prefix = `[AeroGym:${level.toUpperCase()}]`;
      if (level === 'error') {
        console.error(prefix, message, context || '');
      } else if (level === 'warn') {
        console.warn(prefix, message, context || '');
      } else {
        console.log(prefix, message, context || '');
      }
    }
  }

  public getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new LoggerService();
