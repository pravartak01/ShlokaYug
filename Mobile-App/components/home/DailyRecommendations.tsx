import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ENHANCED_SHLOKAS } from '../../data/enhancedData';
import { getTimeOfDay } from './utils';

interface Recommendation {
  id: string;
  type: 'daily' | 'festival' | 'time-based';
  title: string;
  subtitle: string;
  shloka: {
    devanagari: string;
    translation: string;
    source: string;
  };
  icon: string;
  iconColor: string;
  gradientColors: [string, string];
  benefit?: string;
  action?: string;
}

// Festival detection based on date
const getCurrentFestival = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();
  
  // Sample festival dates (would need proper lunar calendar integration)
  const festivals = [
    { month: 10, day: 1, name: 'Diwali', deity: 'Lakshmi', type: 'prosperity' },
    { month: 2, day: 8, name: 'Maha Shivaratri', deity: 'Shiva', type: 'spiritual' },
    { month: 3, day: 10, name: 'Ram Navami', deity: 'Rama', type: 'dharma' },
    { month: 7, day: 15, name: 'Krishna Janmashtami', deity: 'Krishna', type: 'devotion' },
    { month: 8, day: 25, name: 'Navaratri', deity: 'Durga', type: 'power' },
    { month: 0, day: 14, name: 'Makar Sankranti', deity: 'Surya', type: 'transition' },
  ];
  
  const todayFestival = festivals.find(f => f.month === month && Math.abs(f.day - day) <= 3);
  return todayFestival || null;
};

// Get time-based recommendation
const getTimeBasedRecommendation = (timeOfDay: string) => {
  const recommendations = {
    morning: {
      title: 'Morning Invocation',
      subtitle: 'Start your day with divine energy',
      icon: 'sunny',
      iconColor: '#f59e0b',
      benefit: 'Energizes mind and body, sets positive intentions',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('morning') || s.spiritual.deity === 'Surya') || ENHANCED_SHLOKAS[0]
    },
    afternoon: {
      title: 'Midday Focus',
      subtitle: 'Maintain clarity and purpose',
      icon: 'partly-sunny',
      iconColor: '#f97316',
      benefit: 'Sustains energy, enhances concentration',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('dharma') || s.tags.includes('action')) || ENHANCED_SHLOKAS[0]
    },
    evening: {
      title: 'Evening Reflection',
      subtitle: 'Reflect and express gratitude',
      icon: 'moon',
      iconColor: '#8b5cf6',
      benefit: 'Calms the mind, promotes inner peace',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('peace') || s.tags.includes('gratitude')) || ENHANCED_SHLOKAS[1]
    },
    night: {
      title: 'Night Meditation',
      subtitle: 'Prepare for restful sleep',
      icon: 'moon-outline',
      iconColor: '#6366f1',
      benefit: 'Relaxes body, ensures peaceful rest',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('meditation') || s.spiritual.tradition === 'Vedantic') || ENHANCED_SHLOKAS[2]
    }
  };
  
  return recommendations[timeOfDay as keyof typeof recommendations] || recommendations.morning;
};

// Get AI-picked daily shloka based on user level and preferences
const getAIPickedShloka = () => {
  // In production, this would use user's learning history, preferences, and ML model
  const userLevel = 'intermediate'; // Would come from user profile
  
  const filteredShlokas = ENHANCED_SHLOKAS.filter(s => s.difficulty === userLevel);
  const randomIndex = Math.floor(Math.random() * filteredShlokas.length);
  
  return filteredShlokas[randomIndex] || ENHANCED_SHLOKAS[0];
};

// Get festival-specific shloka
const getFestivalShloka = (festival: any) => {
  const festivalShloka = ENHANCED_SHLOKAS.find(
    s => s.spiritual.deity === festival.deity || s.tags.includes(festival.type)
  );
  
  return festivalShloka || ENHANCED_SHLOKAS[0];
};

export default function DailyRecommendations() {
  const timeOfDay = getTimeOfDay();
  const festival = getCurrentFestival();
  const timeRec = getTimeBasedRecommendation(timeOfDay);
  const aiShloka = getAIPickedShloka();
  
  const recommendations: Recommendation[] = [
    // AI-picked daily shloka
    {
      id: 'ai-daily',
      type: 'daily',
      title: 'Recommended for You',
      subtitle: 'AI-curated based on your learning journey',
      shloka: {
        devanagari: aiShloka.devanagari.split('\n')[0] + (aiShloka.devanagari.includes('\n') ? '...' : ''),
        translation: aiShloka.translation.substring(0, 120) + '...',
        source: aiShloka.source
      },
      icon: 'sparkles',
      iconColor: '#f97316',
      gradientColors: ['#f97316', '#ea580c'],
      benefit: `Perfect for ${aiShloka.difficulty} level • ${aiShloka.chandas.name} meter`,
      action: 'Start Learning'
    },
    // Time-based recommendation
    {
      id: 'time-based',
      type: 'time-based',
      title: timeRec.title,
      subtitle: timeRec.subtitle,
      shloka: {
        devanagari: timeRec.shloka.devanagari.split('\n')[0] + (timeRec.shloka.devanagari.includes('\n') ? '...' : ''),
        translation: timeRec.shloka.translation.substring(0, 120) + '...',
        source: timeRec.shloka.source
      },
      icon: timeRec.icon,
      iconColor: timeRec.iconColor,
      gradientColors: ['#8b5cf6', '#7c3aed'],
      benefit: timeRec.benefit,
      action: 'Practice Now'
    }
  ];
  
  // Add festival recommendation if there's a festival
  if (festival) {
    const festivalShloka = getFestivalShloka(festival);
    recommendations.splice(1, 0, {
      id: 'festival',
      type: 'festival',
      title: `🎉 ${festival.name} Special`,
      subtitle: `Celebrate with devotion to ${festival.deity}`,
      shloka: {
        devanagari: festivalShloka.devanagari.split('\n')[0] + (festivalShloka.devanagari.includes('\n') ? '...' : ''),
        translation: festivalShloka.translation.substring(0, 120) + '...',
        source: festivalShloka.source
      },
      icon: 'gift',
      iconColor: '#ec4899',
      gradientColors: ['#ec4899', '#db2777'],
      benefit: `Festival blessing • ${festival.type} theme`,
      action: 'Celebrate'
    });
  }

  return (
    <View className="px-6 mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-ancient-800 text-xl font-bold">Today&apos;s Recommendations</Text>
          <Text className="text-ancient-600 text-sm mt-1">Personalized for your spiritual growth</Text>
        </View>
        <View className="bg-saffron-100 px-3 py-1 rounded-full">
          <Text className="text-saffron-700 text-xs font-semibold">{recommendations.length} New</Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row -mx-6 px-6"
      >
        {recommendations.map((rec, index) => (
          <View 
            key={rec.id} 
            className="mr-4"
            style={{ width: 320 }}
          >
            <LinearGradient
              colors={rec.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <View className="p-5 pb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-white/20 p-2 rounded-full mr-3">
                      <Ionicons name={rec.icon as any} size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base">{rec.title}</Text>
                      <Text className="text-white/90 text-xs mt-0.5">{rec.subtitle}</Text>
                    </View>
                  </View>
                  {rec.type === 'festival' && (
                    <View className="bg-white/30 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">SPECIAL</Text>
                    </View>
                  )}
                </View>
                
                {/* Benefit Badge */}
                {rec.benefit && (
                  <View className="bg-white/20 px-3 py-2 rounded-xl mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="information-circle" size={14} color="white" />
                      <Text className="text-white text-xs ml-2 flex-1">{rec.benefit}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Shloka Content */}
              <View className="bg-white/95 p-5">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="book" size={14} color="#c2410c" />
                  <Text className="text-saffron-700 text-xs font-semibold ml-2 uppercase">Shloka</Text>
                </View>
                
                <Text className="text-ancient-800 font-medium text-base leading-7 mb-3">
                  {rec.shloka.devanagari}
                </Text>
                
                <Text className="text-ancient-600 text-sm leading-6 mb-3">
                  {rec.shloka.translation}
                </Text>
                
                <View className="flex-row items-center justify-between pt-3 border-t border-ancient-200">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="library" size={12} color="#996f0a" />
                    <Text className="text-ancient-600 text-xs ml-2">{rec.shloka.source}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    className="bg-saffron-500 px-4 py-2 rounded-full"
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-white text-xs font-bold mr-1">{rec.action}</Text>
                      <Ionicons name="arrow-forward" size={12} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Progress Indicator for AI recommendation */}
              {rec.type === 'daily' && (
                <View className="bg-white/95 px-5 py-3 border-t border-white/30">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-ancient-600 text-xs">Your Progress</Text>
                    <Text className="text-saffron-600 text-xs font-semibold">Level: Intermediate</Text>
                  </View>
                  <View className="mt-2 bg-ancient-200 h-1.5 rounded-full overflow-hidden">
                    <View className="bg-saffron-500 h-full rounded-full" style={{ width: '65%' }} />
                  </View>
                </View>
              )}
              
              {/* Time indicator for time-based recommendation */}
              {rec.type === 'time-based' && (
                <View className="bg-white/95 px-5 py-3 border-t border-white/30">
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={12} color="#996f0a" />
                    <Text className="text-ancient-600 text-xs ml-2">
                      Best practiced during {timeOfDay} hours
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Festival countdown */}
              {rec.type === 'festival' && (
                <View className="bg-white/95 px-5 py-3 border-t border-white/30">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={12} color="#996f0a" />
                    <Text className="text-ancient-600 text-xs ml-2">
                      Festival period • Limited time recommendation
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      
      {/* Quick Stats */}
      <View className="mt-4 bg-white p-4 rounded-xl border border-ancient-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="bg-saffron-100 p-2 rounded-full">
              <Ionicons name="trending-up" size={16} color="#f97316" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-ancient-800 font-semibold text-sm">Daily Consistency Streak</Text>
              <Text className="text-ancient-600 text-xs mt-0.5">Keep practicing to unlock more recommendations</Text>
            </View>
          </View>
          <View className="bg-saffron-500 px-3 py-1.5 rounded-full">
            <Text className="text-white font-bold text-sm">12 days</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
