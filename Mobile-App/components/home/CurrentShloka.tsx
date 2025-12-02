import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CurrentShlokaProps {
  shloka: {
    source: string;
    devanagari: string;
    translation: string;
    difficulty: string;
    chandas: {
      name: string;
    };
  };
}

export default function CurrentShloka({ shloka }: CurrentShlokaProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getDifficultyColor = () => {
    switch (shloka.difficulty.toLowerCase()) {
      case 'easy': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'hard': return { bg: 'bg-red-100', text: 'text-red-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const diffColors = getDifficultyColor();

  return (
    <View className="py-6 bg-white px-5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-[#F5EDE8] rounded-lg items-center justify-center mr-2">
            <Ionicons name="document-text" size={18} color="#855332" />
          </View>
          <Text className="text-gray-900 text-lg font-bold">Today&apos;s Shloka</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#855332] text-sm font-semibold mr-1">Archive</Text>
          <Ionicons name="chevron-forward" size={14} color="#855332" />
        </TouchableOpacity>
      </View>

      {/* Shloka Card */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View 
          className="bg-[#F5EDE8] rounded-2xl overflow-hidden border border-[#E8D9CF]"
          style={{ 
            shadowColor: '#855332',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Header */}
          <View className="bg-[#855332] px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="book" size={16} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">{shloka.source}</Text>
            </View>
            <View className={`${diffColors.bg} px-2.5 py-0.5 rounded-full`}>
              <Text className={`${diffColors.text} text-xs font-bold`}>
                {shloka.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="p-5">
            {/* Sanskrit Text */}
            <Text className="text-gray-800 text-lg font-medium mb-3 leading-7 text-center">
              {shloka.devanagari}
            </Text>
            
            {/* Divider */}
            <View className="h-px bg-[#E8D9CF] my-3" />
            
            {/* Translation */}
            <Text className="text-gray-600 text-sm leading-5 text-center italic">
              {shloka.translation}
            </Text>

            {/* Footer */}
            <View className="flex-row items-center justify-between mt-5">
              <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-[#E8D9CF]">
                <Ionicons name="musical-notes" size={14} color="#855332" />
                <Text className="text-gray-600 text-xs font-medium ml-1.5">
                  {shloka.chandas.name}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center mr-2 border border-[#E8D9CF]">
                  <Ionicons name="volume-high" size={18} color="#855332" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#855332] px-5 py-2.5 rounded-xl flex-row items-center">
                  <Ionicons name="play" size={14} color="white" />
                  <Text className="text-white font-bold text-sm ml-1.5">Practice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
