import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getHinduDate, getDailySanskritQuote, getFormattedDate, fetchPanchangData, PanchangData } from './utils';

interface HeaderProps {
  userName?: string;
  children?: React.ReactNode;
}

export default function Header({ userName = 'Shantanu', children }: HeaderProps) {
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const hinduDate = getHinduDate();
  const dailyQuote = getDailySanskritQuote();
  const formattedDate = getFormattedDate();

  useEffect(() => {
    const loadPanchangData = async () => {
      setLoading(true);
      const data = await fetchPanchangData();
      setPanchangData(data);
      setLoading(false);
    };

    loadPanchangData();
  }, []);

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

      {/* Hindu Calendar Date / Panchang */}
      <View className="bg-white/10 px-4 py-3 rounded-xl mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar" size={18} color="white" />
          <Text className="text-white/90 text-sm ml-2 font-semibold">Hindu Panchang</Text>
          {loading && <ActivityIndicator size="small" color="white" className="ml-2" />}
        </View>
        
        {panchangData ? (
          <>
            {/* Tithi and Day */}
            <View className="mb-2">
              <Text className="text-white text-lg font-bold">
                {panchangData.tithi}
              </Text>
              <Text className="text-white/80 text-xs mt-0.5">
                {panchangData.day}
              </Text>
            </View>

            {/* Nakshatra and Yog */}
            <View className="flex-row justify-between mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-white/70 text-xs">Nakshatra</Text>
                <Text className="text-white text-sm font-semibold">
                  {panchangData.nakshatra}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/70 text-xs">Yog</Text>
                <Text className="text-white text-sm font-semibold">
                  {panchangData.yog}
                </Text>
              </View>
            </View>

            {/* Sunrise and Sunset */}
            <View className="flex-row justify-between items-center pt-2 border-t border-white/20">
              <View className="flex-row items-center">
                <Ionicons name="sunny" size={14} color="#FDB813" />
                <Text className="text-white/80 text-xs ml-1">Rise</Text>
                <Text className="text-white text-sm font-semibold ml-2">
                  {panchangData.sunrise}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="moon" size={14} color="#FFE5B4" />
                <Text className="text-white/80 text-xs ml-1">Set</Text>
                <Text className="text-white text-sm font-semibold ml-2">
                  {panchangData.sunset}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text className="text-white text-base font-semibold mt-1">
            {hinduDate.formatted}
          </Text>
        )}
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
