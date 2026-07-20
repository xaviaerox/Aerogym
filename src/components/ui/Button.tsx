import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-brand-blue text-slate-950 hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 rounded-xl',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/10 rounded-xl',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-xl',
      ghost: 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl',
      glass: 'glass text-slate-200 hover:bg-white/10 border border-white/10 rounded-2xl',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
      md: 'px-4 py-2.5 text-xs gap-2 min-h-[44px]',
      lg: 'px-6 py-3.5 text-sm gap-2.5 min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
