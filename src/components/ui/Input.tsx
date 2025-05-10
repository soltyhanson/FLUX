import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-error-500 focus:ring-error-500' : 'border-neutral-300 focus:ring-primary-500';
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-3 py-2 bg-white border ${errorClass} rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:bg-neutral-100 ${widthClass} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;