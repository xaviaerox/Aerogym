import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  WifiOff,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../application/stores/useAuthStore';
import { APP_VERSION, APP_EDITION, APP_AUTHOR } from '../config';

type Tab = 'home' | 'workouts' | 'coach' | 'analytics' | 'profile';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile, signOut } = useAuthStore();
  const isGuest = profile?.id?.startsWith('guest-');

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'workouts', label: 'Entrenamientos', icon: <Dumbbell size={20} /> },
    { id: 'coach', label: 'Aero Coach AI', icon: <Sparkles size={20} />, badge: 'IA' },
    { id: 'analytics', label: 'Estadísticas', icon: <TrendingUp size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 glass-dark border-r border-white/5 p-6 justify-between z-40 shrink-0">
      <div>
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 bg-brand-blue/20 rounded-2xl border border-brand-blue/30 flex items-center justify-center text-brand-blue shadow-lg shadow-brand-blue/10">
            <Dumbbell size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-lg text-white tracking-wide leading-none">
              AeroGym <span className="text-brand-blue text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20">v{APP_VERSION}</span>
            </h1>
            <p className="text-[10px] text-slate-300 font-semibold mt-1 truncate" title={APP_EDITION}>{APP_EDITION}</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Desarrollado por {APP_AUTHOR}</p>
          </div>
        </div>

        {/* Guest Indicator Banner */}
        {isGuest && (
          <div className="mb-6 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-xs">
            <WifiOff size={14} className="shrink-0" />
            <span className="font-medium">Modo Invitado / Local</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200',
                  isActive
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/25 translate-x-1'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-slate-300">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{profile?.name || 'Usuario'}</p>
            <p className="text-[11px] text-slate-400 capitalize truncate">{profile?.level || 'Atleta'}</p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
