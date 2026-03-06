import React from 'react';

/**
 * Input Component
 * Reusable form input with consistent styling
 * Architecture: Wrapper component ensures consistency across forms
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            className={`
              w-full px-4 py-2 border rounded-lg
              text-gray-900 placeholder-gray-400
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
              ${props.trailing ? 'pr-10' : ''}
              ${className || ''}
            `}
            {...props}
          />

          {props.trailing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {props.trailing}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
