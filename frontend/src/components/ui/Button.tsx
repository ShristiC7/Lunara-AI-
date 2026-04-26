import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-lunara-core/20 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
