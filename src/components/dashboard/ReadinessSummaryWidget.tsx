import React from 'react';
import { Activity, Shield, Zap } from 'lucide-react';
import { Card } from '../ui/Card';

interface ReadinessSummaryWidgetProps {
  score: number;
  label: string;
  recommendation: string;
  onOpenDiagnostic?: () => void;
}

export const ReadinessSummaryWidget: React.FC<ReadinessSummaryWidgetProps> = React.memo(({
  score,
  label,
  recommendation,
  onOpenDiagnostic,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-blue" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Readiness & Recuperación
          </h3>
        </div>
        {onOpenDiagnostic && (
          <button
            onClick={onOpenDiagnostic}
            className="text-xs text-brand-blue hover:underline font-medium flex items-center gap-1"
          >
            <Shield size={12} />
            Diagnóstico
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
            score
          )}`}
        >
          <span className="text-xl font-black leading-none">{score}</span>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">%</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={14} className="text-amber-400 fill-amber-400/20" />
            <span className="text-sm font-bold text-white tracking-tight">{label}</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {recommendation}
          </p>
        </div>
      </div>
    </Card>
  );
});

ReadinessSummaryWidget.displayName = 'ReadinessSummaryWidget';
