import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Check, Plus } from 'lucide-react';
import { PRESET_HABITS, type PresetHabitTemplate } from '../../lib/habitsEngine';
import HabitIcon from './HabitIcon';
import { cn } from '../../lib/utils';

interface HabitTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPresets: (presetIds: string[]) => Promise<void>;
  existingHabitNames: string[];
}

export default function HabitTemplatesModal({
  isOpen,
  onClose,
  onAddPresets,
  existingHabitNames,
}: HabitTemplatesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // Por defecto seleccionar los que el usuario aún no tiene
    return PRESET_HABITS.filter(
      (p) => !existingHabitNames.some((name) => name.toLowerCase() === p.name.toLowerCase())
    ).map((p) => p.id);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === PRESET_HABITS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(PRESET_HABITS.map((p) => p.id));
    }
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAddPresets(selectedIds);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="glass max-w-lg w-full p-6 rounded-3xl border border-white/10 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue shadow-lg shadow-brand-blue/10">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Plantillas de Hábitos</h3>
              <p className="text-xs text-slate-400">Pack de inicio estoico y atlético recomendado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass rounded-full text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick select all */}
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-slate-400 font-semibold">
            {selectedIds.length} seleccionados de {PRESET_HABITS.length}
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-brand-blue font-bold hover:underline"
          >
            {selectedIds.length === PRESET_HABITS.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        {/* Preset list */}
        <div className="space-y-2.5">
          {PRESET_HABITS.map((preset) => {
            const isAlreadyAdded = existingHabitNames.some(
              (name) => name.toLowerCase() === preset.name.toLowerCase()
            );
            const isSelected = selectedIds.includes(preset.id);

            return (
              <div
                key={preset.id}
                onClick={() => !isAlreadyAdded && toggleSelect(preset.id)}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none',
                  isAlreadyAdded
                    ? 'opacity-50 border-white/5 bg-slate-900/40 cursor-not-allowed'
                    : isSelected
                    ? 'border-brand-blue/40 bg-brand-blue/10 shadow-md'
                    : 'border-white/5 glass hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{ backgroundColor: preset.color }}
                  >
                    <HabitIcon name={preset.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{preset.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</p>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 inline-block">
                      {preset.frequency === 'daily'
                        ? 'Diario'
                        : preset.frequency === 'weekdays'
                        ? 'Lun - Vie'
                        : 'Personalizado'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isAlreadyAdded ? (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg">
                      Añadido
                    </span>
                  ) : (
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center border transition-all',
                        isSelected
                          ? 'bg-brand-blue border-brand-blue text-white shadow-sm'
                          : 'border-white/20 bg-slate-800'
                      )}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 glass rounded-2xl text-slate-400 font-bold text-sm hover:text-slate-200 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || selectedIds.length === 0}
            className="flex-1 py-3 px-4 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {isSubmitting ? 'Añadiendo...' : `Añadir (${selectedIds.length})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
