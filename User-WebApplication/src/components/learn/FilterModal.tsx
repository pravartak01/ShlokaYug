/**
 * FilterModal Component
 * Modal for course filtering options
 */

import React, { useState } from 'react';
import type { CourseFilters } from '../../services/courseService';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  initialFilters: CourseFilters;
  onApply: (filters: CourseFilters) => void;
}

const CATEGORIES = [
  { id: 'vedic_chanting', label: 'Vedic Chanting' },
  { id: 'sanskrit_grammar', label: 'Sanskrit Grammar' },
  { id: 'mantra_meditation', label: 'Mantra & Meditation' },
  { id: 'yoga_sutras', label: 'Yoga Sutras' },
  { id: 'bhagavad_gita', label: 'Bhagavad Gita' },
  { id: 'upanishads', label: 'Upanishads' },
  { id: 'ayurveda', label: 'Ayurveda' },
  { id: 'jyotish', label: 'Jyotish (Astrology)' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: '#10b981' },
  { id: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
  { id: 'advanced', label: 'Advanced', color: '#ef4444' },
];

const PRICE_TYPES = [
  { id: 'all', label: 'All Courses' },
  { id: 'free', label: 'Free Only' },
  { id: 'paid', label: 'Paid Only' },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, initialFilters, onApply }) => {
  const [localFilters, setLocalFilters] = useState<CourseFilters>(initialFilters);

  const toggleCategory = (categoryId: string) => {
    const current = localFilters.category || [];
    const updated = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    setLocalFilters({ ...localFilters, category: updated });
  };

  const toggleDifficulty = (difficultyId: string) => {
    const current = localFilters.difficulty || [];
    const updated = current.includes(difficultyId)
      ? current.filter((d) => d !== difficultyId)
      : [...current, difficultyId];
    setLocalFilters({ ...localFilters, difficulty: updated });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: CourseFilters = {
      category: [],
      difficulty: [],
      priceType: 'all',
      sort: 'popular',
    };
    setLocalFilters(resetFilters);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4C5A9]">
          <h2 className="text-[#2C2416] text-2xl font-bold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F1E8] transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-6 h-6 text-[#6B5D4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-[#2C2416] font-bold text-lg mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    localFilters.category?.includes(category.id)
                      ? 'bg-[#8B0000] border-[#8B0000] text-white'
                      : 'bg-white border-[#D4C5A9] text-[#2C2416] hover:border-[#8B0000]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-[#2C2416] font-bold text-lg mb-3">Difficulty Level</h3>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => toggleDifficulty(difficulty.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-semibold`}
                  style={{
                    backgroundColor: localFilters.difficulty?.includes(difficulty.id) ? difficulty.color : 'white',
                    borderColor: difficulty.color,
                    color: localFilters.difficulty?.includes(difficulty.id) ? 'white' : difficulty.color,
                  }}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Type */}
          <div>
            <h3 className="text-[#2C2416] font-bold text-lg mb-3">Price</h3>
            <div className="space-y-2">
              {PRICE_TYPES.map((priceType) => (
                <button
                  key={priceType.id}
                  onClick={() => setLocalFilters({ ...localFilters, priceType: priceType.id as CourseFilters['priceType'] })}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    localFilters.priceType === priceType.id
                      ? 'bg-[#F9F5ED] border-[#8B0000]'
                      : 'bg-white border-[#D4C5A9] hover:border-[#8B0000]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-base ${
                        localFilters.priceType === priceType.id ? 'text-[#8B0000] font-semibold' : 'text-[#2C2416]'
                      }`}
                    >
                      {priceType.label}
                    </span>
                    {localFilters.priceType === priceType.id && (
                      <svg className="w-5 h-5 text-[#8B0000]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-[#2C2416] font-bold text-lg mb-3">Sort By</h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((sortOption) => (
                <button
                  key={sortOption.id}
                  onClick={() => setLocalFilters({ ...localFilters, sort: sortOption.id as CourseFilters['sort'] })}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    localFilters.sort === sortOption.id
                      ? 'bg-[#F9F5ED] border-[#8B0000]'
                      : 'bg-white border-[#D4C5A9] hover:border-[#8B0000]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-base ${
                        localFilters.sort === sortOption.id ? 'text-[#8B0000] font-semibold' : 'text-[#2C2416]'
                      }`}
                    >
                      {sortOption.label}
                    </span>
                    {localFilters.sort === sortOption.id && (
                      <svg className="w-5 h-5 text-[#8B0000]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-[#F9F5ED] border-t border-[#D4C5A9]">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-white border-2 border-[#D4C5A9] text-[#2C2416] p-4 rounded-xl font-semibold hover:bg-[#F5F1E8] transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-[#8B0000] text-white p-4 rounded-xl font-semibold hover:bg-[#6B0000] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
