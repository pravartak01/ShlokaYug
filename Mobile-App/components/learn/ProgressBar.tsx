/**
 * ProgressBar Component
 * Visual progress indicator for course completion
 */

import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View className="bg-gray-800 px-4 py-2">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-white text-sm font-medium">Course Progress</Text>
        <Text className="text-orange-500 text-sm font-bold">{Math.round(progress)}%</Text>
      </View>
      <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
