import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  return (
    <View className="px-6 mt-8 mb-8">
      <Text className="text-ancient-800 text-xl font-bold mb-4">Today&apos;s Shloka</Text>
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-saffron-600 font-semibold text-lg">
            {shloka.source}
          </Text>
          <View className="bg-ancient-100 px-3 py-1 rounded-full">
            <Text className="text-ancient-700 text-xs font-medium">
              {shloka.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text className="text-ancient-800 text-lg font-medium mb-3 leading-7">
          {shloka.devanagari}
        </Text>
        
        <Text className="text-ancient-600 text-base mb-4 leading-6">
          {shloka.translation}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="musical-note" size={16} color="#f97316" />
            <Text className="text-ancient-600 text-sm ml-2">
              {shloka.chandas.name}
            </Text>
          </View>
          <TouchableOpacity className="bg-saffron-500 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold text-sm">Practice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
