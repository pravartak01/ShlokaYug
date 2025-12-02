/**
 * FilterModal Component - Modern Indigo Theme
 * Modal for course filtering options with smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
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
  { id: 'vedic_chanting', label: 'Vedic Chanting', icon: 'musical-notes' },
  { id: 'sanskrit_grammar', label: 'Sanskrit Grammar', icon: 'text' },
  { id: 'mantra_meditation', label: 'Mantra & Meditation', icon: 'flower' },
  { id: 'yoga_sutras', label: 'Yoga Sutras', icon: 'body' },
  { id: 'bhagavad_gita', label: 'Bhagavad Gita', icon: 'book' },
  { id: 'upanishads', label: 'Upanishads', icon: 'library' },
  { id: 'ayurveda', label: 'Ayurveda', icon: 'leaf' },
  { id: 'jyotish', label: 'Jyotish (Astrology)', icon: 'planet' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: '#10b981', bg: '#d1fae5', icon: 'leaf' },
  { id: 'intermediate', label: 'Intermediate', color: '#f59e0b', bg: '#fef3c7', icon: 'trending-up' },
  { id: 'advanced', label: 'Advanced', color: '#ef4444', bg: '#fee2e2', icon: 'flash' },
];

const PRICE_TYPES = [
  { id: 'all', label: 'All Courses', icon: 'grid', desc: 'Show all available courses' },
  { id: 'free', label: 'Free Only', icon: 'gift', desc: 'Courses with no cost' },
  { id: 'paid', label: 'Premium Only', icon: 'diamond', desc: 'Premium paid courses' },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular', icon: 'flame' },
  { id: 'recent', label: 'Recently Added', icon: 'time' },
  { id: 'rating', label: 'Highest Rated', icon: 'star' },
  { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
  { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
];

// Animated Filter Chip
const FilterChip = ({ 
  selected, 
  onPress, 
  label, 
  icon 
}: { 
  selected: boolean; 
  onPress: () => void; 
  label: string;
  icon: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        className={`mr-2 mb-2 px-4 py-2.5 rounded-xl flex-row items-center ${
          selected ? 'bg-indigo-500' : 'bg-white border border-gray-200'
        }`}
        style={{ 
          transform: [{ scale: scaleAnim }],
          shadowColor: selected ? '#6366f1' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.2 : 0.05,
          shadowRadius: 4,
          elevation: selected ? 3 : 1,
        }}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={selected ? '#ffffff' : '#6b7280'} 
        />
        <Text
          className={`text-sm font-semibold ml-1.5 ${
            selected ? 'text-white' : 'text-gray-700'
          }`}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function FilterModal({
  visible,
  onClose,
  initialFilters,
  onApply,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<CourseFilters>(initialFilters);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

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

  const getActiveCount = () => {
    let count = 0;
    if (localFilters.category?.length) count += localFilters.category.length;
    if (localFilters.difficulty?.length) count += localFilters.difficulty.length;
    if (localFilters.priceType && localFilters.priceType !== 'all') count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {/* Header */}
        <View 
          className="flex-row items-center justify-between px-6 py-4 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-3">
              <Ionicons name="options" size={20} color="#6366f1" />
            </View>
            <View>
              <Text className="text-gray-900 text-xl font-bold">Filters</Text>
              {getActiveCount() > 0 && (
                <Text className="text-indigo-500 text-sm">{getActiveCount()} filters active</Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="apps" size={18} color="#6366f1" />
              <Text className="text-gray-900 font-bold text-lg ml-2">Categories</Text>
            </View>
            <View className="flex-row flex-wrap">
              {CATEGORIES.map(category => (
                <FilterChip
                  key={category.id}
                  selected={localFilters.category?.includes(category.id) || false}
                  onPress={() => toggleCategory(category.id)}
                  label={category.label}
                  icon={category.icon}
                />
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="speedometer" size={18} color="#6366f1" />
              <Text className="text-gray-900 font-bold text-lg ml-2">Difficulty Level</Text>
            </View>
            <View className="flex-row">
              {DIFFICULTIES.map(difficulty => (
                <TouchableOpacity
                  key={difficulty.id}
                  onPress={() => toggleDifficulty(difficulty.id)}
                  activeOpacity={0.8}
                  className="flex-1 mr-2"
                >
                  <View
                    className={`p-4 rounded-2xl items-center border-2`}
                    style={{
                      backgroundColor: localFilters.difficulty?.includes(difficulty.id) 
                        ? difficulty.color 
                        : difficulty.bg,
                      borderColor: difficulty.color,
                    }}
                  >
                    <Ionicons 
                      name={difficulty.icon as any} 
                      size={24} 
                      color={localFilters.difficulty?.includes(difficulty.id) ? '#ffffff' : difficulty.color} 
                    />
                    <Text
                      className="text-sm font-bold mt-1"
                      style={{ 
                        color: localFilters.difficulty?.includes(difficulty.id) ? '#ffffff' : difficulty.color 
                      }}
                    >
                      {difficulty.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Type */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="pricetag" size={18} color="#6366f1" />
              <Text className="text-gray-900 font-bold text-lg ml-2">Price</Text>
            </View>
            {PRICE_TYPES.map(priceType => (
              <TouchableOpacity
                key={priceType.id}
                onPress={() => setLocalFilters({ ...localFilters, priceType: priceType.id as any })}
                activeOpacity={0.8}
              >
                <View
                  className={`mb-2 p-4 rounded-2xl flex-row items-center border-2 ${
                    localFilters.priceType === priceType.id
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <View 
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      localFilters.priceType === priceType.id ? 'bg-indigo-500' : 'bg-gray-100'
                    }`}
                  >
                    <Ionicons 
                      name={priceType.icon as any} 
                      size={20} 
                      color={localFilters.priceType === priceType.id ? '#ffffff' : '#6b7280'} 
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text
                      className={`text-base font-semibold ${
                        localFilters.priceType === priceType.id ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {priceType.label}
                    </Text>
                    <Text className="text-gray-500 text-xs">{priceType.desc}</Text>
                  </View>
                  {localFilters.priceType === priceType.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="swap-vertical" size={18} color="#6366f1" />
              <Text className="text-gray-900 font-bold text-lg ml-2">Sort By</Text>
            </View>
            <View className="flex-row flex-wrap">
              {SORT_OPTIONS.map(sortOption => (
                <TouchableOpacity
                  key={sortOption.id}
                  onPress={() => setLocalFilters({ ...localFilters, sort: sortOption.id as any })}
                  activeOpacity={0.8}
                  className="mr-2 mb-2"
                >
                  <View
                    className={`px-4 py-3 rounded-xl flex-row items-center ${
                      localFilters.sort === sortOption.id
                        ? 'bg-indigo-500'
                        : 'bg-white border border-gray-200'
                    }`}
                    style={{
                      shadowColor: localFilters.sort === sortOption.id ? '#6366f1' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: localFilters.sort === sortOption.id ? 0.2 : 0.05,
                      shadowRadius: 4,
                      elevation: localFilters.sort === sortOption.id ? 3 : 1,
                    }}
                  >
                    <Ionicons 
                      name={sortOption.icon as any} 
                      size={16} 
                      color={localFilters.sort === sortOption.id ? '#ffffff' : '#6b7280'} 
                    />
                    <Text
                      className={`text-sm font-semibold ml-1.5 ${
                        localFilters.sort === sortOption.id ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {sortOption.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Spacer for bottom buttons */}
          <View className="h-24" />
        </ScrollView>

        {/* Action Buttons */}
        <View 
          className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#6b7280" />
              <Text className="text-gray-700 font-bold ml-2">Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 bg-indigo-500 py-4 rounded-2xl flex-row items-center justify-center"
              activeOpacity={0.8}
              style={{
                shadowColor: '#6366f1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text className="text-white font-bold ml-2">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
