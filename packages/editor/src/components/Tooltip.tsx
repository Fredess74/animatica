import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, position = 'top', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('editor-tooltip-trigger', className)}
        {...props}
      >
        {children}
        <div
          className={clsx(
            'editor-tooltip-content',
            `editor-tooltip--${position}`
          )}
          role="tooltip"
        >
          {content}
        </div>
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';
