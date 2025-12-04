/**
 * TrendingHashtags Component - Vintage Theme
 * Displays trending hashtags with elegant styling
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TrendingHashtag } from '../../services/communityService';

// Vintage Theme Colors
const COLORS = {
  primaryBrown: '#4A2E1C',
  copper: '#B87333',
  gold: '#D4A017',
  saffron: '#DD7A1F',
  sand: '#F3E4C8',
  cream: '#FFF8E7',
  darkBrown: '#2D1810',
  warmWhite: '#FFFDF7',
  deepMaroon: '#5D1A0B',
  ivory: '#FFFFF0',
  bronze: '#CD7F32',
};

interface TrendingHashtagsProps {
  hashtags: TrendingHashtag[];
  onHashtagPress?: (hashtag: string) => void;
  loading?: boolean;
}

const TrendingHashtags: React.FC<TrendingHashtagsProps> = memo(({
  hashtags,
  onHashtagPress,
  loading = false,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <View className="py-4">
        <View className="flex-row px-4 mb-3">
          <View className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-28 h-16 bg-gray-100 rounded-xl mr-3 animate-pulse" />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  return (
    <View className="py-4 bg-white">
      <View className="flex-row items-center px-4 mb-3">
        <Ionicons name="trending-up" size={20} color="#f97316" />
        <Text className="text-gray-900 font-bold text-lg ml-2">Trending Now</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {hashtags.map((hashtag, index) => (
          <TouchableOpacity
            key={hashtag._id}
            onPress={() => onHashtagPress?.(hashtag._id)}
            className="mr-3"
          >
            <View className={`px-4 py-3 rounded-xl ${
              index === 0 
                ? 'bg-gradient-to-br from-orange-500 to-pink-500' 
                : 'bg-gray-100'
            }`}>
              <View className="flex-row items-center">
                <Text className={`font-bold text-base ${
                  index === 0 ? 'text-white' : 'text-gray-900'
                }`}>
                  #{hashtag._id}
                </Text>
                {index === 0 && (
                  <View className="ml-2 bg-white/30 rounded-full px-1.5 py-0.5">
                    <Text className="text-white text-xs font-medium">🔥</Text>
                  </View>
                )}
              </View>
              <Text className={`text-xs mt-1 ${
                index === 0 ? 'text-white/80' : 'text-gray-500'
              }`}>
                {formatNumber(hashtag.count)} posts
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

TrendingHashtags.displayName = 'TrendingHashtags';

export default TrendingHashtags;
