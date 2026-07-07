import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registrado correctamente:', r);
    },
    onRegisterError(error) {
      console.error('Error al registrar el Service Worker de la PWA:', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <AnimatePresence>
      {(needRefresh || offlineReady) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-[100] glass-dark rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center shrink-0 border border-brand-blue/20">
                {needRefresh ? (
                  <RefreshCw className="text-brand-blue w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <Sparkles className="text-brand-blue w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">
                  {needRefresh ? '¡Nueva versión disponible!' : '¡Listo para usar sin conexión!'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {needRefresh
                    ? 'Actualiza AeroGym para disfrutar de las últimas mejoras y correcciones.'
                    : 'La aplicación ha sido descargada. Ya puedes usarla sin conexión a internet.'}
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {needRefresh && (
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={close}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors border border-white/5"
              >
                Luego
              </button>
              <button
                onClick={() => updateServiceWorker(true)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-brand-blue text-slate-950 hover:bg-brand-blue/90 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-brand-blue/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar ahora
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
