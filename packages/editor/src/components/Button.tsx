import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'editor-btn',
          `editor-btn--${variant}`,
          `editor-btn--${size}`,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: 'var(--space-xs)', height: '1em', width: '1em' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </svg>
        )}
        {!isLoading && leftIcon && <span style={{ marginRight: 'var(--space-xs)', display: 'flex' }}>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span style={{ marginLeft: 'var(--space-xs)', display: 'flex' }}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, variant = 'ghost', size = 'md', tooltip, tooltipPosition = 'top', ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        className={clsx(
          'editor-btn',
          'editor-icon-btn',
          `editor-btn--${variant}`,
          `editor-icon-btn--${size}`,
          className
        )}
        aria-label={props['aria-label'] || (typeof tooltip === 'string' ? tooltip : undefined)}
        {...props}
      >
        {icon}
      </button>
    );

    if (tooltip) {
       return (
         <div className="editor-tooltip-trigger">
           {button}
           <div className={clsx('editor-tooltip-content', `editor-tooltip--${tooltipPosition}`)}>
             {tooltip}
           </div>
         </div>
       );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';
