/**
 * NetworkStatusIndicator.tsx — Floating Connection & Sync Status Banner.
 *
 * Listens to online/offline browser events and displays a clean floating badge
 * when the user is working offline or syncing background actions.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { syncEngine } from '../infrastructure/sync/SyncEngine';

export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showSyncedToast, setShowSyncedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncedToast(true);
      setTimeout(() => setShowSyncedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue size periodically
    const interval = setInterval(async () => {
      try {
        const count = await syncEngine.getQueueLength();
        setPendingCount(count);
      } catch (e) {
        // silence
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !showSyncedToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] pointer-events-none max-w-xs w-full px-4"
      >
        {!isOnline ? (
          <div className="glass-dark border border-amber-500/40 bg-amber-950/40 px-3.5 py-2 rounded-2xl flex items-center justify-between shadow-xl text-amber-300 pointer-events-auto">
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
          <div className="glass-dark border border-brand-blue/40 bg-brand-blue/10 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-xl text-brand-blue pointer-events-auto">
            <RefreshCw size={14} className="animate-spin shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Sincronizando {pendingCount} cambio{pendingCount > 1 ? 's' : ''}...
            </span>
          </div>
        ) : showSyncedToast ? (
          <div className="glass-dark border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-xl text-emerald-300 pointer-events-auto">
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
