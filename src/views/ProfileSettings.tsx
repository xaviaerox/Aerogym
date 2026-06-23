import React from 'react';
import { User, Scale, Target, Trophy, Download, RotateCcw, Calendar, Utensils, Activity, LogOut, ChefHat, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { getNutritionalAdvice } from '../lib/aiService';
import { calculateNutrition } from '../lib/engine';
import { cn } from '../lib/utils';
import type { Profile } from '../infrastructure/supabase/types';

const GOALS_LABELS: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  strength: 'Fuerza',
  fat_loss: 'Definición',
  maintenance: 'Mantenimiento',
  recomposition: 'Recomposición',
};

const LEVELS_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentario',
  light: 'Ligero',
  moderate: 'Moderado',
  active: 'Activo',
  very_active: 'Muy Activo',
};

export default function ProfileSettings() {
  const { profile, user, updateProfile, signOut } = useAuthStore();
  const { sessions } = useWorkoutStore();
  const { measurements } = useHealthStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mealIdea, setMealIdea] = React.useState<string | null>(null);

  if (!profile) return null;

  // Calcular nutrición con el motor existente (adaptado a nuevo tipo)
  const profileForEngine = {
    weight: profile.weight_kg || 75,
    height: profile.height_cm || 175,
    age: profile.age || 25,
    gender: profile.gender === 'female' ? 'Mujer' : 'Hombre',
    activityLevel: ACTIVITY_LABELS[profile.activity_level] || 'Moderado',
    goal: GOALS_LABELS[profile.goal] || 'Hipertrofia',
  };
  const nutrition = calculateNutrition(profileForEngine);

  const handleUpdateProfile = async (field: keyof Profile, value: unknown) => {
    await updateProfile({ [field]: value });
  };

  const handleGenerateMealIdea = async () => {
    setIsGenerating(true);
    try {
      const context = {
        name: profile.name,
        goal: profile.goal,
        level: profile.level,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        age: profile.age,
        sessionsCount: sessions.length,
      };
      const advice = await getNutritionalAdvice(context, nutrition);
      setMealIdea(advice);
    } catch {
      setMealIdea('Trata tu nutrición como entrenas: con consistencia y propósito.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      profile,
      sessions,
      measurements,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `aerogym_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-8 pb-32">
      <h1 className="text-3xl font-bold">Perfil</h1>

      {/* User card */}
      <div className="flex items-center gap-4 glass p-6 rounded-3xl">
        <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue">
          <User size={32} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-50">{profile.name}</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            {LEVELS_LABELS[profile.level]} · {GOALS_LABELS[profile.goal]}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-brand-blue">{sessions.length}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Entrenos</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-slate-50">{profile.weight_kg || '--'}kg</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Peso</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xl font-black text-brand-green">{measurements.length}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Medidas</p>
        </div>
      </div>

      {/* Nutrition Plan */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Utensils size={14} /> Plan Nutricional Sugerido
        </h3>
        <div className="glass p-6 rounded-3xl space-y-6">
          <div className="text-center space-y-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Calorías Diarias</p>
            <p className="text-5xl font-black text-brand-blue">{nutrition.targetCalories}</p>
            <p className="text-[10px] text-slate-500">TDEE {nutrition.tdee} kcal · objetivo {GOALS_LABELS[profile.goal]}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroCard label="Proteína" value={`${nutrition.macros.protein}g`} color="blue" />
            <MacroCard label="Grasas" value={`${nutrition.macros.fat}g`} color="yellow" />
            <MacroCard label="Carbos" value={`${nutrition.macros.carbs}g`} color="green" />
          </div>
          <button
            onClick={handleGenerateMealIdea}
            disabled={isGenerating}
            className="w-full py-4 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl flex items-center justify-center gap-2 text-brand-blue font-bold text-sm hover:bg-brand-blue hover:text-slate-950 transition-all"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <ChefHat size={18} />}
            Sugerencias de Aero (IA)
          </button>
        </div>
      </section>

      <AnimatePresence>
        {mealIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 rounded-3xl max-w-md w-full space-y-4"
            >
              <h2 className="text-2xl font-bold">Combustible para la Virtud</h2>
              <p className="text-slate-300 italic font-serif text-lg leading-relaxed">"{mealIdea}"</p>
              <button
                onClick={() => setMealIdea(null)}
                className="w-full py-4 bg-brand-blue text-slate-950 rounded-xl font-black"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Info */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Scale size={14} /> Información Personal
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5 text-sm">
          <EditableField
            label="Nombre"
            value={profile.name}
            onSave={(v) => handleUpdateProfile('name', v)}
          />
          <EditableField
            label="Peso (kg)"
            type="number"
            value={String(profile.weight_kg || '')}
            onSave={(v) => handleUpdateProfile('weight_kg', parseFloat(v))}
          />
          <EditableField
            label="Altura (cm)"
            type="number"
            value={String(profile.height_cm || '')}
            onSave={(v) => handleUpdateProfile('height_cm', parseFloat(v))}
          />
          <EditableField
            label="Edad"
            type="number"
            value={String(profile.age || '')}
            onSave={(v) => handleUpdateProfile('age', parseInt(v))}
          />
        </div>
      </section>

      {/* Goal */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Target size={14} /> Objetivo
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(GOALS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleUpdateProfile('goal', key)}
              className={cn(
                'py-3 rounded-xl font-medium transition-all border text-sm',
                profile.goal === key
                  ? 'bg-brand-blue border-brand-blue text-slate-950 font-bold'
                  : 'glass border-transparent text-slate-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Level */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Trophy size={14} /> Nivel
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(LEVELS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleUpdateProfile('level', key)}
              className={cn(
                'py-3 rounded-xl font-medium transition-all border text-sm',
                profile.level === key
                  ? 'bg-brand-blue border-brand-blue text-slate-950 font-bold'
                  : 'glass border-transparent text-slate-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Activity */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Activity size={14} /> Nivel de Actividad
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleUpdateProfile('activity_level', key)}
              className={cn(
                'py-3 rounded-xl font-medium transition-all border text-[11px]',
                profile.activity_level === key
                  ? 'bg-brand-blue border-brand-blue text-slate-950 font-bold'
                  : 'glass border-transparent text-slate-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Frequency */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Calendar size={14} /> Frecuencia Semanal
        </h3>
        <div className="glass p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-400 font-medium">Sesiones / Semana</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleUpdateProfile('weekly_frequency', Math.max(1, (profile.weekly_frequency || 3) - 1))}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-brand-blue"
            >
              -
            </button>
            <span className="font-bold text-xl text-slate-50 w-6 text-center">
              {profile.weekly_frequency || 3}
            </span>
            <button
              onClick={() => handleUpdateProfile('weekly_frequency', Math.min(7, (profile.weekly_frequency || 3) + 1))}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-brand-blue"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <RotateCcw size={14} /> Gestión de Datos
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full py-4 glass rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Download size={18} /> Exportar Backup JSON
          </button>
          <button
            onClick={() => confirm('¿Cerrar sesión?') && signOut()}
            className="w-full py-4 glass border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </section>
    </div>
  );
}

function EditableField({ label, value, type = 'text', onSave }: {
  label: string;
  value: string;
  type?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);

  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-slate-400 font-medium">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => { onSave(val); setEditing(false); }}
            onKeyDown={(e) => e.key === 'Enter' && (onSave(val), setEditing(false))}
            className="bg-slate-800 text-right outline-none font-bold text-brand-blue w-24 rounded-lg px-2 py-1 focus:ring-1 ring-brand-blue/30"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => { setVal(value); setEditing(true); }}
          className="font-bold text-brand-blue"
        >
          {value || 'Añadir'}
        </button>
      )}
    </div>
  );
}

function MacroCard({ label, value, color }: { label: string; value: string; color: 'blue' | 'yellow' | 'green' }) {
  const colors = {
    blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
    yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    green: 'text-brand-green bg-brand-green/10 border-brand-green/20',
  };
  return (
    <div className={cn('p-3 rounded-2xl border text-center space-y-1', colors[color])}>
      <p className="text-[10px] font-bold uppercase">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
