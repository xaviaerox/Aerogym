/**
 * GlobalErrorBoundary — Catches unhandled React render errors and shows a
 * recovery UI instead of a blank screen.
 *
 * Implementation note: React Error Boundaries require a class component.
 * We declare the class manually with explicit prototype methods to work
 * around React 19's missing bundled .d.ts declarations.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

type State = { hasError: boolean; error: Error | null };
type Props = { children: any; fallback?: (error: Error, reset: () => void) => any };

// We use a minimal manual class declaration compatible with both React 18 and 19.
class ErrorBoundaryImpl extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[GlobalErrorBoundary] Unhandled render error:', error, info?.componentStack);
  }

  handleReset() {
    (this as any).setState({ hasError: false, error: null });
  }

  render() {
    const { hasError, error } = (this as any).state as State;
    const { children, fallback } = (this as any).props as Props;

    if (hasError && error) {
      if (fallback) return fallback(error, () => (this as any).handleReset());

      return React.createElement(
        'div',
        { className: 'min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-slate-950' },
        React.createElement(
          'div',
          { className: 'w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center' },
          React.createElement(AlertTriangle, { size: 28, className: 'text-red-400' })
        ),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement('h1', { className: 'text-xl font-bold text-slate-50' }, 'Algo salió mal'),
          React.createElement('p', { className: 'text-sm text-slate-400 max-w-xs' }, 'Se produjo un error inesperado en la aplicación.')
        ),
        React.createElement(
          'div',
          { className: 'flex flex-col gap-3 w-full max-w-xs' },
          React.createElement(
            'button',
            {
              onClick: () => (this as any).handleReset(),
              className: 'flex items-center justify-center gap-2 w-full py-3 bg-brand-blue text-slate-950 font-black rounded-2xl text-sm',
            },
            React.createElement(RotateCcw, { size: 16 }),
            'Intentar de nuevo'
          ),
          React.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              className: 'w-full py-3 glass border-white/10 text-slate-400 font-bold rounded-2xl text-sm',
            },
            'Recargar la app'
          )
        )
      );
    }

    return children;
  }
}

export default ErrorBoundaryImpl as unknown as React.ComponentType<Props>;
