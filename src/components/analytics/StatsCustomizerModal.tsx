import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, SlidersHorizontal, Check } from 'lucide-react';

export interface BlockConfig {
  id: string;
  label: string;
  description: string;
  visible: boolean;
}

interface StatsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockConfig[];
  onToggleBlock: (id: string) => void;
  onReset: () => void;
}

export default function StatsCustomizerModal({
  isOpen,
  onClose,
  blocks,
  onToggleBlock,
  onReset,
}: StatsCustomizerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="glass max-w-md w-full p-5 sm:p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-blue/15 text-brand-blue flex items-center justify-center border border-brand-blue/20">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 tracking-tight">
                  Personalizar Panel
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Elige qué bloques mostrar u ocultar
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 glass rounded-full text-slate-400 hover:text-slate-100 cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Block Toggles List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => onToggleBlock(block.id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  block.visible
                    ? 'bg-slate-900/80 border-brand-blue/30 shadow-xs'
                    : 'bg-slate-950/40 border-white/5 opacity-60'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    {block.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {block.description}
                  </p>
                </div>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    block.visible
                      ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/40'
                      : 'bg-slate-800 text-slate-500 border-white/5'
                  }`}
                >
                  {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </div>
              </div>
            ))}
          </div>

          {/* Actions Footer */}
          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 glass text-slate-400 hover:text-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Restablecer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-brand-blue text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:bg-brand-blue/90 flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
