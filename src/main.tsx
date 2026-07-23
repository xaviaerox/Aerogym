import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.tsx';
import './index.css';

// Manejador global para recuperar la aplicación ante fallos de carga de chunks
// (ej. cuando se sube una nueva versión y los hashes cambian, eliminando archivos antiguos)
const handleChunkError = (error: any) => {
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
  }
};

window.addEventListener('error', (event) => {
  handleChunkError(event.error || event);
});

window.addEventListener('unhandledrejection', (event) => {
  handleChunkError(event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);

