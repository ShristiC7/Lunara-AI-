import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'sunken' | 'elevated' | 'tinted';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'default', 
  noPadding = false,
  ...props 
}) => {
  const variants = {
    default: 'bg-white border border-border-default shadow-sm',
    sunken: 'bg-surface-sunken border border-transparent shadow-none',
    elevated: 'bg-white border border-border-default shadow-md',
    tinted: 'bg-phase-muted border border-phase-color/10 shadow-none',
    premium: 'premium-card soft-glow',
  };

  return (
    <div
      className={cn(
        'rounded-premium-lg transition-all duration-300',
        variants[variant],
        !noPadding && 'p-5 md:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
