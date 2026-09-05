import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.tsx';
import { RepositoryProvider } from './infrastructure/repositories/RepositoryContext.tsx';
import { requestPersistentStorage } from './lib/persistentStorageService.ts';
import { analytics } from './infrastructure/analytics';
import './index.css';

// Inicializar la capa de observabilidad y analítica de producto (fail-safe)
analytics.init();

// Solicitar persistencia de almacenamiento en segundo plano
requestPersistentStorage();

// Manejador global para recuperar la aplicación ante fallos de carga de chunks
// (ej. cuando se sube una nueva versión y los hashes cambian, eliminando archivos antiguos)
const handleChunkError = (error: any): boolean => {
  const errorText = error?.message || String(error || '');
  const isChunkError =
    errorText.includes('ChunkLoadError') ||
    errorText.includes('Loading chunk') ||
    errorText.includes('Failed to fetch dynamically imported module') ||
    errorText.includes('dynamics') ||
    (error?.name && error.name === 'ChunkLoadError');

  if (isChunkError) {
    console.warn('Se detectó un fallo al cargar un fragmento dinámico. Recargando la aplicación para actualizar caché...', error);
    window.location.reload();
    return true;
  }
  return false;
};

window.addEventListener('error', (event) => {
  const isChunk = handleChunkError(event.error || event);
  if (!isChunk && event.error) {
    analytics.error(event.error, { source: 'window.onerror' });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const isChunk = handleChunkError(event.reason);
  if (!isChunk && event.reason) {
    const errorObj = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    analytics.error(errorObj, { source: 'window.unhandledrejection' });
  }
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <RepositoryProvider>
        <App />
      </RepositoryProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);


