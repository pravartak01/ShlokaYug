import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ancient' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-white border border-ancient-200 shadow-lg',
    ancient: 'bg-gradient-to-br from-ancient-50 to-sandalwood-50 border border-ancient-200 shadow-xl',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-xl'
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-300',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-ancient-100', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-t border-ancient-100', className)}>
      {children}
    </div>
  );
};