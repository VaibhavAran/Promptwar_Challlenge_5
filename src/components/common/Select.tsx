import React from 'react';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder,
  error,
  helperText,
  required,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          {label} {required && <span className="text-coral-500">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-xs text-charcoal-400">{helperText}</span>
        )}
      </div>
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-ivory-50 text-charcoal-900 border appearance-none transition-colors duration-150 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-sand-300 hover:border-sand-400 focus:border-coral-500 focus:ring-coral-500/20'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};
