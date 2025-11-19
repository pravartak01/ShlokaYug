import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MoodFilter {
  id: string;
  label: string;
  icon: string;
  description: string;
  isActive?: boolean;
}

const moodFilters: MoodFilter[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: 'sunny',
    description: 'Start your day right'
  },
  {
    id: 'meditation',
    label: 'Meditation',
    icon: 'moon-outline',
    description: 'Deep inner peace'
  },
  {
    id: 'calm',
    label: 'Calm',
    icon: 'water',
    description: 'Soothing mantras'
  },
  {
    id: 'study',
    label: 'Study',
    icon: 'book-outline',
    description: 'Focus & clarity'
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: 'flash',
    description: 'Boost vitality'
  },
  {
    id: 'devotional',
    label: 'Devotional',
    icon: 'heart',
    description: 'Spiritual connection'
  },
  {
    id: 'festivals',
    label: 'Festivals',
    icon: 'gift',
    description: 'Special occasions',
    isActive: true // Show only when there's an active festival
  }
];

export default function MoodFilters() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Filter to show only active filters (festivals only when active)
  const activeFilters = moodFilters.filter(filter => {
    if (filter.id === 'festivals') {
      // Check if there's an active festival - this could be dynamic
      const isFestivalActive = false; // Would be calculated from festival detection
      return isFestivalActive || filter.isActive;
    }
    return true;
  });

  return (
    <View className="mt-6 mb-4">
      {/* Section Header */}
      <View className="px-6 mb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-ancient-800 text-lg font-bold">Quick Explore</Text>
            <Text className="text-ancient-600 text-xs mt-0.5">
              Find shlokas by mood
            </Text>
          </View>
          {selectedMood && (
            <TouchableOpacity 
              onPress={() => setSelectedMood(null)}
              className="bg-ancient-100 px-3 py-1.5 rounded-full"
            >
              <Text className="text-ancient-700 text-xs font-medium">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mood Filters Horizontal Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row px-6"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {activeFilters.map((filter) => {
          const isSelected = selectedMood === filter.id;
          const isFestival = filter.id === 'festivals';

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedMood(isSelected ? null : filter.id)}
              className="mr-3"
              activeOpacity={0.7}
            >
              <View
                className={`
                  rounded-2xl overflow-hidden border-2
                  ${isSelected 
                    ? 'border-saffron-500 bg-saffron-500' 
                    : 'border-ancient-200 bg-white'
                  }
                  ${isFestival && !isSelected ? 'border-saffron-300' : ''}
                `}
                style={{ width: 110 }}
              >
                <View className="p-4">
                  {/* Icon */}
                  <View className={`
                    w-12 h-12 rounded-full items-center justify-center mb-2
                    ${isSelected ? 'bg-white/20' : 'bg-saffron-50'}
                  `}>
                    <Ionicons 
                      name={filter.icon as any} 
                      size={24} 
                      color={isSelected ? '#ffffff' : '#f97316'}
                    />
                  </View>

                  {/* Label */}
                  <Text className={`
                    font-bold text-sm mb-1
                    ${isSelected ? 'text-white' : 'text-ancient-800'}
                  `}>
                    {filter.label}
                  </Text>

                  {/* Description */}
                  <Text className={`
                    text-xs
                    ${isSelected ? 'text-white/90' : 'text-ancient-600'}
                  `} numberOfLines={2}>
                    {filter.description}
                  </Text>

                  {/* Active Badge for Festivals */}
                  {isFestival && (
                    <View className={`
                      mt-2 px-2 py-0.5 rounded-full self-start
                      ${isSelected ? 'bg-white/20' : 'bg-saffron-100'}
                    `}>
                      <Text className={`
                        text-xs font-bold
                        ${isSelected ? 'text-white' : 'text-saffron-700'}
                      `}>
                        Active
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Mood Results Preview */}
      {selectedMood && (
        <View className="px-6 mt-4">
          <View className="bg-saffron-50 rounded-xl border border-saffron-200 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-saffron-800 font-bold text-sm mb-1">
                  {activeFilters.find(f => f.id === selectedMood)?.label} Shlokas
                </Text>
                <Text className="text-saffron-700 text-xs">
                  Showing 24 curated shlokas for this mood
                </Text>
              </View>
              <TouchableOpacity className="bg-saffron-500 px-4 py-2 rounded-full">
                <View className="flex-row items-center">
                  <Text className="text-white text-xs font-bold">Explore</Text>
                  <Ionicons name="arrow-forward" size={12} color="white" className="ml-1" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
