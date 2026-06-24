import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Droplets, Footprints, Moon, Star, Activity, Sparkles, Scale, Heart } from 'lucide-react';
import { useHealthStore } from '../application/stores/useHealthStore';
import { cn } from '../lib/utils';

interface HealthLoggerModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthLoggerModal({ userId, isOpen, onClose }: HealthLoggerModalProps) {
  const { todayHealth, upsertTodayHealth, addMeasurement, measurements } = useHealthStore();

  // Estados locales inicializados con el valor de hoy en la base de datos
  const [water, setWater] = useState(todayHealth?.water_ml || 0);
  const [steps, setSteps] = useState(todayHealth?.steps || 0);
  const [sleepHours, setSleepHours] = useState(Number(todayHealth?.sleep_hours) || 7.0);
  const [sleepQuality, setSleepQuality] = useState(todayHealth?.sleep_quality || 3);
  const [energy, setEnergy] = useState(todayHealth?.energy_level || 7);
  const [stress, setStress] = useState(todayHealth?.stress_level || 4);
  const [motivation, setMotivation] = useState(todayHealth?.motivation_level || 7);
  
  // Buscar el último peso registrado para proponerlo por defecto
  const lastWeight = measurements[0]?.weight_kg ? Number(measurements[0].weight_kg) : 70;
  const [weight, setWeight] = useState<string>(todayHealth?.notes?.includes('Peso registrado:') 
    ? todayHealth.notes.split('Peso registrado:')[1].trim().split(' ')[0] 
    : ''
  );
  
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar salud diaria en Supabase
      const notesString = weight ? `Peso registrado: ${weight} kg` : '';
      await upsertTodayHealth(userId, {
        water_ml: water,
        steps: steps,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        energy_level: energy,
        stress_level: stress,
        motivation_level: motivation,
        notes: notesString || null,
      });

      // 2. Si introdujo peso, guardarlo también en la tabla body_measurements
      if (weight && parseFloat(weight) > 0) {
        await addMeasurement(userId, {
          weight_kg: parseFloat(weight),
        });
      }

      onClose();
    } catch (err) {
      console.error('Error saving health logs:', err);
      alert('Error al guardar el registro diario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-end max-w-md mx-auto"
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-md z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-50 flex items-center gap-2">
            <Heart size={24} className="text-brand-blue animate-pulse" />
            Log Diario
          </h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Registro en 10 Segundos</p>
        </div>
        <button onClick={onClose} className="p-2.5 glass rounded-full text-slate-400 hover:text-slate-100 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
        
        {/* 1. AGUA WIDGET */}
        <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-brand-blue">
              <Droplets size={20} />
              <span className="text-xs font-black uppercase tracking-wider">Hidratación</span>
            </div>
            <span className="text-lg font-black text-brand-blue">{(water / 1000).toFixed(2)}L</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWater((w) => w + 250)}
              className="flex-1 py-3 bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 text-brand-blue rounded-2xl text-xs font-bold transition-all"
            >
              +250 ml
            </button>
            <button
              onClick={() => setWater((w) => w + 500)}
              className="flex-1 py-3 bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 text-brand-blue rounded-2xl text-xs font-bold transition-all"
            >
              +500 ml
            </button>
            <button
              onClick={() => setWater(0)}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl text-xs font-bold transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 2. PASOS WIDGET */}
        <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-400">
              <Footprints size={20} />
              <span className="text-xs font-black uppercase tracking-wider">Pasos Hoy</span>
            </div>
            <span className="text-lg font-black text-emerald-400">{steps.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSteps((s) => Math.max(0, s - 1000))}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-bold flex items-center justify-center text-lg"
            >
              -
            </button>
            <input
              type="number"
              value={steps || ''}
              placeholder="0"
              onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-lg text-slate-100 placeholder:text-slate-600 focus:ring-2 ring-emerald-500/30"
            />
            <button
              onClick={() => setSteps((s) => s + 1000)}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-bold flex items-center justify-center text-lg"
            >
              +
            </button>
          </div>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={() => setSteps((s) => s + 5000)}
              className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl font-bold"
            >
              +5,000 pasos
            </button>
            <button
              onClick={() => setSteps((s) => s + 10000)}
              className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl font-bold"
            >
              +10,000 pasos
            </button>
          </div>
        </div>

        {/* 3. SUEÑO WIDGET */}
        <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-purple-400">
              <Moon size={20} />
              <span className="text-xs font-black uppercase tracking-wider">Sueño Anoche</span>
            </div>
            <span className="text-lg font-black text-purple-400">{sleepHours.toFixed(1)}h</span>
          </div>
          
          {/* Horas Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              <span>3h</span>
              <span>7-8h (Óptimo)</span>
              <span>12h</span>
            </div>
          </div>

          {/* Calidad Estrellas */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-center">Calidad de Sueño</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSleepQuality(star)}
                  className="transition-transform active:scale-95"
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      star <= sleepQuality
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-700"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ENERGÍA, ESTRÉS, MOTIVACIÓN */}
        <div className="glass p-5 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center gap-2 text-amber-400">
            <Activity size={20} />
            <span className="text-xs font-black uppercase tracking-wider">Estado Subjetivo</span>
          </div>

          {/* Energía */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span className="text-slate-500">Energía / Vitalidad</span>
              <span className="text-amber-400">{energy}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Estrés */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span className="text-slate-500">Estrés Percibido</span>
              <span className="text-purple-400">{stress}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Motivación */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span className="text-slate-500">Motivación</span>
              <span className="text-sky-400">{motivation}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={motivation}
              onChange={(e) => setMotivation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* 5. PESO CORPORAL */}
        <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-rose-400">
              <Scale size={20} />
              <span className="text-xs font-black uppercase tracking-wider">Peso Corporal</span>
            </div>
            {weight ? (
              <span className="text-lg font-black text-rose-400">{weight} kg</span>
            ) : (
              <span className="text-xs text-slate-500 font-bold uppercase italic">Último: {lastWeight}kg</span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`Ej: ${lastWeight}`}
              className="w-full bg-slate-800 text-center rounded-2xl py-3 outline-none font-bold text-lg text-slate-100 placeholder:text-slate-600 focus:ring-2 ring-rose-500/30"
            />
            <span className="absolute right-4 top-3.5 text-slate-500 font-bold text-sm">kg</span>
          </div>
        </div>

      </div>

      {/* Save Button Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-slate-950/80 backdrop-blur-lg border-t border-white/5 z-20">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full py-4 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {isSaving ? 'Guardando Registro...' : 'Guardar Log Diario'}
          <Sparkles size={16} />
        </button>
      </div>
    </motion.div>
  );
}
