import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-slate-500 pointer-events-none">{leftIcon}</div>}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 disabled:opacity-50',
              leftIcon && 'pl-9',
              error && 'border-red-500/50 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
