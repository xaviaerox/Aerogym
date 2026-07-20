import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  className,
  variant = 'brand',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    brand: 'bg-brand-blue/15 text-brand-blue border-brand-blue/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    neutral: 'bg-white/10 text-slate-300 border-white/10',
  };

  const sizes = {
    sm: 'text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-[11px] px-2.5 py-1 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-solid select-none font-sans',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
