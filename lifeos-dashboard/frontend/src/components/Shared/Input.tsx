import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={`
          peer w-full px-0 py-3 bg-transparent border-0 border-b-2
          ${error ? 'border-accent-red' : isFocused ? 'border-accent-blue' : 'border-border'}
          text-text-primary placeholder-transparent focus:outline-none focus:ring-0
          transition-colors duration-200
        `}
        placeholder={label}
      />
      <label
        className={`
          absolute left-0 transition-all duration-200 pointer-events-none
          ${isFocused || props.value ? '-top-5 text-xs' : 'top-3 text-base'}
          ${error ? 'text-accent-red' : isFocused ? 'text-accent-blue' : 'text-text-secondary'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-accent-red">{error}</p>
      )}
    </div>
  );
};
