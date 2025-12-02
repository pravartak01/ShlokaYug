/**
 * StatsCard Component
 * Displays statistics in a visually appealing card
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'gold' | 'red' | 'green' | 'blue' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = 'gold'
}) => {
  const colorClasses = {
    gold: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
  };

  const styles = colorClasses[color];

  return (
    <motion.div
      className={`relative ${styles.bg} rounded-2xl p-5 border ${styles.border} shadow-lg overflow-hidden`}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="20" r="40" fill="currentColor" />
        </svg>
      </div>

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-vintage-brown/60 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-bold ${styles.text}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
