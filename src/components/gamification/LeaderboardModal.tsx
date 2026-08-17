import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Dumbbell, X, Award, Medal, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { useWorkoutStore } from '../../application/stores/useWorkoutStore';
import { useWorkoutStreak } from '../../hooks/useWorkoutStreak';
import { computeLeaderboard } from '../../lib/leaderboardEngine';
import { calculateE1RM } from '../../lib/math/formulas';

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [sortBy, setSortBy] = useState<'dots' | 'volume' | 'streak'>('dots');
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const sessions = useWorkoutStore((s) => s.sessions);
  const workoutSetsHistory = useWorkoutStore((s) => s.workoutSetsHistory);
  const streak = useWorkoutStreak(sessions);

  // Compute total volume for current week
  const weeklyVolume = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return sessions
      .filter((s) => new Date(s.started_at) >= oneWeekAgo)
      .reduce((acc, s) => acc + Number(s.total_volume_kg || 0), 0);
  }, [sessions]);

  // Compute max estimated total lifted (bench + squat + deadlift maxes)
  const totalLiftedKg = useMemo(() => {
    if (!workoutSetsHistory.length) return 300;
    const maxE1rms: Record<string, number> = {};
    workoutSetsHistory.forEach((st) => {
      if (!st.is_completed) return;
      const e1rm = st.e1rm_kg ? Number(st.e1rm_kg) : calculateE1RM(Number(st.weight_kg || 0), st.reps || 0);
      if (e1rm > (maxE1rms[st.exercise_id] || 0)) {
        maxE1rms[st.exercise_id] = e1rm;
      }
    });

    const bench = maxE1rms['bench-press'] || 100;
    const squat = maxE1rms['squats'] || 140;
    const deadlift = maxE1rms['deadlift'] || 160;
    return Math.round(bench + squat + deadlift);
  }, [workoutSetsHistory]);

  const leaderboardData = useMemo(() => {
    return computeLeaderboard(
      {
        userId: user?.id || 'guest-user',
        name: profile?.name || 'Tú',
        bodyWeightKg: Number(profile?.weight_kg || 75),
        totalLiftedKg,
        gender: profile?.gender || 'male',
        weeklyVolumeKg: weeklyVolume,
        streakDays: streak,
      },
      sortBy
    );
  }, [user?.id, profile, totalLiftedKg, weeklyVolume, streak, sortBy]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-dark border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-lg leading-tight">Tabla de Clasificación</h3>
              <p className="text-xs text-amber-400 font-medium">{leaderboardData.userPercentileText}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-white/5 shrink-0">
          <button
            onClick={() => setSortBy('dots')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              sortBy === 'dots'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award size={14} />
            <span>DOTS</span>
          </button>
          <button
            onClick={() => setSortBy('volume')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              sortBy === 'volume'
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell size={14} />
            <span>Volumen</span>
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              sortBy === 'streak'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={14} />
            <span>Racha</span>
          </button>
        </div>

        {/* Leaderboard Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {leaderboardData.entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankColor =
              entry.rank === 1 ? 'text-amber-400 bg-amber-500/20 border-amber-500/40' :
              entry.rank === 2 ? 'text-slate-300 bg-slate-400/20 border-slate-400/40' :
              entry.rank === 3 ? 'text-amber-600 bg-amber-700/20 border-amber-700/40' :
              'text-slate-400 bg-slate-800 border-white/5';

            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  entry.isCurrentUser
                    ? 'bg-brand-blue/15 border-brand-blue/50 shadow-lg shadow-brand-blue/10'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs ${rankColor}`}>
                    {isTop3 ? <Medal size={16} /> : `#${entry.rank}`}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${entry.isCurrentUser ? 'text-brand-blue' : 'text-slate-200'}`}>
                      {entry.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{entry.strengthCategory}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-black text-slate-100">
                    {sortBy === 'dots' ? `${entry.dotsPoints} pts` :
                     sortBy === 'volume' ? `${(entry.weeklyVolumeKg / 1000).toFixed(1)}k kg` :
                     `${entry.streakDays} días`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {sortBy === 'dots' ? 'Score DOTS' : sortBy === 'volume' ? 'Volumen 7d' : 'Consistencia'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
