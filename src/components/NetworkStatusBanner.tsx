import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg select-none z-50"
        >
          <WifiOff size={16} />
          <span>Modo sin conexión activado. Guardando cambios localmente.</span>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg select-none z-50"
        >
          <Wifi size={16} />
          <span>Conexión restablecida. Sincronizando datos...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
