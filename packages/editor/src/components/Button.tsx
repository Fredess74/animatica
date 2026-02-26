import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {

    const baseStyles = 'editor-btn inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] disabled:pointer-events-none disabled:opacity-50';

    // Using explicit styles that map to design tokens where possible, or fallback to similar Tailwind utilities
    const variants = {
      primary: 'bg-[var(--green-600)] text-white hover:bg-[var(--green-500)] shadow-sm hover:shadow-[var(--shadow-glow)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
      danger: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-muted)]',
      outline: 'border border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
    };

    const sizes = {
      sm: 'h-7 px-2 text-xs gap-1',
      md: 'h-9 px-4 py-2 text-sm gap-2',
      lg: 'h-11 px-8 text-base gap-3',
      icon: 'h-9 w-9 p-0'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        {!isLoading && startIcon && <span className="mr-1">{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="ml-1">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
