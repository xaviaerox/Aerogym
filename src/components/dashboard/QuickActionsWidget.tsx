import React from 'react';
import { Play, Dumbbell, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickActionsWidgetProps {
  onStartFreeSession: () => void;
  onOpenRoutineSelector: () => void;
  onOpenHealthLogger: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = React.memo(({
  onStartFreeSession,
  onOpenRoutineSelector,
  onOpenHealthLogger,
}) => {
  return (
    <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Acciones Rápidas
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={onStartFreeSession}
          variant="primary"
          size="sm"
          className="flex flex-col items-center justify-center p-3 h-auto gap-1 text-center"
        >
          <Play size={18} className="fill-current text-slate-900" />
          <span className="text-[11px] font-semibold leading-tight">Sesión Libre</span>
        </Button>
        <Button
          onClick={onOpenRoutineSelector}
          variant="outline"
          size="sm"
          className="flex flex-col items-center justify-center p-3 h-auto gap-1 text-center border-slate-700 text-slate-200"
        >
          <Dumbbell size={18} className="text-brand-blue" />
          <span className="text-[11px] font-semibold leading-tight">Elegir Rutina</span>
        </Button>
        <Button
          onClick={onOpenHealthLogger}
          variant="outline"
          size="sm"
          className="flex flex-col items-center justify-center p-3 h-auto gap-1 text-center border-slate-700 text-slate-200"
        >
          <Plus size={18} className="text-emerald-400" />
          <span className="text-[11px] font-semibold leading-tight">Reg. Salud</span>
        </Button>
      </div>
    </Card>
  );
});

QuickActionsWidget.displayName = 'QuickActionsWidget';
