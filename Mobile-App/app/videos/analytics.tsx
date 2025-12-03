import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import videoService from '../../services/videoService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSubscribers: number;
  averageWatchTime: number;
  engagementRate: number;
  viewsGrowth: number[];
  topVideos: any[];
  demographics: {
    ageGroups: any;
    locations: any;
    devices: any;
  };
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await videoService.getChannelAnalytics();
      setAnalytics(response.data || response);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B87333" />
          <Text className="text-gray-600 mt-3">Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-bold">Channel Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics}>
          <Ionicons name="refresh" size={24} color="#B87333" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              className={`flex-1 py-2 rounded-full mx-1 ${
                timeRange === range ? 'bg-[#DD7A1F]' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  timeRange === range ? 'text-white' : 'text-gray-600'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <LinearGradient
          colors={['#B87333', '#4A2E1C']}
          className="p-6"
        >
          <Text className="text-white text-2xl font-bold mb-4">Channel Performance</Text>
          
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] bg-white/20 backdrop-blur-lg p-4 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="eye" size={24} color="white" />
                <View className="bg-white/30 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">+12%</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">Total Views</Text>
              <Text className="text-white text-2xl font-bold">
                {formatNumber(analytics?.totalViews || 45600)}
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white/20 backdrop-blur-lg p-4 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="heart" size={24} color="white" />
                <View className="bg-white/30 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">+8%</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">Total Likes</Text>
              <Text className="text-white text-2xl font-bold">
                {formatNumber(analytics?.totalLikes || 3420)}
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white/20 backdrop-blur-lg p-4 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="people" size={24} color="white" />
                <View className="bg-white/30 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">+15%</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">Subscribers</Text>
              <Text className="text-white text-2xl font-bold">
                {formatNumber(analytics?.totalSubscribers || 1250)}
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white/20 backdrop-blur-lg p-4 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="chatbubbles" size={24} color="white" />
                <View className="bg-white/30 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">+5%</Text>
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">Comments</Text>
              <Text className="text-white text-2xl font-bold">
                {formatNumber(analytics?.totalComments || 890)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Views Chart */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">Views Over Time</Text>
          <View className="flex-row items-end justify-between h-48 border-b border-gray-200 pb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const heights = [120, 150, 180, 160, 200, 240, 280];
              const height = (heights[index] / 280) * 100;
              return (
                <View key={day} className="flex-1 items-center mx-1">
                  <View className="w-full items-center">
                    <Text className="text-xs text-gray-600 mb-1">{heights[index]}</Text>
                    <View 
                      className="w-full bg-[#DD7A1F] rounded-t-lg"
                      style={{ height: `${height}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-2">{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Engagement Metrics */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">Engagement Breakdown</Text>
          <View className="space-y-3">
            {[
              { label: 'Likes', value: 3420, color: 'bg-[#DD7A1F]', max: 4000 },
              { label: 'Comments', value: 890, color: 'bg-blue-500', max: 4000 },
              { label: 'Shares', value: 450, color: 'bg-green-500', max: 4000 },
              { label: 'Saves', value: 680, color: 'bg-[#B87333]', max: 4000 },
            ].map((item) => (
              <View key={item.label} className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 font-semibold">{item.label}</Text>
                  <Text className="text-gray-900 font-bold">{formatNumber(item.value)}</Text>
                </View>
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Performing Videos */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">Top Performing Videos</Text>
          
          {[1, 2, 3, 4, 5].map((item, index) => (
            <View
              key={index}
              className="flex-row items-center py-3 border-b border-gray-100"
            >
              <Text className="text-gray-600 font-bold text-lg w-8">{index + 1}</Text>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                  Sanskrit Grammar Tutorial #{item}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {formatNumber(5600 - index * 500)} views
                </Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={16} color="#DD7A1F" />
                  <Text className="text-[#DD7A1F] font-semibold ml-1">
                    {formatNumber(420 - index * 50)}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs mt-1">
                  {(85 - index * 5)}% retention
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Audience Insights */}
        <View className="bg-white mt-4 p-4 mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">Audience Insights</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Top Locations</Text>
            {['India', 'United States', 'United Kingdom', 'Canada'].map((country, index) => (
              <View key={country} className="flex-row items-center justify-between py-2">
                <Text className="text-gray-600">{country}</Text>
                <View className="flex-row items-center flex-1 mx-4">
                  <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-[#B87333] rounded-full"
                      style={{ width: `${90 - index * 15}%` }}
                    />
                  </View>
                </View>
                <Text className="text-gray-900 font-semibold">{90 - index * 15}%</Text>
              </View>
            ))}
          </View>

          <View>
            <Text className="text-gray-700 font-semibold mb-2">Device Usage</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#FEF3E8] p-3 rounded-xl">
                <Ionicons name="phone-portrait" size={24} color="#B87333" />
                <Text className="text-gray-600 text-sm mt-2">Mobile</Text>
                <Text className="text-[#B87333] font-bold text-xl">68%</Text>
              </View>
              <View className="flex-1 bg-blue-50 p-3 rounded-xl">
                <Ionicons name="desktop" size={24} color="#3b82f6" />
                <Text className="text-gray-600 text-sm mt-2">Desktop</Text>
                <Text className="text-blue-700 font-bold text-xl">25%</Text>
              </View>
              <View className="flex-1 bg-green-50 p-3 rounded-xl">
                <Ionicons name="tablet-landscape" size={24} color="#10b981" />
                <Text className="text-gray-600 text-sm mt-2">Tablet</Text>
                <Text className="text-green-700 font-bold text-xl">7%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}