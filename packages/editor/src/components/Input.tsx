import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, label, error, helperText, icon, size = 'md', id, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={clsx('editor-input-wrapper', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="editor-label">
            {label}
          </label>
        )}
        <div className="editor-input-container">
          {icon && (
            <div className="editor-input-icon">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'editor-input',
              `editor-input--${size}`,
              {
                'editor-input--error': error,
                'editor-input--has-icon': icon,
              },
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={errorId} className="editor-error-msg" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-xs text-[var(--text-muted)] mt-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
