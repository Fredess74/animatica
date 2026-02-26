import React, { forwardRef } from 'react';
import { Button, ButtonProps } from './Button';
import { Tooltip } from './Tooltip';
import { cn } from './utils';

export interface IconButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth'> {
  icon: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    className,
    icon,
    tooltip,
    tooltipPosition = 'top',
    size = 'icon',
    ...props
  }, ref) => {

    const button = (
      <Button
        ref={ref}
        size={size}
        className={cn("p-0", className)}
        {...props}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} position={tooltipPosition}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';
