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
            const profile = await fetchProfile(session.user.id);
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
              const profile = await fetchProfile(session.user.id);
              set({
                user: session.user,
                session,
                profile,
                isAuthenticated: true,
              });
            } else {
              set({ user: null, session: null, profile: null, isAuthenticated: false });
            }
          });
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("Supabase signIn error:", error);
          throw new Error(error.message || JSON.stringify(error));
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
          throw new Error(error.message || JSON.stringify(error));
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
          throw new Error(error.message || JSON.stringify(error));
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

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
      partialize: (state) => ({ profile: state.profile }), // Solo persistimos el perfil, no la sesión (Supabase la maneja)
    }
  )
);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}
