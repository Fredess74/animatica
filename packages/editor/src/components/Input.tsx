import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    startIcon,
    endIcon,
    fullWidth = true,
    containerClassName,
    disabled,
    ...props
  }, ref) => {

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", containerClassName)}>
        {label && (
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-deep)] px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]",
              startIcon && "pl-9",
              endIcon && "pr-9",
              error && "border-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
              className
            )}
            disabled={disabled}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 text-[var(--text-muted)] pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[10px] font-medium text-[var(--color-error)] mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
