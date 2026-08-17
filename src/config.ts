import { z } from 'zod';

const configSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
});

const DEFAULT_SUPABASE_URL = 'https://ualgaluxhznwavksguuu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbGdhbHV4aHpud2F2a3NndXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDMzMDYsImV4cCI6MjA5NzgxOTMwNn0.uZXhYCLtZWMkhM9_QovHwEKzKF40ZXmCf-Ak7elFMOI';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const rawConfig = {
  supabaseUrl: (rawUrl && rawUrl !== 'https://your-supabase-project.supabase.co') ? rawUrl : DEFAULT_SUPABASE_URL,
  supabaseAnonKey: (rawKey && rawKey !== 'your-anon-key') ? rawKey : DEFAULT_SUPABASE_ANON_KEY,
};

const parsed = configSchema.safeParse(rawConfig);

if (!parsed.success) {
  console.error('Configuración inválida de Supabase:', parsed.error.format());
}

import packageJson from '../package.json';

export const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string) || packageJson.version;
export const APP_BUILD_ID = (import.meta.env.VITE_APP_BUILD_ID as string) || 'dev-build';
export const APP_COMMIT_SHA = (import.meta.env.VITE_APP_COMMIT_SHA as string) || 'dev';
export const APP_EDITION = 'Enterprise (Reordenación & Stats 2.0)';
export const APP_AUTHOR = 'Xavi de Solutech';
export const APP_FULL_BRANDING = `AeroGym v${APP_VERSION} ${APP_EDITION}`;

export const config = {
  supabaseUrl: rawConfig.supabaseUrl,
  supabaseAnonKey: rawConfig.supabaseAnonKey,
  appVersion: APP_VERSION,
  buildId: APP_BUILD_ID,
  commitSha: APP_COMMIT_SHA,
  appEdition: APP_EDITION,
  appAuthor: APP_AUTHOR,
  appBranding: APP_FULL_BRANDING,
};
