import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          {label} {required && <span className="text-coral-500">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-xs text-charcoal-400">{helperText}</span>
        )}
      </div>
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-ivory-50 text-charcoal-900 border transition-colors duration-150 placeholder:text-charcoal-400/60 focus:bg-white focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-sand-300 hover:border-sand-400 focus:border-coral-500 focus:ring-coral-500/20'
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};
