/**
 * Button Component
 * Reusable styled button component with loading state
 */

import React, { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 transform
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-saffron-500 to-saffron-600
      hover:from-saffron-600 hover:to-saffron-700
      text-white shadow-lg shadow-saffron-500/30
      hover:shadow-xl hover:shadow-saffron-500/40
      focus:ring-saffron-400
      active:scale-[0.98]
    `,
    secondary: `
      bg-gradient-to-r from-ancient-600 to-ancient-700
      hover:from-ancient-700 hover:to-ancient-800
      text-white shadow-lg shadow-ancient-500/30
      hover:shadow-xl hover:shadow-ancient-500/40
      focus:ring-ancient-400
      active:scale-[0.98]
    `,
    outline: `
      bg-transparent border-2 border-ancient-300
      text-ancient-700 hover:bg-ancient-50
      hover:border-ancient-400
      focus:ring-ancient-300
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-ancient-600
      hover:bg-ancient-100 hover:text-ancient-800
      focus:ring-ancient-200
      active:scale-[0.98]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
