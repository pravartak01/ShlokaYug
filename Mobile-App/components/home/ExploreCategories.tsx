import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: [string, string];
  description: string;
  popular?: boolean;
}

const categories: Category[] = [
  {
    id: 'peace',
    name: 'Peace',
    icon: 'leaf',
    count: 45,
    gradient: ['#f97316', '#ea580c'],
    description: 'Calming mantras',
    popular: true
  },
  {
    id: 'power',
    name: 'Power',
    icon: 'flash',
    count: 38,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Energizing chants'
  },
  {
    id: 'study',
    name: 'Study',
    icon: 'book',
    count: 52,
    gradient: ['#f97316', '#ea580c'],
    description: 'Focus & clarity'
  },
  {
    id: 'devotion',
    name: 'Devotion',
    icon: 'heart',
    count: 67,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Spiritual connection',
    popular: true
  },
  {
    id: 'festivals',
    name: 'Festivals',
    icon: 'gift',
    count: 29,
    gradient: ['#f97316', '#ea580c'],
    description: 'Special occasions'
  },
  {
    id: 'kids',
    name: 'Kids',
    icon: 'happy',
    count: 34,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Child-friendly'
  },
  {
    id: 'classic-chandas',
    name: 'Classic Chandas',
    icon: 'musical-notes',
    count: 89,
    gradient: ['#f97316', '#ea580c'],
    description: 'Traditional meters',
    popular: true
  },
  {
    id: 'guru-stotram',
    name: 'Guru Stotram',
    icon: 'person',
    count: 23,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Teacher reverence'
  },
  {
    id: 'vishnu-sahasranama',
    name: 'Vishnu Sahasranama',
    icon: 'infinite',
    count: 1000,
    gradient: ['#f97316', '#ea580c'],
    description: '1000 names'
  },
  {
    id: 'hanuman-chalisa',
    name: 'Hanuman',
    icon: 'fitness',
    count: 42,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Strength & devotion'
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi',
    icon: 'flower',
    count: 31,
    gradient: ['#f97316', '#ea580c'],
    description: 'Prosperity mantras'
  },
  {
    id: 'durga',
    name: 'Durga',
    icon: 'shield',
    count: 36,
    gradient: ['#ea580c', '#c2410c'],
    description: 'Divine power'
  }
];

export default function ExploreCategories() {
  return (
    <View className="px-6 mt-8 mb-6">
      {/* Section Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-ancient-800 text-xl font-bold">Explore Categories</Text>
            <Text className="text-ancient-600 text-sm mt-1">
              Discover shlokas by theme and tradition
            </Text>
          </View>
          <TouchableOpacity className="bg-ancient-100 px-3 py-2 rounded-full">
            <View className="flex-row items-center">
              <Text className="text-ancient-700 font-semibold text-xs">All</Text>
              <Ionicons name="chevron-forward" size={12} color="#996f0a" className="ml-1" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Grid */}
      <View className="flex-row flex-wrap justify-between">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            className="w-[48%] mb-4"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={category.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl overflow-hidden"
            >
              <View className="p-4">
                {/* Header with Icon and Badge */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="bg-white/20 w-12 h-12 rounded-xl items-center justify-center">
                    <Ionicons name={category.icon as any} size={24} color="white" />
                  </View>
                  
                  {category.popular && (
                    <View className="bg-white/30 px-2 py-0.5 rounded-full">
                      <Text className="text-white text-xs font-bold">Popular</Text>
                    </View>
                  )}
                </View>

                {/* Category Name */}
                <Text className="text-white font-bold text-base mb-1">
                  {category.name}
                </Text>

                {/* Description */}
                <Text className="text-white/90 text-xs mb-3">
                  {category.description}
                </Text>

                {/* Count and Arrow */}
                <View className="flex-row items-center justify-between">
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">
                      {category.count} {category.count === 1000 ? 'verses' : 'shlokas'}
                    </Text>
                  </View>
                  <View className="bg-white/20 w-7 h-7 rounded-full items-center justify-center">
                    <Ionicons name="arrow-forward" size={14} color="white" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Collections */}
      <View className="mt-2 bg-ancient-50 rounded-xl border border-ancient-200 p-4">
        <View className="flex-row items-center mb-3">
          <View className="bg-saffron-100 p-2 rounded-full mr-3">
            <Ionicons name="star" size={16} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-ancient-800 font-bold text-sm">Featured Collections</Text>
            <Text className="text-ancient-600 text-xs mt-0.5">
              Curated playlists for different occasions
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap">
          {['Morning Routine', 'Evening Peace', 'Study Focus', 'Meditation'].map((collection, idx) => (
            <View key={idx} className="bg-white rounded-lg border border-ancient-200 px-3 py-2 mr-2 mb-2">
              <Text className="text-ancient-700 text-xs font-medium">{collection}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
