import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ualgaluxhznwavksguuu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbGdhbHV4aHpud2F2a3NndXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDMzMDYsImV4cCI6MjA5NzgxOTMwNn0.uZXhYCLtZWMkhM9_QovHwEKzKF40ZXmCf-Ak7elFMOI';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-supabase-project.supabase.co')
  ? import.meta.env.VITE_SUPABASE_URL
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-supabase-anon-key')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : DEFAULT_SUPABASE_ANON_KEY;

// Usamos el cliente sin genérico de DB — los tipos los manejamos a nivel de cada repositorio.
// Esto evita el error "never" que ocurre cuando el genérico Database no se resuelve en isolatedModules.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
