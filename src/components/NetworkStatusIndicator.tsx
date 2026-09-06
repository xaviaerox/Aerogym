/**
 * NetworkStatusIndicator.tsx — Floating Connection & Sync Status Banner.
 *
 * Listens to online/offline browser events and displays a clean floating badge
 * when the user is working offline or syncing background actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { syncEngine } from '../infrastructure/sync/SyncEngine';
import { clearSyncQueue } from '../lib/storageIndexedDB';

export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showSyncedToast, setShowSyncedToast] = useState(false);
  const [isManualProcessing, setIsManualProcessing] = useState(false);

  const checkQueue = useCallback(async () => {
    try {
      const count = await syncEngine.getQueueLength();
      setPendingCount(count);
      if (count > 0 && syncEngine.isOnline() && !isSyncing) {
        syncEngine.triggerSync(200);
      }
    } catch {
      // silence
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncedToast(true);
      syncEngine.triggerSync(100);
      setTimeout(() => setShowSyncedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('aerogym:sync-queue-updated', checkQueue);

    const unsubscribe = syncEngine.subscribe((syncing) => {
      setIsSyncing(syncing);
      if (!syncing) {
        // Al terminar la sincronización, refrescar el contador
        syncEngine.getQueueLength().then((count) => {
          setPendingCount(count);
          if (count === 0 && isOnline) {
            setShowSyncedToast(true);
            setTimeout(() => setShowSyncedToast(false), 3000);
          }
        }).catch(() => {});
      }
    });

    // Comprobación inicial y sondeo periódico
    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('aerogym:sync-queue-updated', checkQueue);
      unsubscribe();
      clearInterval(interval);
    };
  }, [checkQueue, isOnline]);

  const handleForceSync = async () => {
    if (!isOnline || isManualProcessing) return;
    setIsManualProcessing(true);
    try {
      await syncEngine.processQueue();
      const count = await syncEngine.getQueueLength();
      setPendingCount(count);
    } finally {
      setIsManualProcessing(false);
    }
  };

  const handleClearStuckQueue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearSyncQueue();
    setPendingCount(0);
  };

  if (isOnline && pendingCount === 0 && !showSyncedToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] max-w-xs w-full px-4 select-none"
      >
        {!isOnline ? (
          <div className="glass-dark border border-amber-500/40 bg-amber-950/40 px-3.5 py-2 rounded-2xl flex items-center justify-between shadow-xl text-amber-300">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="animate-pulse shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                Modo Offline
              </span>
            </div>
            {pendingCount > 0 && (
              <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : pendingCount > 0 ? (
          <div
            onClick={handleForceSync}
            title="Pulsa para forzar sincronización"
            className="glass-dark border border-brand-blue/40 bg-brand-blue/10 px-3.5 py-2 rounded-2xl flex items-center justify-between shadow-xl text-brand-blue cursor-pointer hover:bg-brand-blue/20 transition-all pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <RefreshCw
                size={14}
                className={isSyncing || isManualProcessing ? 'animate-spin shrink-0' : 'shrink-0'}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {isSyncing || isManualProcessing
                  ? `Sincronizando ${pendingCount} cambio${pendingCount > 1 ? 's' : ''}...`
                  : `${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}`}
              </span>
            </div>
            <button
              onClick={handleClearStuckQueue}
              title="Limpiar cola de cambios pendientes"
              className="text-[10px] opacity-60 hover:opacity-100 underline ml-2 shrink-0 text-slate-400 hover:text-white"
            >
              Descartar
            </button>
          </div>
        ) : showSyncedToast ? (
          <div className="glass-dark border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-xl text-emerald-300">
            <Wifi size={16} className="shrink-0 text-emerald-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Conexión restablecida · Datos sincronizados
            </span>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
