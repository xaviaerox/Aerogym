import React from 'react';
import { Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import XPProgressBar from './XPProgressBar';
import type { UserXPResult } from '../../hooks/useUserXP';

interface DashboardHeaderProps {
  userName?: string;
  userXP: UserXPResult;
  onOpenSettings: () => void;
}

export default function DashboardHeader({
  userName,
  userXP,
  onOpenSettings,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="text-3xl font-bold text-slate-50 mt-1">
            Hola, {userName?.split(' ')[0] || 'atleta'}
          </h1>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Configuración de widgets del dashboard"
          className="p-3 glass rounded-2xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Bar de Progreso de Experiencia (XP) */}
      <XPProgressBar userXP={userXP} />
    </div>
  );
}
