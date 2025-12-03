import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  bgColor: string;
  iconColor: string;
  popular?: boolean;
}

const categories: Category[] = [
  { id: 'peace', name: 'Peace', icon: 'leaf', count: 45, bgColor: 'bg-green-500', iconColor: '#ffffff', popular: true },
  { id: 'power', name: 'Power', icon: 'flash', count: 38, bgColor: 'bg-[#D4A017]', iconColor: '#ffffff' },
  { id: 'study', name: 'Study', icon: 'book', count: 52, bgColor: 'bg-blue-500', iconColor: '#ffffff' },
  { id: 'devotion', name: 'Devotion', icon: 'heart', count: 67, bgColor: 'bg-red-400', iconColor: '#ffffff', popular: true },
  { id: 'festivals', name: 'Festivals', icon: 'gift', count: 29, bgColor: 'bg-pink-500', iconColor: '#ffffff' },
  { id: 'kids', name: 'Kids', icon: 'happy', count: 34, bgColor: 'bg-cyan-500', iconColor: '#ffffff' },
  { id: 'classic-chandas', name: 'Chandas', icon: 'musical-notes', count: 89, bgColor: 'bg-[#B87333]', iconColor: '#ffffff', popular: true },
  { id: 'vishnu', name: 'Vishnu', icon: 'infinite', count: 1000, bgColor: 'bg-[#4A2E1C]', iconColor: '#ffffff' },
];

// Animated category card
const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="mr-3"
        activeOpacity={0.8}
      >
        <View 
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ 
            width: 110,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Icon Area */}
          <View className={`${category.bgColor} py-4 items-center justify-center`}>
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Ionicons name={category.icon} size={26} color={category.iconColor} />
            </View>
            {category.popular && (
              <View className="absolute top-2 right-2 bg-white/30 px-1.5 py-0.5 rounded-full">
                <Text className="text-white text-[8px] font-bold">HOT</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="p-3 items-center">
            <Text className="text-gray-900 font-semibold text-sm mb-0.5">{category.name}</Text>
            <Text className="text-gray-400 text-xs">{category.count} shlokas</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ExploreCategories() {
  return (
    <View className="py-6 bg-white">
      {/* Section Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-900 text-lg font-bold">Explore Categories</Text>
          <Text className="text-gray-500 text-sm">Discover shlokas by theme</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#D4A017] text-sm font-semibold mr-1">See All</Text>
          <Ionicons name="chevron-forward" size={14} color="#D4A017" />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </ScrollView>

      {/* Quick Collections */}
      <View className="px-5 mt-4">
        <View className="bg-gray-50 rounded-xl p-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bookmark" size={16} color="#B87333" />
            <Text className="text-gray-900 font-semibold text-sm ml-2">Quick Collections</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Morning', 'Evening', 'Study', 'Meditation', 'Sleep'].map((tag, idx) => (
              <TouchableOpacity 
                key={idx} 
                className="bg-white rounded-full px-4 py-2 mr-2 border border-gray-100"
              >
                <Text className="text-gray-700 text-xs font-medium">{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
