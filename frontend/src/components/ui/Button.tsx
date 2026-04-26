import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
<<<<<<< HEAD
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
=======
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
>>>>>>> frontend-riya
  size?: 'sm' | 'md' | 'lg' | 'pill';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}) => {
  const variants = {
<<<<<<< HEAD
    primary: 'bg-lunara-core text-white hover:bg-lunara-glow shadow-sm',
    secondary: 'bg-lunara-mist text-lunara-core hover:bg-lunara-core/10',
    outline: 'bg-transparent border border-border-emphasis text-lunara-core hover:bg-lunara-mist',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-premium-sm',
    md: 'px-6 py-3 text-sm font-semibold rounded-premium-md',
    lg: 'px-8 py-4 text-base font-bold rounded-premium-lg',
    pill: 'px-8 py-3 text-sm font-bold rounded-premium-2xl',
=======
    primary: 'bg-lunara-core text-white hover:bg-lunara-glow shadow-md shadow-lunara-core/10',
    premium: 'bg-gradient-to-r from-lunara-core to-lunara-glow text-white shadow-lg shadow-lunara-core/20 hover:brightness-105 active:brightness-95',
    secondary: 'bg-lunara-mist text-lunara-core hover:bg-lunara-bloom/10 border border-lunara-core/5',
    outline: 'bg-transparent border border-border-emphasis text-lunara-core hover:bg-lunara-mist',
    ghost: 'bg-transparent text-slate-500 hover:bg-surface-hover hover:text-slate-900',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold rounded-xl',
    md: 'px-6 py-3 text-sm font-bold rounded-2xl',
    lg: 'px-10 py-4.5 text-base font-bold rounded-[20px]',
    pill: 'px-10 py-3.5 text-sm font-bold rounded-full',
>>>>>>> frontend-riya
  };

  return (
    <button
      className={cn(
<<<<<<< HEAD
        'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-lunara-core/20 focus:ring-offset-2',
=======
        'inline-flex items-center justify-center gap-2.5 font-heading tracking-tight transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-4 focus:ring-lunara-core/10',
>>>>>>> frontend-riya
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
<<<<<<< HEAD
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
=======
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
>>>>>>> frontend-riya
      ) : null}
      {children}
    </button>
  );
};
