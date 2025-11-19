import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsGridProps {
  stats: {
    shlokasCompleted: number;
    accuracy: number;
    streakDays: number;
    totalTime: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View className="px-6 mt-6">
      <Text className="text-ancient-800 text-xl font-bold mb-4">Your Progress</Text>
      <View className="flex-row flex-wrap justify-between">
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%] mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="book" size={20} color="#f97316" />
            <Text className="text-2xl font-bold text-saffron-600">{stats.shlokasCompleted}</Text>
          </View>
          <Text className="text-ancient-600 text-sm">Shlokas Completed</Text>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%] mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="trophy" size={20} color="#f97316" />
            <Text className="text-2xl font-bold text-saffron-600">{stats.accuracy}%</Text>
          </View>
          <Text className="text-ancient-600 text-sm">Accuracy</Text>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%]">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="flame" size={20} color="#f97316" />
            <Text className="text-2xl font-bold text-saffron-600">{stats.streakDays}</Text>
          </View>
          <Text className="text-ancient-600 text-sm">Day Streak</Text>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%]">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="time" size={20} color="#f97316" />
            <Text className="text-2xl font-bold text-saffron-600">{stats.totalTime}m</Text>
          </View>
          <Text className="text-ancient-600 text-sm">Study Time</Text>
        </View>
      </View>
    </View>
  );
}
