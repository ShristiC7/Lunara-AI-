import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'peach' | 'lavender';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  variant = 'default'
}) => {
  const variants = {
    default: "bg-white border-border-premium",
    peach: "bg-peach border-[#FED7AA]",
    lavender: "bg-lavender border-[#E9D5FF]"
  };

  return (
    <div className={`
      rounded-premium border-2 p-6 shadow-subtle
      ${variants[variant]}
      ${className}
    `}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
