import { useState, useMemo, useEffect } from 'react';
import { Utensils, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { calculateAdaptiveNutrition } from '../../lib/nutritionEngine';

export default function NutritionTrackerWidget() {
  const { profile } = useAuthStore();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const storageKey = `aerogym_nutrition_${todayStr}`;

  const [loggedCalories, setLoggedCalories] = useState<number>(0);
  const [loggedProtein, setLoggedProtein] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCalories, setInputCalories] = useState('');
  const [inputProtein, setInputProtein] = useState('');

  // Cargar registros reales guardados para la fecha de hoy
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cal = Number(parsed.calories) || 0;
        const prot = Number(parsed.protein) || 0;
        setLoggedCalories(cal);
        setLoggedProtein(prot);
        setInputCalories(cal > 0 ? String(cal) : '');
        setInputProtein(prot > 0 ? String(prot) : '');
      }
    } catch {
      // Si no hay datos, permanece en 0
    }
  }, [storageKey]);

  const goals = useMemo(() => {
    return calculateAdaptiveNutrition(profile || {});
  }, [profile]);

  const calPercent = Math.min(100, Math.round((loggedCalories / goals.dailyCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((loggedProtein / goals.proteinGrams) * 100));

  const handleSave = () => {
    const cal = Number(inputCalories) || 0;
    const prot = Number(inputProtein) || 0;
    setLoggedCalories(cal);
    setLoggedProtein(prot);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ calories: cal, protein: prot }));
    } catch {
      // fallback
    }
    setIsEditing(false);
  };

  const hasLoggedData = loggedCalories > 0 || loggedProtein > 0;

  return (
    <div className="glass-dark border border-white/10 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Control de Nutrición Diario</h3>
            <p className="text-[11px] text-slate-400">
              {profile?.weight_kg ? `Objetivo para ${profile.weight_kg} kg` : 'Calculado según perfil'}
            </p>
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
            <label htmlFor="input-calories" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Calorías Consumidas (kcal)
            </label>
            <input
              id="input-calories"
              type="number"
              placeholder="0"
              value={inputCalories}
              onChange={(e) => setInputCalories(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <label htmlFor="input-protein" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Proteínas Consumidas (g)
            </label>
            <input
              id="input-protein"
              type="number"
              placeholder="0"
              value={inputProtein}
              onChange={(e) => setInputProtein(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <button
            onClick={handleSave}
            className="col-span-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs py-2.5 rounded-xl text-slate-950 transition-colors mt-1 shadow-lg shadow-emerald-500/20"
          >
            Guardar Registros Reales
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {!hasLoggedData && (
            <p className="text-xs text-slate-400 italic">
              Sin consumo registrado hoy (0 kcal). Toca <span className="font-bold text-slate-200">"Registrar"</span> para introducir lo que has consumido.
            </p>
          )}

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
        </div>
      )}
    </div>
  );
}
