import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

    // Variant styles
    const variants = {
      primary: 'bg-[var(--green-600)] text-white hover:bg-[var(--green-500)] active:bg-[var(--green-700)] shadow-sm',
      secondary: 'bg-[var(--green-900)] text-[var(--green-200)] hover:bg-[var(--green-800)] shadow-sm',
      ghost: 'bg-transparent text-[var(--green-600)] hover:bg-[color-mix(in_srgb,var(--green-600)_10%,transparent)] hover:text-[var(--green-500)]',
      destructive: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-muted)] shadow-sm',
      outline: 'bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--green-600)]',
    };

    // Size styles
    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-lg',
      md: 'h-10 px-4 py-2 text-sm rounded-xl',
      lg: 'h-12 px-8 text-base rounded-xl',
      icon: 'h-10 w-10 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, cn };
