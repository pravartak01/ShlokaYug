import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-ancient-700 mb-2 font-elegant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-ancient-400">{leftIcon}</div>
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-lg border-2 transition-colors duration-200',
              'bg-ancient-50/50 backdrop-blur-sm',
              'placeholder-ancient-400 text-ancient-900',
              'focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-ancient-200 hover:border-ancient-300',
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              'py-3 text-base font-medium',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="text-ancient-400">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-ancient-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';