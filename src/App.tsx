import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  LayoutDashboard,
  TrendingUp,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from './lib/utils';
import { useAuthStore } from './application/stores/useAuthStore';
import { useWorkoutStore } from './application/stores/useWorkoutStore';
import { useHealthStore } from './application/stores/useHealthStore';

// Views
import AuthView from './views/AuthView';
import Dashboard from './views/Dashboard';
import RoutinesList from './views/RoutinesList';
import TrainingSession from './views/TrainingSession';
import Analytics from './views/Analytics';
import ProfileSettings from './views/ProfileSettings';
import OnboardingView from './views/OnboardingView';
import CoachView from './views/CoachView';

type Tab = 'home' | 'workouts' | 'coach' | 'analytics' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<Tab>('home');
  const { user, profile, isLoading, isAuthenticated, initialize } = useAuthStore();
  const { activeSession, fetchSessions, fetchRoutines, fetchWorkoutHistory, routines, sessions } = useWorkoutStore();
  const { fetchHealth, fetchMeasurements } = useHealthStore();

  // Inicializar Supabase Auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cargar datos del usuario cuando se autentica
  useEffect(() => {
    if (user?.id) {
      fetchSessions(user.id);
      fetchRoutines(user.id);
      fetchWorkoutHistory(user.id);
      fetchHealth(user.id);
      fetchMeasurements(user.id);
    }
  }, [user?.id, fetchSessions, fetchRoutines, fetchWorkoutHistory, fetchHealth, fetchMeasurements]);

  // Siguiente rutina sugerida (rotación automática)
  const nextSuggestedRoutine = useMemo(() => {
    if (!routines.length) return undefined;
    if (!sessions.length) return routines[0];
    const lastSession = sessions[0];
    const lastIdx = routines.findIndex((r) => r.name === lastSession.name);
    if (lastIdx === -1 || lastIdx === routines.length - 1) return routines[0];
    return routines[lastIdx + 1];
  }, [sessions, routines]);

  // ── Loading screen ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-brand-blue/20 rounded-3xl border border-brand-blue/30 flex items-center justify-center">
          <Dumbbell size={32} className="text-brand-blue" />
        </div>
        <Loader2 size={24} className="text-brand-blue animate-spin" />
      </div>
    );
  }

  // ── Auth guard ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // ── Onboarding ───────────────────────────────────────────────
  if (profile && !profile.onboarding_complete) {
    return (
      <div className="min-h-screen max-w-md mx-auto px-4 pt-6 pb-10">
        <OnboardingView profile={profile} />
      </div>
    );
  }

  // ── Active Session (fullscreen) ──────────────────────────────
  if (activeSession) {
    return (
      <div className="min-h-screen max-w-md mx-auto px-4 pt-6 pb-10">
        <TrainingSession />
      </div>
    );
  }

  // ── Main App ─────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard nextRoutine={nextSuggestedRoutine} />;
      case 'workouts':
        return <RoutinesList />;
      case 'coach':
        return <CoachView />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <Dashboard nextRoutine={nextSuggestedRoutine} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-dark h-20 px-6 flex items-center justify-between z-50 rounded-t-3xl border-t border-white/5">
        <NavBtn
          icon={<LayoutDashboard size={24} />}
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
          label="Inicio"
        />
        <NavBtn
          icon={<Dumbbell size={24} />}
          active={activeTab === 'workouts'}
          onClick={() => setActiveTab('workouts')}
          label="Log"
        />
        <NavBtn
          icon={<Sparkles size={24} />}
          active={activeTab === 'coach'}
          onClick={() => setActiveTab('coach')}
          label="Coach"
        />
        <NavBtn
          icon={<TrendingUp size={24} />}
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          label="Stats"
        />
        <NavBtn
          icon={<User size={24} />}
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          label="Perfil"
        />
      </nav>
    </div>
  );
}

function NavBtn({
  icon,
  active,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn('nav-item text-slate-500', active && 'nav-item-active text-brand-blue')}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
}
