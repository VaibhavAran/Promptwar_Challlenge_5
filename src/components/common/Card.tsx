import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-sand-200/90 ${
        elevated ? 'shadow-elevated' : 'shadow-card'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
