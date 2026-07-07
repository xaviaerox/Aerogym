import React from 'react';
import { User, Scale, Target, Trophy, Download, RotateCcw, Calendar, Utensils, Activity, LogOut, ChefHat, Loader2, Key, HelpCircle, Dumbbell, Shield, Zap, Award } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { useGamificationStore } from '../application/stores/useGamificationStore';
import { getNutritionalAdvice } from '../lib/aiService';
import { calculateNutrition } from '../lib/engine';
import { cn } from '../lib/utils';
import type { Profile } from '../infrastructure/supabase/types';
import { MuscleWikiService } from '../lib/muscleWikiService';

const ALL_ACHIEVEMENTS = [
  {
    type: 'first_workout',
    title: 'Primer Paso',
    description: 'Completaste tu primer entrenamiento en AeroGym.',
    icon: 'dumbbell',
  },
  {
    type: 'iron_consistency',
    title: 'Consistencia de Hierro',
    description: 'Entrenaste al menos 3 días consecutivos.',
    icon: 'shield',
  },
  {
    type: 'steel_titan',
    title: 'Titán de Acero',
    description: 'Moviste más de 5,000 kg de volumen total en una sola sesión.',
    icon: 'zap',
  },
  {
    type: 'limit_breaker',
    title: 'Superador de Límites',
    description: 'Superaste tu récord personal estimado (PR) en algún ejercicio.',
    icon: 'trophy',
  },
];

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
  const { achievements, fetchAchievements } = useGamificationStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mealIdea, setMealIdea] = React.useState<string | null>(null);

  // MuscleWiki API State
  const [mwKey, setMwKey] = React.useState(() => MuscleWikiService.getApiKey());
  const [isTestingMw, setIsTestingMw] = React.useState(false);
  const [mwTestResult, setMwTestResult] = React.useState<{ success: boolean; message: string; tier: 'BASIC' | 'TESTING+' | 'INVALID' } | null>(null);
  const [mwMockMode, setMwMockMode] = React.useState(() => MuscleWikiService.isMockModeActive());

  const handleTestMw = async () => {
    setIsTestingMw(true);
    setMwTestResult(null);
    const res = await MuscleWikiService.verifyConnection(mwKey);
    setMwTestResult(res);
    if (res.tier === 'BASIC') {
      MuscleWikiService.setMockMode(true);
      setMwMockMode(true);
    } else if (res.tier === 'TESTING+') {
      MuscleWikiService.setMockMode(false);
      setMwMockMode(false);
    }
    setIsTestingMw(false);
  };

  const handleSaveMwKey = (val: string) => {
    MuscleWikiService.setApiKey(val);
    setMwKey(val);
    setMwTestResult(null);
  };

  const handleToggleMock = () => {
    const nextVal = !mwMockMode;
    MuscleWikiService.setMockMode(nextVal);
    setMwMockMode(nextVal);
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchAchievements(user.id);
    }
  }, [user?.id, fetchAchievements]);

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

      {/* Logros / Insignias */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Trophy size={14} className="text-amber-400" /> Logros Desbloqueados
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const earned = achievements.find((a) => a.type === ach.type);
            return (
              <div
                key={ach.type}
                className={cn(
                  'glass p-4 rounded-3xl border text-left flex gap-3 transition-all relative overflow-hidden',
                  earned
                    ? 'border-brand-blue/30 bg-brand-blue/[0.03]'
                    : 'border-white/5 opacity-40'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                  earned 
                    ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                    : 'bg-white/5 border-white/5 text-slate-500'
                )}>
                  {ach.icon === 'dumbbell' && <Dumbbell size={20} />}
                  {ach.icon === 'shield' && <Shield size={20} />}
                  {ach.icon === 'zap' && <Zap size={20} />}
                  {ach.icon === 'trophy' && <Trophy size={20} />}
                  {!['dumbbell', 'shield', 'zap', 'trophy'].includes(ach.icon) && <Award size={20} />}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-50 text-xs leading-normal">{ach.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">{ach.description}</p>
                  {earned && (
                    <span className="text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-black uppercase tracking-wider inline-block mt-1">
                      Desbloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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

      {/* MuscleWiki API Integration */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Key size={14} className="text-brand-blue" /> Integración de MuscleWiki
        </h3>
        <div className="glass p-6 rounded-3xl space-y-4 border border-white/5">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
              Clave de API de MuscleWiki
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mwKey}
                onChange={(e) => setMwKey(e.target.value)}
                placeholder="mw_xxxxxxxxxxxxxxxxxxxxxxxx..."
                className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-600 font-mono text-slate-200"
              />
              <button
                onClick={() => handleSaveMwKey(mwKey)}
                className="px-3 bg-brand-blue text-slate-950 rounded-xl font-bold text-xs hover:bg-brand-blue/80 transition-all"
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  Modo Simulación / Demo
                  <span className="text-[10px] text-slate-500 hover:text-brand-blue cursor-pointer" title="Recomendado si usas un plan BASIC para evitar bloqueos CORS o de red en navegador.">
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span className="text-[9px] text-slate-505">
                  {mwMockMode ? 'Usando base de datos local detallada' : 'Realizando llamadas directas a MuscleWiki'}
                </span>
              </div>
              <button
                onClick={handleToggleMock}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                  mwMockMode
                    ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                    : "bg-white/5 border-white/10 text-slate-400"
                )}
              >
                {mwMockMode ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <button
              onClick={handleTestMw}
              disabled={isTestingMw || !mwKey.trim()}
              className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center justify-center gap-2"
            >
              {isTestingMw ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Verificando...
                </>
              ) : (
                'Probar Conexión con la API'
              )}
            </button>
          </div>

          {mwTestResult && (
            <div className={cn(
              "p-3 rounded-2xl text-xs border leading-relaxed",
              mwTestResult.success
                ? mwTestResult.tier === 'BASIC'
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-brand-green/10 border-brand-green/20 text-brand-green"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              <p className="font-bold flex items-center gap-1">
                {mwTestResult.success ? '✓ Conectado' : '⚠️ Error'}
                {mwTestResult.success && (
                  <span className="text-[9px] uppercase font-black bg-white/10 px-1 rounded">
                    Plan {mwTestResult.tier}
                  </span>
                )}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">{mwTestResult.message}</p>
            </div>
          )}
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
