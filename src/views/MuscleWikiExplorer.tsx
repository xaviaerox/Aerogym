import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowLeft, BookOpen, X, Dumbbell, Sparkles, Play } from 'lucide-react';
import {
  MuscleWikiService,
  MuscleWikiExercise,
  TRANSLATE_MUSCLE,
  TRANSLATE_CATEGORY
} from '../lib/muscleWikiService';
import { cn } from '../lib/utils';
import ExerciseMedia from '../components/ExerciseMedia';
import { prewarmGifCache } from '../lib/exerciseGifService';

// Filter choices
const MUSCLES = [
  { key: '', label: 'Todos los músculos' },
  ...Object.entries(TRANSLATE_MUSCLE).map(([key, value]) => ({ key, label: value }))
];

const CATEGORIES = [
  { key: '', label: 'Todo el equipamiento' },
  ...Object.entries(TRANSLATE_CATEGORY).map(([key, value]) => ({ key, label: value }))
];

const DIFFICULTIES = [
  { key: '', label: 'Cualquier dificultad' },
  { key: 'Novice', label: 'Principiante Absoluto' },
  { key: 'Beginner', label: 'Principiante' },
  { key: 'Intermediate', label: 'Intermedio' },
  { key: 'Advanced', label: 'Avanzado' }
];

function ExerciseImage({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    if (currentSrc.startsWith('/Aerogym/')) {
      const altSrc = currentSrc.replace('/Aerogym/', '/');
      setCurrentSrc(altSrc);
    } else if (currentSrc.startsWith('/') && baseUrl !== '/' && !currentSrc.startsWith(baseUrl)) {
      const baseUrlClean = baseUrl.replace(/\/$/, '');
      const altSrc = `${baseUrlClean}${currentSrc}`;
      setCurrentSrc(altSrc);
    } else {
      setError(true);
    }
  };

  if (error) {
    return <Dumbbell size={20} className="text-brand-blue" />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="w-full h-full object-cover"
      onError={handleError}
    />
  );
}

interface MuscleWikiExplorerProps {
  onBack?: () => void;
  onSelectExercise?: (exercise: MuscleWikiExercise) => void;
}

export default function MuscleWikiExplorer({ onBack, onSelectExercise }: MuscleWikiExplorerProps) {
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [exercises, setExercises] = useState<MuscleWikiExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<MuscleWikiExercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(() => MuscleWikiService.isMockModeActive());

  // Prewarm GIF cache and local dataset on mount so they are ready
  useEffect(() => {
    prewarmGifCache();
    MuscleWikiService.loadDataset().catch(console.error);
  }, []);

  // Load exercises when query or filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadExercises();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedMuscle, selectedCategory, selectedDifficulty]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const filters = {
        ...(selectedMuscle && { muscle: selectedMuscle }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty })
      };
      const results = await MuscleWikiService.searchExercises(query, filters);
      setExercises(results);
      setIsDemoActive(MuscleWikiService.isMockModeActive());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyLabel = (diff: string | null) => {
    if (!diff) return 'General';
    const found = DIFFICULTIES.find(d => d.key === diff);
    return found ? found.label : diff;
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md pt-2 pb-4 z-40">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 glass rounded-xl text-slate-400">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Explorador MuscleWiki</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1">
              <Dumbbell size={10} className="text-brand-blue" />
              Base de Datos Científica
              {isDemoActive && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] tracking-normal font-bold">
                  1,300+ Ejercicios
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Offline Library Notice */}
      {isDemoActive && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-3xl text-xs text-emerald-300/90 flex gap-3 leading-relaxed">
          <BookOpen className="text-emerald-400 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-bold text-emerald-300">Biblioteca Local · 1,300+ ejercicios reales</p>
            <p className="text-[10px] mt-0.5 opacity-80">
              Base de datos integrada con instrucciones detalladas paso a paso en español, imágenes y animaciones locales completas de todos los grupos musculares y equipamientos.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Toggle */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 focus-within:ring-2 ring-brand-blue/30 transition-all">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicio en MuscleWiki..."
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-slate-500 text-slate-100"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all flex items-center justify-center",
              showFilters || selectedMuscle || selectedCategory || selectedDifficulty
                ? "bg-brand-blue/20 border-brand-blue/30 text-brand-blue"
                : "glass border-white/10 text-slate-400"
            )}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Músculo Principal</label>
                    <select
                      value={selectedMuscle}
                      onChange={(e) => setSelectedMuscle(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 ring-brand-blue/30 text-slate-300"
                    >
                      {MUSCLES.map((m) => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Equipamiento</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 ring-brand-blue/30 text-slate-300"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Dificultad</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 ring-brand-blue/30 text-slate-300"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedMuscle('');
                      setSelectedCategory('');
                      setSelectedDifficulty('');
                    }}
                    className="text-[10px] text-red-400 font-bold uppercase tracking-wider hover:underline"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercises List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Cargando catálogo...</p>
          </div>
        </div>
      ) : exercises.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center space-y-2 border border-white/5">
          <Dumbbell className="mx-auto text-slate-600" size={32} />
          <h3 className="font-bold text-slate-400">No se hallaron ejercicios</h3>
          <p className="text-xs text-slate-500">Prueba ajustando los filtros o buscando otro término.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {exercises.map((ex) => {
            const muscleText = TRANSLATE_MUSCLE[ex.primary_muscles[0]] || ex.primary_muscles[0];
            const catText = TRANSLATE_CATEGORY[ex.category] || ex.category;
            
            // Get thumbnail
            const videoObj = ex.videos.find(v => v.og_image);
            const thumbUrl = videoObj ? videoObj.og_image : null;

            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="glass p-4 rounded-3xl border border-white/5 hover:border-brand-blue/30 transition-all flex gap-4 cursor-pointer align-center active:scale-[0.99] relative overflow-hidden"
              >
                {/* Image / Icon container */}
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5 relative">
                  {thumbUrl ? (
                    <ExerciseImage src={thumbUrl} alt={ex.name} />
                  ) : (
                    <Dumbbell size={20} className="text-brand-blue" />
                  )}
                  {ex.videos.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-70">
                      <Play size={14} className="text-slate-50 fill-slate-50" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-2 leading-snug">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[8px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-brand-blue/15">
                      {muscleText}
                    </span>
                    <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-white/5">
                      {catText}
                    </span>
                    <span className="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {getDifficultyLabel(ex.difficulty)}
                    </span>
                  </div>
                </div>

                {onSelectExercise && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExercise(ex);
                    }}
                    className="absolute right-3 bottom-3 bg-brand-blue text-slate-950 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-brand-blue/95"
                  >
                    Elegir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[100] overflow-y-auto px-4 py-8"
          >
            <div className="max-w-md mx-auto space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-slate-400 text-xs font-bold"
                >
                  <ArrowLeft size={16} /> Volver
                </button>
                {onSelectExercise && (
                  <button
                    onClick={() => {
                      onSelectExercise(selectedExercise);
                      setSelectedExercise(null);
                    }}
                    className="px-4 py-2 bg-brand-blue text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Seleccionar Ejercicio
                  </button>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-50 leading-tight">{selectedExercise.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {TRANSLATE_MUSCLE[selectedExercise.primary_muscles[0]] || selectedExercise.primary_muscles[0]}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 border border-white/5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {TRANSLATE_CATEGORY[selectedExercise.category] || selectedExercise.category}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {getDifficultyLabel(selectedExercise.difficulty)}
                  </span>
                </div>
              </div>

              {/* Exercise GIF (ExerciseDB OSS) */}
              <ExerciseMedia
                exerciseName={selectedExercise.name}
                primaryMuscle={selectedExercise.primary_muscles[0]}
                localGifUrl={selectedExercise.videos[0]?.url}
              />

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-3xl border border-white/5 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Fuerza</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedExercise.force || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Mecánica</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedExercise.mechanic || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Tipo Agarre</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedExercise.grips.join(', ') || 'Libre'}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Origen Datos</span>
                  <p className="font-bold text-brand-blue mt-0.5 font-mono">
                    {String(selectedExercise.id).startsWith('mw-') ? 'Dataset Local' : 'MuscleWiki API'}
                  </p>
                </div>
              </div>

              {/* Steps Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-blue" /> Instrucciones Paso a Paso
                </h3>
                <div className="space-y-3">
                  {selectedExercise.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 glass p-4 rounded-2xl border border-white/5 items-start">
                      <div className="w-6 h-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center font-black text-[10px] text-brand-blue flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
