import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Dumbbell, Target, Zap, User, Check } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { cn } from '../lib/utils';
import type { Profile } from '../infrastructure/supabase/types';

interface OnboardingViewProps {
  profile: Profile;
}

const GOALS = [
  { key: 'hypertrophy', label: 'Ganar Músculo', emoji: '💪', desc: 'Hipertrofia y volumen' },
  { key: 'strength', label: 'Ganar Fuerza', emoji: '🏋️', desc: 'Levantar más peso' },
  { key: 'fat_loss', label: 'Perder Grasa', emoji: '🔥', desc: 'Definición y composición' },
  { key: 'recomposition', label: 'Recomposición', emoji: '⚡', desc: 'Músculo y pérdida de grasa' },
  { key: 'maintenance', label: 'Mantenimiento', emoji: '🎯', desc: 'Mantener mi forma' },
] as const;

const LEVELS = [
  { key: 'beginner', label: 'Principiante', desc: 'Menos de 1 año entrenando' },
  { key: 'intermediate', label: 'Intermedio', desc: '1-3 años de experiencia' },
  { key: 'advanced', label: 'Avanzado', desc: 'Más de 3 años serio' },
] as const;

const FREQUENCIES = [2, 3, 4, 5, 6];

export default function OnboardingView({ profile }: OnboardingViewProps) {
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: profile.name || '',
    age: profile.age || '',
    weight_kg: profile.weight_kg || '',
    height_cm: profile.height_cm || '',
    gender: profile.gender || 'male',
    goal: profile.goal || 'hypertrophy',
    level: profile.level || 'beginner',
    weekly_frequency: profile.weekly_frequency || 3,
  });
  const [isLoading, setIsLoading] = useState(false);

  const STEPS = [
    { title: '¡Bienvenido!', subtitle: 'Cuéntanos sobre ti', icon: User },
    { title: 'Tu objetivo', subtitle: '¿Qué quieres conseguir?', icon: Target },
    { title: 'Tu nivel', subtitle: '¿Cuánta experiencia tienes?', icon: Dumbbell },
    { title: 'Frecuencia', subtitle: '¿Cuántos días a la semana?', icon: Zap },
  ];

  const canContinue = () => {
    if (step === 0) return data.name.trim().length > 0;
    return true;
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        name: data.name,
        age: Number(data.age) || null,
        weight_kg: Number(data.weight_kg) || null,
        height_cm: Number(data.height_cm) || null,
        gender: data.gender as Profile['gender'],
        goal: data.goal as Profile['goal'],
        level: data.level as Profile['level'],
        weekly_frequency: data.weekly_frequency,
        onboarding_complete: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-between py-8">
      {/* Progress */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue/20 rounded-2xl flex items-center justify-center">
            <Dumbbell size={20} className="text-brand-blue" />
          </div>
          <div>
            <p className="font-black text-slate-50">AeroGym</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Paso {step + 1} de {STEPS.length}
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <motion.div
            className="h-1.5 bg-brand-blue rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-50">{STEPS[step].title}</h1>
              <p className="text-slate-400 mt-1">{STEPS[step].subtitle}</p>
            </div>

            {/* Step 0: Datos personales */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                    placeholder="¿Cómo te llamamos?"
                    className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                    <input
                      type="number"
                      value={data.weight_kg}
                      onChange={(e) => setData((d) => ({ ...d, weight_kg: e.target.value }))}
                      placeholder="75"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Altura (cm)</label>
                    <input
                      type="number"
                      value={data.height_cm}
                      onChange={(e) => setData((d) => ({ ...d, height_cm: e.target.value }))}
                      placeholder="175"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edad</label>
                    <input
                      type="number"
                      value={data.age}
                      onChange={(e) => setData((d) => ({ ...d, age: e.target.value }))}
                      placeholder="25"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Género</label>
                    <div className="flex gap-2">
                      {[{ key: 'male', label: '♂' }, { key: 'female', label: '♀' }].map((g) => (
                        <button
                          key={g.key}
                          onClick={() => setData((d) => ({ ...d, gender: g.key }))}
                          className={cn(
                            'flex-1 py-4 rounded-2xl text-lg font-bold border transition-all',
                            data.gender === g.key
                              ? 'bg-brand-blue text-slate-950 border-brand-blue'
                              : 'bg-slate-800/80 border-white/10 text-slate-400'
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Objetivo */}
            {step === 1 && (
              <div className="space-y-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.key}
                    onClick={() => setData((d) => ({ ...d, goal: goal.key }))}
                    className={cn(
                      'w-full p-4 rounded-2xl flex items-center gap-4 border transition-all text-left',
                      data.goal === goal.key
                        ? 'bg-brand-blue/20 border-brand-blue/50'
                        : 'glass border-white/5 hover:border-white/20'
                    )}
                  >
                    <span className="text-3xl">{goal.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-50">{goal.label}</p>
                      <p className="text-xs text-slate-400">{goal.desc}</p>
                    </div>
                    {data.goal === goal.key && (
                      <Check size={20} className="text-brand-blue flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Nivel */}
            {step === 2 && (
              <div className="space-y-3">
                {LEVELS.map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setData((d) => ({ ...d, level: level.key }))}
                    className={cn(
                      'w-full p-5 rounded-2xl border transition-all text-left',
                      data.level === level.key
                        ? 'bg-brand-blue/20 border-brand-blue/50'
                        : 'glass border-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-50">{level.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{level.desc}</p>
                      </div>
                      {data.level === level.key && <Check size={20} className="text-brand-blue" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Frecuencia */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <p className="text-7xl font-black text-brand-blue">{data.weekly_frequency}</p>
                    <p className="text-slate-400 font-medium mt-2">días por semana</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setData((d) => ({ ...d, weekly_frequency: f }))}
                      className={cn(
                        'w-12 h-12 rounded-2xl font-bold text-sm border transition-all',
                        data.weekly_frequency === f
                          ? 'bg-brand-blue text-slate-950 border-brand-blue'
                          : 'glass border-white/10 text-slate-400'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-center text-slate-500 text-sm">
                  {data.weekly_frequency <= 3 ? 'Ideal para principiantes' :
                   data.weekly_frequency <= 4 ? 'Perfecto para progresión constante' :
                   'Para atletas con recuperación optimizada'}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-6 py-4 glass rounded-2xl font-bold text-slate-400"
          >
            Atrás
          </button>
        )}
        <button
          onClick={() => {
            if (step < STEPS.length - 1) {
              setStep((s) => s + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canContinue() || isLoading}
          className="flex-1 py-4 bg-brand-blue text-slate-950 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isLoading ? 'Guardando...' : step === STEPS.length - 1 ? '¡Empezar AeroGym!' : 'Continuar'}
          {!isLoading && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}
