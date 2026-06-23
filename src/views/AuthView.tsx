import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff, Loader2, Chrome, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { cn } from '../lib/utils';

type AuthMode = 'login' | 'register';

export default function AuthView() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('El nombre es obligatorio');
          return;
        }
        await signUpWithEmail(email, password, name);
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Confirma tu email antes de entrar');
      } else if (errorMessage.includes('already registered')) {
        setError('Este email ya tiene una cuenta. Inicia sesión.');
      } else if (errorMessage.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error con Google Sign In');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-blue/20 rounded-3xl border border-brand-blue/30 shadow-lg shadow-brand-blue/10">
            <Dumbbell size={40} className="text-brand-blue" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-50 tracking-tight">AeroGym</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Tu entrenador personal inteligente</p>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 space-y-6"
        >
          {/* Mode Tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-2xl">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                  mode === m
                    ? 'bg-brand-blue text-slate-950 shadow-lg shadow-brand-blue/20'
                    : 'text-slate-400 hover:text-slate-300'
                )}
              >
                {m === 'login' ? 'Entrar' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-11 pr-12 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm text-center"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-blue text-slate-950 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-blue/90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">o continúa con</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full py-4 glass-dark border border-white/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <Chrome size={20} className="text-blue-400" />
            <span>Google</span>
          </button>
        </motion.div>

        <p className="text-center text-slate-600 text-xs">
          Tus datos están seguros y son solo tuyos.
        </p>
      </div>
    </div>
  );
}
