import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore } from '../useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it('adds a toast to state', () => {
    useToastStore.getState().addToast({
      type: 'success',
      title: 'Sesión guardada',
      message: 'Tu entrenamiento se ha sincronizado correctamente',
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].title).toBe('Sesión guardada');
    expect(toasts[0].type).toBe('success');
  });

  it('removes a toast by ID', () => {
    useToastStore.getState().addToast({
      type: 'error',
      title: 'Error de conexión',
    });

    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);

    expect(useToastStore.getState().toasts.length).toBe(0);
  });
});
