import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Clock, X, Check, Dumbbell } from 'lucide-react';
import { requestNotificationPermission, scheduleWorkoutReminder } from '../../lib/notificationService';
import { useToastStore } from '../../application/stores/useToastStore';

interface WorkoutReminderModalProps {
  routineName?: string;
  onClose: () => void;
}

export default function WorkoutReminderModal({ routineName = 'Entrenamiento Diario', onClose }: WorkoutReminderModalProps) {
  const [time, setTime] = useState('18:00');
  const [isEnabled, setIsEnabled] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSave = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      addToast({ title: 'Permiso de notificaciones denegado en el navegador.', type: 'error' });
      return;
    }

    const scheduled = scheduleWorkoutReminder(time, routineName);
    if (scheduled) {
      setIsEnabled(true);
      addToast({ title: `Recordatorio programado a las ${time}`, type: 'success' });
      setTimeout(onClose, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-dark border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-blue/20 text-brand-blue rounded-xl border border-brand-blue/30">
              <Bell size={18} />
            </div>
            <h3 className="font-extrabold text-slate-100 text-base">Recordatorio PWA</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Programa una alerta diaria para no perder tu racha de entrenamiento con la rutina <span className="font-bold text-white">{routineName}</span>.
          </p>

          <div>
            <label htmlFor="reminder-time-input" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Hora de Notificación
            </label>
            <div className="relative flex items-center">
              <Clock size={16} className="absolute left-3.5 text-slate-400" />
              <input
                id="reminder-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-brand-blue/20 transition-all text-sm"
        >
          {isEnabled ? <Check size={18} /> : <Dumbbell size={18} />}
          <span>{isEnabled ? '¡Recordatorio Activado!' : 'Activar Recordatorio'}</span>
        </button>
      </motion.div>
    </div>
  );
}
