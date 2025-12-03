import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TrendingShloka {
  id: string;
  title: string;
  chandas: string;
  audioLength: string;
  plays: number;
  likes: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const trendingShlokas: TrendingShloka[] = [
  {
    id: '1',
    title: 'Gayatri Mantra',
    chandas: 'Gayatri',
    audioLength: '2:30',
    plays: 15420,
    likes: 2340,
    icon: 'sunny',
    iconBg: 'bg-[#D4A017]', // Gold for Gayatri
    iconColor: '#ffffff',
    difficulty: 'intermediate',
    tags: ['Morning', 'Energy', 'Sacred']
  },
  {
    id: '2',
    title: 'Maha Mrityunjaya Mantra',
    chandas: 'Anushtubh',
    audioLength: '3:45',
    plays: 12890,
    likes: 1987,
    icon: 'shield-checkmark',
    iconBg: 'bg-[#B87333]', // Copper for healing power
    iconColor: '#ffffff',
    difficulty: 'advanced',
    tags: ['Healing', 'Devotional', 'Power']
  },
  {
    id: '3',
    title: 'Shanti Mantra',
    chandas: 'Anushtubh',
    audioLength: '1:50',
    plays: 11245,
    likes: 1765,
    icon: 'infinite',
    iconBg: 'bg-[#4A2E1C]',
    iconColor: '#ffffff',
    difficulty: 'beginner',
    tags: ['Peace', 'Meditation', 'Calm']
  },
  {
    id: '4',
    title: 'Guru Brahma',
    chandas: 'Shloka',
    audioLength: '2:15',
    plays: 9876,
    likes: 1543,
    icon: 'school',
    iconBg: 'bg-teal-500',
    iconColor: '#ffffff',
    difficulty: 'intermediate',
    tags: ['Devotional', 'Gratitude']
  },
  {
    id: '5',
    title: 'Hanuman Chalisa (Excerpt)',
    chandas: 'Chaupai',
    audioLength: '4:20',
    plays: 8765,
    likes: 1432,
    icon: 'flash',
    iconBg: 'bg-[#DD7A1F]', // Saffron for power
    iconColor: '#ffffff',
    difficulty: 'intermediate',
    tags: ['Power', 'Devotional', 'Energy']
  }
];

// Animated card component
const TrendingCard = ({ shloka, index }: { shloka: TrendingShloka; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { bg: 'bg-green-50', text: 'text-green-700' };
      case 'intermediate': return { bg: 'bg-[#F9F0E6]', text: 'text-[#B87333]' };
      case 'advanced': return { bg: 'bg-red-50', text: 'text-red-700' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  const diffColors = getDifficultyColor(shloka.difficulty);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="mr-4"
        style={{ width: 260 }}
        activeOpacity={0.8}
      >
        <View 
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Header with Icon */}
          <View className="bg-gray-50 px-4 py-5 items-center">
            <View className="flex-row items-center justify-between w-full mb-3">
              <View className="bg-white px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="trending-up" size={12} color="#ef4444" />
                <Text className="text-gray-700 font-bold text-xs ml-1">#{index + 1}</Text>
              </View>
              <View className="bg-white px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="headset-outline" size={12} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">{shloka.audioLength}</Text>
              </View>
            </View>
            <View className={`w-16 h-16 ${shloka.iconBg} rounded-2xl items-center justify-center`}>
              <Ionicons name={shloka.icon} size={32} color={shloka.iconColor} />
            </View>
          </View>

          {/* Content */}
          <View className="p-4">
            {/* Title */}
            <Text className="text-gray-900 font-bold text-base mb-2">
              {shloka.title}
            </Text>

            {/* Badges Row */}
            <View className="flex-row items-center mb-3">
              <View className="bg-[#F9F0E6] px-2.5 py-1 rounded-full flex-row items-center mr-2">
                <Ionicons name="musical-note" size={10} color="#B87333" />
                <Text className="text-[#B87333] text-xs font-medium ml-1">
                  {shloka.chandas}
                </Text>
              </View>
              <View className={`${diffColors.bg} px-2.5 py-1 rounded-full`}>
                <Text className={`${diffColors.text} text-xs font-medium capitalize`}>
                  {shloka.difficulty}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View className="flex-row flex-wrap mb-3">
              {shloka.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} className="bg-gray-50 px-2 py-0.5 rounded mr-1 mb-1">
                  <Text className="text-gray-500 text-xs">{tag}</Text>
                </View>
              ))}
            </View>

            {/* Stats Row */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <Ionicons name="play-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1">{formatNumber(shloka.plays)}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="heart-outline" size={14} color="#ef4444" />
                  <Text className="text-gray-500 text-xs ml-1">{formatNumber(shloka.likes)}</Text>
                </View>
              </View>
              
              <TouchableOpacity className="bg-[#D4A017] w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="play" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TrendingShlokas() {
  return (
    <View className="py-6 bg-gray-50">
      {/* Section Header */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-lg font-bold">Trending Now</Text>
            <Text className="text-gray-500 text-sm">Most popular this week</Text>
          </View>
          <TouchableOpacity className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full">
            <Ionicons name="flame" size={14} color="#ef4444" />
            <Text className="text-red-600 font-semibold text-xs ml-1">Hot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trending Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {trendingShlokas.map((shloka, index) => (
          <TrendingCard key={shloka.id} shloka={shloka} index={index} />
        ))}
      </ScrollView>

      {/* View All Button */}
      <View className="px-5 mt-4">
        <TouchableOpacity className="bg-white rounded-xl border border-gray-200 py-3">
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-700 font-semibold text-sm">View All Trending</Text>
            <Ionicons name="arrow-forward" size={16} color="#374151" style={{ marginLeft: 6 }} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
