/**
 * CategoryFilter Component
 * Horizontal scrollable category filter with icons
 * Uses vintage color palette
 */

import React from 'react';
import { motion } from 'framer-motion';
import { VIDEO_CATEGORIES } from '../../services/videoService';

// Vintage color palette
const colors = {
  cream: '#F5F1E8',
  gold: '#644A07',
  goldLight: '#8B6914',
  white: '#FFFEF7',
  border: '#D4C5A9',
  dark: '#2C2416',
  muted: '#6B5D4F',
  accent1: '#FFE5B4',
  accent2: '#E6D5B8',
  accent3: '#F4E4C1',
  accent4: '#FAF0DC',
};

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onChange }) => {
  return (
    <div className="relative">
      {/* Gradient Fade Effect */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${colors.cream}, transparent)` }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${colors.cream}, transparent)` }}
      />
      
      {/* Scrollable Container */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
        {VIDEO_CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onChange(category.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all"
            style={{
              backgroundColor: selected === category.id ? colors.gold : colors.white,
              color: selected === category.id ? colors.white : colors.dark,
              border: `1px solid ${selected === category.id ? colors.gold : colors.border}`,
              boxShadow: selected === category.id 
                ? `0 4px 12px rgba(100, 74, 7, 0.3)` 
                : `0 2px 4px rgba(100, 74, 7, 0.08)`
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: selected === category.id ? colors.gold : colors.accent1
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
