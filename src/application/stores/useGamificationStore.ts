import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';
import type { Achievement } from '../../infrastructure/supabase/types';

interface GamificationState {
  achievements: Achievement[];
  isLoading: boolean;
  newUnlockedAchievement: Achievement | null;

  // Actions
  fetchAchievements: (userId: string) => Promise<void>;
  checkForNewAchievements: (
    userId: string,
    sessionsCount: number,
    streak: number,
    maxSessionVolume: number,
    hasAnyPR: boolean
  ) => Promise<Achievement[]>;
  clearNewAchievement: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  achievements: [],
  isLoading: false,
  newUnlockedAchievement: null,

  fetchAchievements: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (!error && data) set({ achievements: data });
    set({ isLoading: false });
  },

  checkForNewAchievements: async (userId, sessionsCount, streak, maxSessionVolume, hasAnyPR) => {
    const { achievements } = get();
    const unlockedNow: Achievement[] = [];

    const checkAndInsert = async (type: string, title: string, description: string, icon: string) => {
      const alreadyEarned = achievements.some((a) => a.type === type);
      if (alreadyEarned) return;

      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          type,
          title,
          description,
          icon,
        })
        .select()
        .single();

      if (!error && data) {
        unlockedNow.push(data);
      }
    };

    try {
      // 1. Logro: Primer Entrenamiento
      if (sessionsCount >= 1) {
        await checkAndInsert(
          'first_workout',
          'Primer Paso 🏋️‍♂️',
          'Completaste tu primer entrenamiento en AeroGym. ¡El viaje ha comenzado!',
          'dumbbell'
        );
      }

      // 2. Logro: Consistencia de Hierro (Racha >= 3 días)
      if (streak >= 3) {
        await checkAndInsert(
          'iron_consistency',
          'Consistencia de Hierro 🛡️',
          'Entrenaste al menos 3 días consecutivos. La constancia supera al talento.',
          'shield'
        );
      }

      // 3. Logro: Titán de Acero (Volumen sesión > 5,000 kg)
      if (maxSessionVolume >= 5000) {
        await checkAndInsert(
          'steel_titan',
          'Titán de Acero ⚡',
          'Moviste más de 5,000 kg de volumen total en una sola sesión de entrenamiento.',
          'zap'
        );
      }

      // 4. Logro: Superador de Límites (Tiene algún PR)
      if (hasAnyPR) {
        await checkAndInsert(
          'limit_breaker',
          'Superador de Límites 🏆',
          'Superaste tu récord personal estimado (PR) en algún ejercicio de tu bitácora.',
          'trophy'
        );
      }

      if (unlockedNow.length > 0) {
        set((state) => ({
          achievements: [...unlockedNow, ...state.achievements],
          newUnlockedAchievement: unlockedNow[0], // Guardamos el primero para mostrar la alerta
        }));
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
    }

    return unlockedNow;
  },

  clearNewAchievement: () => set({ newUnlockedAchievement: null }),
}));
