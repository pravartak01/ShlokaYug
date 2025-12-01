/**
 * Input Component
 * Reusable styled input component with icon support
 */

import React, { type InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  rightIcon,
  onRightIconClick,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-4">
      <label className="block text-ancient-800 font-semibold mb-2 text-sm">
        {label}
      </label>
      <div className="relative">
        <motion.div
          className={`
            flex items-center bg-white border rounded-xl px-4 py-3
            transition-all duration-300
            ${error ? 'border-red-400 ring-1 ring-red-200' : isFocused ? 'border-saffron-400 ring-2 ring-saffron-100' : 'border-ancient-200 hover:border-ancient-300'}
            ${className}
          `}
          animate={{
            boxShadow: isFocused
              ? '0 4px 20px rgba(249, 115, 22, 0.15)'
              : '0 2px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          {icon && (
            <span
              className={`mr-3 transition-colors duration-300 ${
                error ? 'text-red-400' : isFocused ? 'text-saffron-500' : 'text-ancient-400'
              }`}
            >
              {icon}
            </span>
          )}
          <input
            className={`
              flex-1 bg-transparent outline-none text-ancient-800 placeholder-ancient-400
              text-base font-elegant
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="ml-3 text-ancient-400 hover:text-ancient-600 transition-colors duration-300"
            >
              {rightIcon}
            </button>
          )}
        </motion.div>
      </div>
      {error && (
        <motion.p
          className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
