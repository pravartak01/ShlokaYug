import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View className="px-6 mt-8">
      <Text className="text-ancient-800 text-xl font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={action.action}
            className="w-[48%] mb-4"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 rounded-2xl"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Ionicons name={action.icon as any} size={28} color="white" />
              </View>
              <Text className="text-white font-semibold text-base mb-1">
                {action.title}
              </Text>
              <Text className="text-white/90 text-sm">
                {action.subtitle}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
