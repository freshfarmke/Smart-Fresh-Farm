import React from 'react';

/**
 * Button Component
 * Reusable button with variants for different use cases
 * Architecture: Variant pattern for flexibility without over-engineering
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      isLoading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    // Size variants for padding and text
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Color variants
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-opacity-90 transition-all duration-200',
      secondary: 'bg-secondary text-white hover:bg-opacity-90 transition-all duration-200',
      outline: 'border-2 border-primary text-primary hover:bg-accent transition-all duration-200',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`
          font-medium rounded-lg
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${className || ''}
        `}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
