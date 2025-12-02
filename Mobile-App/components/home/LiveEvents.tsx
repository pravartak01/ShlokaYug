import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LiveSession {
  id: string;
  title: string;
  host: string;
  participants: number;
  duration: string;
  isLive: boolean;
  startsIn?: string;
}

const liveSessions: LiveSession[] = [
  {
    id: '1',
    title: 'Evening Vedic Chanting',
    host: 'Pandit Rajesh Kumar',
    participants: 342,
    duration: '45 min',
    isLive: true,
  },
  {
    id: '2',
    title: 'Gayatri Mantra Practice',
    host: 'Dr. Priya Sharma',
    participants: 0,
    duration: '30 min',
    isLive: false,
    startsIn: '2h 15m',
  },
  {
    id: '3',
    title: 'Chandas Workshop',
    host: 'Prof. Anand Mishra',
    participants: 0,
    duration: '60 min',
    isLive: false,
    startsIn: 'Tomorrow',
  }
];

export default function LiveEvents() {
  const liveNow = liveSessions.filter(s => s.isLive);
  const upcoming = liveSessions.filter(s => !s.isLive);

  return (
    <View className="py-6 bg-white">
      {/* Section Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2" />
          <Text className="text-gray-900 text-lg font-bold">Live & Upcoming</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#855332] text-sm font-semibold mr-1">All Sessions</Text>
          <Ionicons name="chevron-forward" size={14} color="#855332" />
        </TouchableOpacity>
      </View>

      {/* Live Now Card */}
      {liveNow.length > 0 && (
        <View className="px-5 mb-4">
          <TouchableOpacity activeOpacity={0.8}>
            <View 
              className="bg-red-500 rounded-2xl p-4"
              style={{ 
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-white px-3 py-1 rounded-full flex-row items-center">
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-1.5" />
                  <Text className="text-red-600 font-bold text-xs">LIVE NOW</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={14} color="white" />
                  <Text className="text-white text-xs font-semibold ml-1">{liveNow[0].participants} watching</Text>
                </View>
              </View>

              <Text className="text-white font-bold text-lg mb-1">{liveNow[0].title}</Text>
              <Text className="text-white/80 text-sm mb-3">with {liveNow[0].host}</Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text className="text-white/80 text-xs ml-1">{liveNow[0].duration}</Text>
                </View>
                <TouchableOpacity className="bg-white px-5 py-2 rounded-xl flex-row items-center">
                  <Ionicons name="videocam" size={16} color="#ef4444" />
                  <Text className="text-red-500 font-bold text-sm ml-1.5">Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Upcoming Sessions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {upcoming.map((session) => (
          <TouchableOpacity
            key={session.id}
            className="mr-3"
            activeOpacity={0.8}
          >
            <View 
              className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ 
                width: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-[#F5EDE8] px-2.5 py-1 rounded-full">
                  <Text className="text-[#855332] text-xs font-bold">{session.startsIn}</Text>
                </View>
                <Ionicons name="notifications-outline" size={18} color="#9ca3af" />
              </View>

              <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={1}>{session.title}</Text>
              <Text className="text-gray-500 text-xs mb-3">{session.host}</Text>

              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs ml-1">{session.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* View All Card */}
        <TouchableOpacity activeOpacity={0.8}>
          <View 
            className="bg-gray-50 rounded-2xl border border-gray-100 items-center justify-center"
            style={{ width: 120, height: 130 }}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-xs font-semibold">View All</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
