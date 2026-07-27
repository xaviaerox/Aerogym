import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Scale } from 'lucide-react';

interface AddBodyMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    measured_at: string;
    weight_kg: number;
    body_fat_pct: number | null;
    waist_cm: number | null;
    chest_cm: number | null;
    arm_cm: number | null;
    leg_cm: number | null;
    hip_cm: number | null;
  }) => Promise<void>;
}

export default function AddBodyMeasurementModal({ isOpen, onClose, onSave }: AddBodyMeasurementModalProps) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');
  const [leg, setLeg] = useState('');
  const [hip, setHip] = useState('');
  const [measuredAt, setMeasuredAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setIsSaving(true);
    try {
      await onSave({
        measured_at: measuredAt,
        weight_kg: parseFloat(weight),
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        waist_cm: waist ? parseFloat(waist) : null,
        chest_cm: chest ? parseFloat(chest) : null,
        arm_cm: arm ? parseFloat(arm) : null,
        leg_cm: leg ? parseFloat(leg) : null,
        hip_cm: hip ? parseFloat(hip) : null,
      });
      setWeight('');
      setBodyFat('');
      setWaist('');
      setChest('');
      setArm('');
      setLeg('');
      setHip('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error guardando medidas corporales');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl"
      >
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Scale className="text-brand-blue" size={20} />
            <h3 className="font-bold text-slate-100 text-base">Registrar Composición</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fecha</label>
            <input
              type="date"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-1 ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-1 ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">% Grasa</label>
              <input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-1 ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Cintura (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="80"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-1 ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Brazo (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="38"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none focus:ring-1 ring-brand-blue"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 font-bold text-xs hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !weight}
              className="flex-1 py-2.5 rounded-xl bg-brand-blue text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-brand-blue/90 disabled:opacity-50"
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
