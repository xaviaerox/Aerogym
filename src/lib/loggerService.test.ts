import { describe, it, expect, beforeEach } from 'vitest';
import { logger } from './loggerService';

describe('loggerService', () => {
  beforeEach(() => {
    logger.clearLogs();
  });

  it('logs info messages correctly', () => {
    logger.info('Inicio de sesión realizado', { userId: '123' });
    const logs = logger.getRecentLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].message).toBe('Inicio de sesión realizado');
    expect(logs[0].context?.userId).toBe('123');
  });

  it('logs errors with error objects', () => {
    logger.error('Error de red al guardar entrenamiento', new Error('Timeout 5000ms'));
    const logs = logger.getRecentLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('error');
    expect(logs[0].context?.errorMessage).toBe('Timeout 5000ms');
  });
});
