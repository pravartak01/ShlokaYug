import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LiveSession {
  id: string;
  title: string;
  host: string;
  participants: number;
  duration: string;
  isLive: boolean;
  startsIn?: string;
  category: string;
}

const liveSessions: LiveSession[] = [
  {
    id: '1',
    title: 'Evening Vedic Chanting Session',
    host: 'Pandit Rajesh Kumar',
    participants: 342,
    duration: '45 min',
    isLive: true,
    category: 'Devotional'
  },
  {
    id: '2',
    title: 'Gayatri Mantra Group Practice',
    host: 'Dr. Priya Sharma',
    participants: 0,
    duration: '30 min',
    isLive: false,
    startsIn: '2h 15m',
    category: 'Morning'
  }
];

const upcomingEvents = [
  {
    id: '1',
    title: 'Weekend Chandas Workshop',
    date: 'Saturday, 9:00 AM',
    instructor: 'Prof. Anand Mishra',
    enrolled: 156
  },
  {
    id: '2',
    title: 'Hanuman Chalisa Masterclass',
    date: 'Sunday, 6:00 PM',
    instructor: 'Swami Vidyananda',
    enrolled: 298
  }
];

export default function LiveEvents() {
  return (
    <View className="px-6 mt-8 mb-8">
      {/* Section Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="bg-saffron-500 w-2 h-2 rounded-full mr-2" />
              <Text className="text-ancient-800 text-xl font-bold">Live Sessions</Text>
            </View>
            <Text className="text-ancient-600 text-sm">
              Join our community in real-time
            </Text>
          </View>
        </View>
      </View>

      {/* Live Now Session */}
      {liveSessions.filter(s => s.isLive).map((session) => (
        <TouchableOpacity
          key={session.id}
          className="mb-4"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden"
          >
            <View className="p-5">
              {/* Live Badge */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-white px-3 py-1.5 rounded-full flex-row items-center">
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  <Text className="text-red-600 font-bold text-xs">LIVE NOW</Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">{session.category}</Text>
                </View>
              </View>

              {/* Session Title */}
              <Text className="text-white font-bold text-xl mb-2">
                {session.title}
              </Text>

              {/* Host Info */}
              <View className="flex-row items-center mb-4">
                <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/90 text-xs">Hosted by</Text>
                  <Text className="text-white font-semibold text-sm">{session.host}</Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-white/20 px-3 py-2 rounded-full flex-row items-center mr-3">
                    <Ionicons name="people" size={14} color="white" />
                    <Text className="text-white text-xs font-semibold ml-1">
                      {session.participants} watching
                    </Text>
                  </View>
                  <View className="bg-white/20 px-3 py-2 rounded-full flex-row items-center">
                    <Ionicons name="time" size={14} color="white" />
                    <Text className="text-white text-xs font-semibold ml-1">
                      {session.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Join Button */}
              <TouchableOpacity className="bg-white rounded-xl">
                <View className="py-3 flex-row items-center justify-center">
                  <Ionicons name="videocam" size={20} color="#f97316" />
                  <Text className="text-saffron-600 font-bold text-base ml-2">
                    Join Live Session
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      {/* Upcoming Sessions */}
      <View className="mb-4">
        <Text className="text-ancient-700 font-semibold text-sm mb-3">Upcoming Soon</Text>
        
        {liveSessions.filter(s => !s.isLive).map((session) => (
          <View key={session.id} className="bg-white rounded-xl border border-ancient-200 p-4 mb-3">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-ancient-800 font-bold text-base mb-1">
                  {session.title}
                </Text>
                <Text className="text-ancient-600 text-xs mb-2">
                  with {session.host}
                </Text>
              </View>
              <View className="bg-saffron-100 px-3 py-1 rounded-full">
                <Text className="text-saffron-700 font-bold text-xs">
                  in {session.startsIn}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#996f0a" />
                <Text className="text-ancient-600 text-xs ml-1 mr-3">{session.duration}</Text>
                <Ionicons name="pricetag-outline" size={14} color="#996f0a" />
                <Text className="text-ancient-600 text-xs ml-1">{session.category}</Text>
              </View>
              
              <TouchableOpacity className="bg-saffron-500 px-4 py-1.5 rounded-full">
                <View className="flex-row items-center">
                  <Ionicons name="notifications" size={12} color="white" />
                  <Text className="text-white text-xs font-bold ml-1">Remind Me</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Upcoming Events */}
      <View>
        <Text className="text-ancient-700 font-semibold text-sm mb-3">Upcoming Events</Text>
        
        {upcomingEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            className="bg-ancient-50 rounded-xl border border-ancient-200 p-4 mb-3"
            activeOpacity={0.8}
          >
            <View className="flex-row items-start">
              <View className="bg-saffron-100 w-12 h-12 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar" size={24} color="#f97316" />
              </View>
              
              <View className="flex-1">
                <Text className="text-ancient-800 font-bold text-base mb-1">
                  {event.title}
                </Text>
                <Text className="text-ancient-600 text-xs mb-2">{event.date}</Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="person-circle-outline" size={14} color="#996f0a" />
                    <Text className="text-ancient-600 text-xs ml-1 mr-3">
                      {event.instructor}
                    </Text>
                  </View>
                  <View className="bg-white px-3 py-1 rounded-full">
                    <Text className="text-ancient-700 text-xs font-semibold">
                      {event.enrolled} enrolled
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-3 pt-3 border-t border-ancient-200">
              <View className="flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={16} color="#f97316" />
                <Text className="text-saffron-600 font-semibold text-sm ml-2">
                  Register for Event
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* View All Events */}
      <TouchableOpacity className="bg-ancient-100 rounded-xl border border-ancient-200 py-3 mt-2">
        <View className="flex-row items-center justify-center">
          <Ionicons name="calendar-outline" size={16} color="#996f0a" />
          <Text className="text-ancient-800 font-semibold text-sm ml-2">
            View All Events & Sessions
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
