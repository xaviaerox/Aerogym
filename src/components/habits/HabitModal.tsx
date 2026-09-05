import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Calendar, Tag, Palette } from 'lucide-react';
import type { Habit, HabitCategory, HabitFrequency } from '../../infrastructure/supabase/types';
import HabitIcon, { HABIT_ICONS_MAP } from './HabitIcon';
import { cn } from '../../lib/utils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    name: string;
    description: string | null;
    category: HabitCategory;
    icon: string;
    color: string;
    frequency: HabitFrequency;
    target_days: number[];
  }) => Promise<void>;
  initialHabit?: Habit | null;
}

const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'discipline', label: 'Disciplina & Mente' },
  { id: 'fitness', label: 'Fitness & Gym' },
  { id: 'productivity', label: 'Trabajo & Enfoque' },
  { id: 'learning', label: 'Estudio & Lectura' },
  { id: 'health', label: 'Salud & Bienestar' },
  { id: 'custom', label: 'Personalizado' },
];

const COLORS = [
  '#ef4444', // Rojo (Disciplina/NOPORN)
  '#f97316', // Naranja
  '#f59e0b', // Ámbar
  '#10b981', // Esmeralda (Pasos)
  '#06b6d4', // Cian (Agua)
  '#3b82f6', // Azul AeroGym (Entreno)
  '#8b5cf6', // Violeta (Trabajo)
  '#ec4899', // Rosa
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'L' },
  { id: 2, label: 'M' },
  { id: 3, label: 'X' },
  { id: 4, label: 'J' },
  { id: 5, label: 'V' },
  { id: 6, label: 'S' },
  { id: 0, label: 'D' },
];

export default function HabitModal({ isOpen, onClose, onSave, initialHabit }: HabitModalProps) {
  const [name, setName] = useState(initialHabit?.name || '');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [category, setCategory] = useState<HabitCategory>(initialHabit?.category || 'discipline');
  const [icon, setIcon] = useState(initialHabit?.icon || 'Shield');
  const [color, setColor] = useState(initialHabit?.color || '#ef4444');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialHabit?.frequency || 'daily');
  const [targetDays, setTargetDays] = useState<number[]>(
    initialHabit?.target_days || [1, 2, 3, 4, 5, 6, 0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFrequencyChange = (freq: HabitFrequency) => {
    setFrequency(freq);
    if (freq === 'daily') {
      setTargetDays([1, 2, 3, 4, 5, 6, 0]);
    } else if (freq === 'weekdays') {
      setTargetDays([1, 2, 3, 4, 5]);
    } else if (freq === 'weekends') {
      setTargetDays([6, 0]);
    }
  };

  const toggleDay = (dayId: number) => {
    setFrequency('custom_days');
    if (targetDays.includes(dayId)) {
      if (targetDays.length > 1) {
        setTargetDays(targetDays.filter((d) => d !== dayId));
      }
    } else {
      setTargetDays([...targetDays, dayId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        category,
        icon,
        color,
        frequency,
        target_days: targetDays,
      });
      onClose();
    } catch (err) {
      console.error(err);
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
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              <HabitIcon name={icon} size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">
                {initialHabit ? 'Editar Hábito' : 'Nuevo Hábito Personalizado'}
              </h3>
              <p className="text-xs text-slate-400">Define tu objetivo y periodicidad de control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass rounded-full text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nombre del Hábito *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: NOPORN, 10k Pasos, Estudiar, Entreno..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Motivación o Descripción (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Disciplina mental diaria / El dolor de la disciplina vs el arrepentimiento"
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={14} /> Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                    category === cat.id
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                      : 'glass border-white/5 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette size={14} /> Color Identificativo
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform flex items-center justify-center text-white',
                    color === c ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Icono Representativo
            </label>
            <div className="grid grid-cols-7 gap-2 p-2 bg-slate-900/60 rounded-2xl border border-white/5 max-h-36 overflow-y-auto">
              {Object.keys(HABIT_ICONS_MAP).map((iconName) => (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    'p-2.5 rounded-xl flex items-center justify-center transition-all',
                    icon === iconName
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )}
                >
                  <HabitIcon name={iconName} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Periodicidad y Frecuencia */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> Frecuencia y Días de Control
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFrequencyChange('daily')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-center transition-all',
                  frequency === 'daily'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'glass border-white/5 text-slate-400 hover:text-slate-200'
                )}
              >
                Todos los días
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange('weekdays')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-center transition-all',
                  frequency === 'weekdays'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'glass border-white/5 text-slate-400 hover:text-slate-200'
                )}
              >
                Lunes a Viernes
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange('weekends')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-center transition-all',
                  frequency === 'weekends'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'glass border-white/5 text-slate-400 hover:text-slate-200'
                )}
              >
                Fin de semana
              </button>
            </div>

            {/* Custom Days Pill Buttons */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-1.5">Días activos en la semana:</p>
              <div className="flex items-center justify-between gap-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = targetDays.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={cn(
                        'w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-brand-blue text-white shadow-md scale-105'
                          : 'bg-slate-800/80 text-slate-500 hover:text-slate-300'
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 glass rounded-2xl text-slate-400 font-bold text-sm hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-3 px-4 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Guardando...' : initialHabit ? 'Guardar Cambios' : 'Crear Hábito'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
