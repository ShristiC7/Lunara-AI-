import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary px-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-premium border-2 bg-white
          transition-all duration-200 outline-none
          ${error 
            ? 'border-peach focus:border-peach' 
            : 'border-border-premium focus:border-accent-pink'
          }
          placeholder:text-text-secondary/50
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-accent-pink px-1 mt-0.5 font-medium">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-secondary px-1 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
};
