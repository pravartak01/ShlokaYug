import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getHinduDate, getDailySanskritQuote, getFormattedDate } from './utils';

interface HeaderProps {
  userName?: string;
  children?: React.ReactNode;
}

export default function Header({ userName = 'Shantanu', children }: HeaderProps) {
  const hinduDate = getHinduDate();
  const dailyQuote = getDailySanskritQuote();
  const formattedDate = getFormattedDate();

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c', '#c2410c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-6 pt-12 pb-8 rounded-b-3xl"
    >
      {/* User Greeting */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">
            Namaste, {userName} 👋
          </Text>
          <Text className="text-white/90 text-sm mt-1">
            {formattedDate}
          </Text>
        </View>
        <TouchableOpacity className="bg-white/20 p-3 rounded-full">
          <Ionicons name="notifications" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Hindu Calendar Date / Tithi */}
      <View className="bg-white/10 px-4 py-2 rounded-xl mb-4">
        <View className="flex-row items-center">
          <Ionicons name="calendar" size={16} color="white" />
          <Text className="text-white/80 text-xs ml-2">Hindu Calendar</Text>
        </View>
        <Text className="text-white text-base font-semibold mt-1">
          {hinduDate.formatted}
        </Text>
      </View>

      {/* Daily Sanskrit Quote */}
      <View className="bg-white/10 p-4 rounded-xl">
        <View className="flex-row items-center mb-2">
          <Ionicons name="book-outline" size={16} color="white" />
          <Text className="text-white/80 text-xs ml-2">Quote of the Day</Text>
        </View>
        <Text className="text-white text-base font-medium mb-2 leading-6">
          {dailyQuote.sanskrit}
        </Text>
        <Text className="text-white/90 text-xs italic" numberOfLines={2}>
          {dailyQuote.translation}
        </Text>
        <Text className="text-white/70 text-xs mt-1">
          — {dailyQuote.source}
        </Text>
      </View>

      {children}
    </LinearGradient>
  );
}
