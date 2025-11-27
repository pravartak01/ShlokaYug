/**
 * FilterModal Component
 * Modal for course filtering options
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CourseFilters } from '../../services/courseService';

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

export default function FilterModal({
  visible,
  onClose,
  initialFilters,
  onApply,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<CourseFilters>(initialFilters);

  const toggleCategory = (categoryId: string) => {
    const current = localFilters.category || [];
    const updated = current.includes(categoryId)
      ? current.filter(c => c !== categoryId)
      : [...current, categoryId];
    setLocalFilters({ ...localFilters, category: updated });
  };

  const toggleDifficulty = (difficultyId: string) => {
    const current = localFilters.difficulty || [];
    const updated = current.includes(difficultyId)
      ? current.filter(d => d !== difficultyId)
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
    onApply(resetFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-ancient-50" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-ancient-200 bg-white">
          <Text className="text-ancient-800 text-xl font-bold">Filters</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#5c4106" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Categories */}
          <View className="mb-6">
            <Text className="text-ancient-800 font-bold text-lg mb-3">
              Categories
            </Text>
            <View className="flex-row flex-wrap">
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border-2 ${
                    localFilters.category?.includes(category.id)
                      ? 'bg-saffron-500 border-saffron-500'
                      : 'bg-white border-ancient-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      localFilters.category?.includes(category.id)
                        ? 'text-white'
                        : 'text-ancient-700'
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View className="mb-6">
            <Text className="text-ancient-800 font-bold text-lg mb-3">
              Difficulty Level
            </Text>
            <View className="flex-row flex-wrap">
              {DIFFICULTIES.map(difficulty => (
                <TouchableOpacity
                  key={difficulty.id}
                  onPress={() => toggleDifficulty(difficulty.id)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border-2`}
                  style={{
                    backgroundColor: localFilters.difficulty?.includes(difficulty.id)
                      ? difficulty.color
                      : 'white',
                    borderColor: difficulty.color,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      localFilters.difficulty?.includes(difficulty.id)
                        ? 'text-white'
                        : ''
                    }`}
                    style={{
                      color: localFilters.difficulty?.includes(difficulty.id)
                        ? 'white'
                        : difficulty.color,
                    }}
                  >
                    {difficulty.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Type */}
          <View className="mb-6">
            <Text className="text-ancient-800 font-bold text-lg mb-3">
              Price
            </Text>
            {PRICE_TYPES.map(priceType => (
              <TouchableOpacity
                key={priceType.id}
                onPress={() => setLocalFilters({ ...localFilters, priceType: priceType.id as any })}
                className={`mb-2 p-4 rounded-xl border-2 ${
                  localFilters.priceType === priceType.id
                    ? 'bg-saffron-50 border-saffron-500'
                    : 'bg-white border-ancient-200'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base ${
                      localFilters.priceType === priceType.id
                        ? 'text-saffron-700 font-semibold'
                        : 'text-ancient-700'
                    }`}
                  >
                    {priceType.label}
                  </Text>
                  {localFilters.priceType === priceType.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <View className="mb-6">
            <Text className="text-ancient-800 font-bold text-lg mb-3">
              Sort By
            </Text>
            {SORT_OPTIONS.map(sortOption => (
              <TouchableOpacity
                key={sortOption.id}
                onPress={() => setLocalFilters({ ...localFilters, sort: sortOption.id as any })}
                className={`mb-2 p-4 rounded-xl border-2 ${
                  localFilters.sort === sortOption.id
                    ? 'bg-saffron-50 border-saffron-500'
                    : 'bg-white border-ancient-200'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base ${
                      localFilters.sort === sortOption.id
                        ? 'text-saffron-700 font-semibold'
                        : 'text-ancient-700'
                    }`}
                  >
                    {sortOption.label}
                  </Text>
                  {localFilters.sort === sortOption.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-6 bg-white border-t border-ancient-200">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 bg-ancient-200 p-4 rounded-xl"
            >
              <Text className="text-ancient-800 text-center font-semibold">
                Reset All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 bg-saffron-500 p-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
