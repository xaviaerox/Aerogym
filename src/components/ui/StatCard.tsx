import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </span>
        {icon && <div className="p-2 rounded-xl bg-white/5 text-slate-300">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-xl font-black text-slate-100 tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  );
}
