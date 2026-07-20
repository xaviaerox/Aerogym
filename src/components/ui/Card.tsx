import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'dark' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  const variants = {
    glass: 'glass rounded-3xl p-5 border border-white/5 shadow-xl',
    dark: 'bg-slate-900/80 rounded-3xl p-5 border border-slate-800 shadow-xl',
    outline: 'bg-transparent rounded-3xl p-5 border border-white/10',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-white/5 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props}>{children}</div>;
}
