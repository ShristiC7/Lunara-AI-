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
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase px-1 group-focus-within:text-lunara-core transition-colors">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 outline-none focus:border-lunara-core/10 focus:bg-white focus:ring-4 focus:ring-lunara-core/5 placeholder:text-slate-300 text-slate-700',
          error && 'border-phase-menstrual/20 bg-phase-menstrual/5 focus:border-phase-menstrual/30',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-bold text-phase-menstrual px-1 mt-1.5 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
