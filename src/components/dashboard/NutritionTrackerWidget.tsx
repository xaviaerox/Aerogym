import { useState, useMemo } from 'react';
import { Utensils, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { calculateAdaptiveNutrition } from '../../lib/nutritionEngine';

export default function NutritionTrackerWidget() {
  const { profile } = useAuthStore();
  const [loggedCalories, setLoggedCalories] = useState<number>(1850);
  const [loggedProtein, setLoggedProtein] = useState<number>(140);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCalories, setInputCalories] = useState('1850');
  const [inputProtein, setInputProtein] = useState('140');

  const goals = useMemo(() => {
    return calculateAdaptiveNutrition(profile || {});
  }, [profile]);

  const calPercent = Math.min(100, Math.round((loggedCalories / goals.dailyCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((loggedProtein / goals.proteinGrams) * 100));

  const handleSave = () => {
    setLoggedCalories(Number(inputCalories) || 0);
    setLoggedProtein(Number(inputProtein) || 0);
    setIsEditing(false);
  };

  return (
    <div className="glass-dark border border-white/10 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Control de Nutrición</h3>
            <p className="text-[11px] text-slate-400">Objetivo según perfil físico</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors flex items-center gap-1"
        >
          {isEditing ? <Check size={14} className="text-emerald-400" /> : <Plus size={14} />}
          <span>{isEditing ? 'Guardar' : 'Registrar'}</span>
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label htmlFor="input-calories" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Calorías (kcal)</label>
            <input
              id="input-calories"
              type="number"
              value={inputCalories}
              onChange={(e) => setInputCalories(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="input-protein" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proteínas (g)</label>
            <input
              id="input-protein"
              type="number"
              value={inputProtein}
              onChange={(e) => setInputProtein(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleSave}
            className="col-span-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs py-2 rounded-xl text-slate-950 transition-colors mt-1"
          >
            Guardar Nutrición
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Calorías */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Calorías</span>
              <span className="text-emerald-400">{loggedCalories} / {goals.dailyCalories} kcal</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* Proteínas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Proteína</span>
              <span className="text-blue-400">{loggedProtein} / {goals.proteinGrams}g</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
