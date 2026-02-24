import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, label, options, error, helperText, size = 'md', id, ...props }, ref) => {
    const selectId = id || React.useId();
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={clsx('editor-select-wrapper', wrapperClassName)}>
        {label && (
          <label htmlFor={selectId} className="editor-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'editor-select',
            `editor-select--${size}`,
            {
              'editor-select--error': error,
            },
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
