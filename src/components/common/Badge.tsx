import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'coral' | 'charcoal' | 'sand' | 'neutral' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sand',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    coral: 'bg-coral-100 text-coral-800 border border-coral-200',
    charcoal: 'bg-charcoal-800 text-ivory-50 border border-charcoal-700',
    sand: 'bg-sand-100 text-charcoal-700 border border-sand-300',
    neutral: 'bg-white text-charcoal-600 border border-sand-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
