import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TrendingShloka {
  id: string;
  title: string;
  chandas: string;
  audioLength: string;
  plays: number;
  likes: number;
  thumbnail: string;
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
    thumbnail: '🌅',
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
    thumbnail: '🔱',
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
    thumbnail: '🕉️',
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
    thumbnail: '🙏',
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
    thumbnail: '🐒',
    difficulty: 'intermediate',
    tags: ['Power', 'Devotional', 'Energy']
  }
];

export default function TrendingShlokas() {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View className="mt-8 mb-4">
      {/* Section Header */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-ancient-800 text-xl font-bold">Trending in Community</Text>
            <Text className="text-ancient-600 text-sm mt-1">
              Most popular chants this week
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center bg-saffron-100 px-3 py-2 rounded-full">
            <Ionicons name="flame" size={16} color="#f97316" />
            <Text className="text-saffron-700 font-semibold text-xs ml-1">Hot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trending Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row px-6"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {trendingShlokas.map((shloka, index) => (
          <TouchableOpacity
            key={shloka.id}
            className="mr-4"
            style={{ width: 280 }}
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-2xl border border-ancient-200 overflow-hidden">
              {/* Thumbnail Header */}
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-6"
              >
                <View className="flex-row items-center justify-between mb-2">
                  {/* Trending Badge */}
                  <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center">
                    <Ionicons name="trending-up" size={12} color="white" />
                    <Text className="text-white font-bold text-xs ml-1">#{index + 1}</Text>
                  </View>
                  
                  {/* Audio Length */}
                  <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center">
                    <Ionicons name="headset" size={12} color="white" />
                    <Text className="text-white text-xs font-medium ml-1">{shloka.audioLength}</Text>
                  </View>
                </View>
                
                {/* Thumbnail Emoji */}
                <View className="items-center py-2">
                  <Text className="text-6xl">{shloka.thumbnail}</Text>
                </View>
              </LinearGradient>

              {/* Content */}
              <View className="p-4">
                {/* Title */}
                <Text className="text-ancient-800 font-bold text-base mb-2">
                  {shloka.title}
                </Text>

                {/* Chandas Badge */}
                <View className="flex-row items-center mb-3">
                  <View className="bg-saffron-100 px-3 py-1 rounded-full flex-row items-center mr-2">
                    <Ionicons name="musical-note" size={12} color="#f97316" />
                    <Text className="text-saffron-700 text-xs font-semibold ml-1">
                      {shloka.chandas}
                    </Text>
                  </View>
                  <View className="bg-ancient-100 px-3 py-1 rounded-full">
                    <Text className="text-ancient-700 text-xs font-medium">
                      {shloka.difficulty}
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap mb-3">
                  {shloka.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} className="bg-ancient-50 px-2 py-1 rounded mr-1 mb-1">
                      <Text className="text-ancient-600 text-xs">{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Stats Row */}
                <View className="flex-row items-center justify-between pt-3 border-t border-ancient-200">
                  <View className="flex-row items-center">
                    <Ionicons name="play" size={14} color="#996f0a" />
                    <Text className="text-ancient-600 text-xs ml-1 mr-3">
                      {formatNumber(shloka.plays)}
                    </Text>
                    <Ionicons name="heart" size={14} color="#f97316" />
                    <Text className="text-ancient-600 text-xs ml-1">
                      {formatNumber(shloka.likes)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity className="bg-saffron-500 px-4 py-1.5 rounded-full">
                    <View className="flex-row items-center">
                      <Ionicons name="play" size={12} color="white" />
                      <Text className="text-white text-xs font-bold ml-1">Play</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View All Button */}
      <View className="px-6 mt-4">
        <TouchableOpacity className="bg-ancient-100 rounded-xl border border-ancient-200 py-3">
          <View className="flex-row items-center justify-center">
            <Text className="text-ancient-800 font-semibold text-sm">View All Trending</Text>
            <Ionicons name="arrow-forward" size={16} color="#996f0a" className="ml-2" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
