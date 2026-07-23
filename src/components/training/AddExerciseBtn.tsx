/**
 * AddExerciseBtn — Modal picker to add an exercise to an active session.
 * Extracted from TrainingSession.tsx for SRP compliance.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BASE_EXERCISES } from '../../constants/exercises';

interface AddExerciseBtnProps {
  onAdd: (exerciseId: string) => void;
}

export default function AddExerciseBtn({ onAdd }: AddExerciseBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const muscleGroups = Array.from(new Set(BASE_EXERCISES.map((ex) => ex.muscleGroup)));

  const filtered = BASE_EXERCISES.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
    return matchesSearch && matchesMuscle;
  });

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
    setSelectedMuscle(null);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 glass border-brand-blue/30 text-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/5 transition-colors"
      >
        <Plus size={20} />
        Añadir Ejercicio
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 pb-3">
              <h2 className="text-2xl font-bold">Añadir Ejercicio</h2>
              <button onClick={handleClose} className="p-2 glass rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="px-6 pb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ejercicio o músculo..."
                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
                autoFocus
              />
            </div>

            {/* Muscle Group Filters */}
            <div className="px-6 pb-4 overflow-x-auto flex gap-2 no-scrollbar scrollbar-none">
              <button
                onClick={() => setSelectedMuscle(null)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                  selectedMuscle === null
                    ? 'bg-brand-blue text-slate-950 border-brand-blue'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                )}
              >
                Todos
              </button>
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setSelectedMuscle(mg === selectedMuscle ? null : mg)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
                    selectedMuscle === mg
                      ? 'bg-brand-blue text-slate-950 border-brand-blue'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {mg}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onAdd(ex.id);
                    handleClose();
                  }}
                  className="w-full p-4 glass rounded-xl flex justify-between items-center hover:border-brand-blue/30 border border-transparent transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold">{ex.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
                      {ex.muscleGroup} · {ex.type}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
