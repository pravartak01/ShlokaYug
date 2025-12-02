import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsGridProps {
  stats: {
    shlokasCompleted: number;
    accuracy: number;
    streakDays: number;
    totalTime: number;
  };
}

const StatCard = ({ 
  icon, 
  value, 
  label, 
  bgColor, 
  iconColor 
}: { 
  icon: string; 
  value: string | number; 
  label: string; 
  bgColor: string;
  iconColor: string;
}) => (
  <View className="bg-white rounded-2xl p-4 flex-1 mx-1.5" style={{ 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  }}>
    <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center mb-3`}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <Text className="text-gray-900 text-2xl font-bold mb-0.5">{value}</Text>
    <Text className="text-gray-500 text-xs font-medium">{label}</Text>
  </View>
);

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View className="px-4 py-5 bg-gray-50">
      {/* Section Title */}
      <View className="flex-row items-center justify-between mb-4 px-1">
        <Text className="text-gray-900 text-lg font-bold">Your Progress</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#855332] text-sm font-semibold mr-1">Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#855332" />
        </TouchableOpacity>
      </View>

      {/* Stats Row 1 */}
      <View className="flex-row mb-3">
        <StatCard 
          icon="book" 
          value={stats.shlokasCompleted} 
          label="Shlokas" 
          bgColor="bg-[#F5EDE8]"
          iconColor="#855332"
        />
        <StatCard 
          icon="trophy" 
          value={`${stats.accuracy}%`} 
          label="Accuracy" 
          bgColor="bg-green-50"
          iconColor="#22c55e"
        />
      </View>

      {/* Stats Row 2 */}
      <View className="flex-row">
        <StatCard 
          icon="flame" 
          value={stats.streakDays} 
          label="Day Streak" 
          bgColor="bg-red-50"
          iconColor="#ef4444"
        />
        <StatCard 
          icon="time" 
          value={`${stats.totalTime}m`} 
          label="Study Time" 
          bgColor="bg-blue-50"
          iconColor="#3b82f6"
        />
      </View>
    </View>
  );
}
