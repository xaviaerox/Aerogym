/**
 * AchievementModal.tsx — Animated Celebration Modal for Unlocked Achievements.
 *
 * Displays a celebratory pop-up with particle animations and haptic feedback
 * whenever a user earns a new achievement badge.
 */
import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Shield, Zap, Dumbbell, Star, X } from 'lucide-react';
import type { Achievement } from '../../infrastructure/supabase/types';
import { vibrateSuccess } from '../../lib/haptics';

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const ICON_MAP: Record<string, ComponentType<any>> = {
  trophy: Trophy,
  shield: Shield,
  zap: Zap,
  dumbbell: Dumbbell,
  star: Star,
};

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  useEffect(() => {
    if (achievement) {
      vibrateSuccess();
    }
  }, [achievement]);

  if (!achievement) return null;

  const IconComponent = (achievement.icon && ICON_MAP[achievement.icon]) || Trophy;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="glass-dark border border-brand-blue/40 p-6 rounded-3xl max-w-sm w-full text-center relative shadow-2xl shadow-brand-blue/30 overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-blue/20 rounded-full blur-[80px] pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 glass rounded-full text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>

          {/* Icon Badge */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="w-20 h-20 rounded-3xl bg-brand-blue/20 border-2 border-brand-blue/50 flex items-center justify-center mx-auto mb-4 text-brand-blue shadow-lg shadow-brand-blue/20"
          >
            <IconComponent size={40} />
          </motion.div>

          <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
            ¡NUEVO LOGRO DESBLOQUEADO!
          </span>

          <h2 className="text-2xl font-black text-slate-50 mt-3 mb-2">{achievement.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            {achievement.description}
          </p>

          <button
            onClick={onClose}
            className="btn-primary w-full py-3 text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            ¡CONTINUAR!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
