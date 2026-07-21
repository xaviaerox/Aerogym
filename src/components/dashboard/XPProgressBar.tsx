import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import type { UserXPResult } from '../../hooks/useUserXP';

interface XPProgressBarProps {
  userXP: UserXPResult;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ userXP }) => {
  return (
    <div className="glass p-4 rounded-3xl border border-white/5 bg-slate-900/40 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Trophy size={14} className="text-amber-400" />
          <span>Nivel {userXP.level}</span>
        </div>
        <span className="text-slate-400 font-medium">{userXP.total} XP total</span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${userXP.progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full"
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Lvl {userXP.level}</span>
        <span>{userXP.progressPercent}% para Lvl {userXP.level + 1}</span>
      </div>
    </div>
  );
};

export default XPProgressBar;
