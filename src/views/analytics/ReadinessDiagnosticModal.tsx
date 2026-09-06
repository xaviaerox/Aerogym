import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReadinessDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  readiness: {
    score: number;
    status: string;
    factors: string[];
    colorClass: string;
  };
}

export default function ReadinessDiagnosticModal({
  isOpen,
  onClose,
  readiness,
}: ReadinessDiagnosticModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass max-w-md w-full p-6 rounded-3xl border border-white/10 space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity size={20} className="text-brand-green" />
                  Readiness Diagnóstico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Factores de preparación de hoy</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 glass rounded-full text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <div className={cn('text-5xl font-black px-6 py-4 rounded-3xl border', readiness.colorClass)}>
                {readiness.score}%
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-300 mt-2">{readiness.status}</div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Factores Calculados</h4>
              {readiness.factors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No hay suficientes datos registrados hoy. Registra tus horas de sueño o peso corporal para un análisis preciso.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {readiness.factors.map((f, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs p-3 bg-white/5 border border-white/5 rounded-2xl">
                      <Check size={14} className="text-brand-blue mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 leading-normal font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-widest cursor-pointer"
            >
              Cerrar diagnóstico
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
