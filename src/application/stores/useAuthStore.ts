import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../infrastructure/supabase/client';
import type { Profile } from '../../infrastructure/supabase/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await fetchProfile(session.user.id, session.user.email);
            set({
              user: session.user,
              session,
              profile,
              isAuthenticated: true,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const profile = await fetchProfile(session.user.id, session.user.email);
              set({
                user: session.user,
                session,
                profile,
                isAuthenticated: true,
              });
            } else if (!get().user || get().user?.id !== 'guest-local-user') {
              set({ user: null, session: null, profile: null, isAuthenticated: false });
            }
          });
        } catch (e) {
          console.error('Error initializing auth:', e);
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithEmail: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("Supabase signIn error:", error);
          throw new Error(extractErrorMessage(error));
        }
        if (data?.user) {
          const profile = await fetchProfile(data.user.id, data.user.email);
          set({
            user: data.user,
            session: data.session,
            profile,
            isAuthenticated: true,
          });
        }
      },

      signUpWithEmail: async (email, password, name) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) {
          console.error("Supabase signUp error:", error);
          throw new Error(extractErrorMessage(error));
        }
      },

      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/Aerogym/`,
          },
        });
        if (error) {
          console.error("Supabase Google Auth error:", error);
          throw new Error(extractErrorMessage(error));
        }
      },

      signInAsGuest: () => {
        const guestId = 'guest-local-user';
        const guestUser: any = {
          id: guestId,
          email: 'invitado@aerogym.local',
          user_metadata: { full_name: 'Atleta Invitado' },
        };
        const guestProfile: Profile = {
          id: guestId,
          name: 'Atleta Invitado',
          age: 28,
          gender: 'other',
          height_cm: 175,
          weight_kg: 70,
          goal: 'hypertrophy',
          level: 'beginner',
          activity_level: 'moderate',
          experience: 'full_body',
          weekly_frequency: 3,
          avatar_url: null,
          onboarding_complete: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          user: guestUser,
          session: null,
          profile: guestProfile,
          isAuthenticated: true,
        });
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch {}
        set({ user: null, session: null, profile: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user) throw new Error('No user logged in');

        if (user.id === 'guest-local-user') {
          const updatedProfile = { ...(profile || {}), ...updates } as Profile;
          set({ profile: updatedProfile });
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        set({ profile: data });
      },

      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'aerogym-auth',
      partialize: (state) => ({
        user: state.user?.id === 'guest-local-user' ? state.user : null,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated && state.user?.id === 'guest-local-user',
      }),
    }
  )
);

async function fetchProfile(userId: string, email?: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return data;
    }

    // Intentar crear un perfil en DB si falta la fila
    const fallbackName = email ? email.split('@')[0] : 'Usuario';
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert({ id: userId, name: fallbackName })
      .select()
      .single();

    if (!createError && newProfile) {
      return newProfile;
    }
  } catch (e) {
    console.warn('Network error or exception fetching profile:', e);
  }

  // Fallback local garantizado para que el perfil nunca sea nulo
  return {
    id: userId,
    name: email ? email.split('@')[0] : 'Usuario',
    age: 28,
    gender: 'other',
    height_cm: 175,
    weight_kg: 70,
    goal: 'hypertrophy',
    level: 'beginner',
    activity_level: 'moderate',
    experience: 'full_body',
    weekly_frequency: 3,
    avatar_url: null,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function extractErrorMessage(err: any): string {
  if (!err) return 'Error desconocido';
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string') return err.message;
  if (err.error_description && typeof err.error_description === 'string') return err.error_description;
  if (err.msg && typeof err.msg === 'string') return err.msg;
  
  try {
    const extracted: Record<string, any> = {};
    const allKeys = Object.getOwnPropertyNames(err);
    for (const key of allKeys) {
      if (typeof err[key] === 'string' || typeof err[key] === 'number') {
        extracted[key] = err[key];
      }
    }
    if (extracted.message) return extracted.message;
    if (Object.keys(extracted).length > 0) {
      return JSON.stringify(extracted);
    }
  } catch (e) {}

  return String(err);
}
