import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-500 tracking-tight uppercase px-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-surface-sunken border border-transparent rounded-premium-md px-4 py-3 text-sm transition-all duration-200 outline-none focus:border-lunara-core/30 focus:bg-white placeholder:text-slate-400',
          error && 'border-phase-menstrual/50 focus:border-phase-menstrual/50',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-phase-menstrual px-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
