import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
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
  bgColor: string;
  benefit?: string;
  action?: string;
}

// Festival detection based on date
const getCurrentFestival = () => {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  
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

const getTimeBasedRecommendation = (timeOfDay: string) => {
  const recommendations = {
    morning: {
      title: 'Morning Invocation',
      subtitle: 'Start your day with divine energy',
      icon: 'sunny',
      iconColor: '#f59e0b',
      bgColor: 'bg-amber-50',
      benefit: 'Energizes mind and body',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('morning') || s.spiritual.deity === 'Surya') || ENHANCED_SHLOKAS[0]
    },
    afternoon: {
      title: 'Midday Focus',
      subtitle: 'Maintain clarity and purpose',
      icon: 'partly-sunny',
      iconColor: '#f97316',
      bgColor: 'bg-orange-50',
      benefit: 'Sustains energy & concentration',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('dharma') || s.tags.includes('action')) || ENHANCED_SHLOKAS[0]
    },
    evening: {
      title: 'Evening Reflection',
      subtitle: 'Reflect and express gratitude',
      icon: 'moon',
      iconColor: '#8b5cf6',
      bgColor: 'bg-purple-50',
      benefit: 'Calms the mind, promotes peace',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('peace') || s.tags.includes('gratitude')) || ENHANCED_SHLOKAS[1]
    },
    night: {
      title: 'Night Meditation',
      subtitle: 'Prepare for restful sleep',
      icon: 'moon-outline',
      iconColor: '#855332',
      bgColor: 'bg-[#F5EDE8]',
      benefit: 'Relaxes body for peaceful rest',
      shloka: ENHANCED_SHLOKAS.find(s => s.tags.includes('meditation') || s.spiritual.tradition === 'Vedantic') || ENHANCED_SHLOKAS[2]
    }
  };
  
  return recommendations[timeOfDay as keyof typeof recommendations] || recommendations.morning;
};

const getAIPickedShloka = () => {
  const userLevel = 'intermediate';
  const filteredShlokas = ENHANCED_SHLOKAS.filter(s => s.difficulty === userLevel);
  const randomIndex = Math.floor(Math.random() * filteredShlokas.length);
  return filteredShlokas[randomIndex] || ENHANCED_SHLOKAS[0];
};

const getFestivalShloka = (festival: any) => {
  const festivalShloka = ENHANCED_SHLOKAS.find(
    s => s.spiritual.deity === festival.deity || s.tags.includes(festival.type)
  );
  return festivalShloka || ENHANCED_SHLOKAS[0];
};

// Animated Recommendation Card Component
const RecommendationCard = ({ rec, index }: { rec: Recommendation; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
        marginRight: 16,
        width: 300,
      }}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <View 
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Header */}
          <View className={`${rec.bgColor} p-4`}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="bg-white w-10 h-10 rounded-xl items-center justify-center mr-3">
                  <Ionicons name={rec.icon as any} size={20} color={rec.iconColor} />
                </View>
                <View>
                  <Text className="text-gray-900 font-bold text-base">{rec.title}</Text>
                  <Text className="text-gray-600 text-xs">{rec.subtitle}</Text>
                </View>
              </View>
              {rec.type === 'festival' && (
                <View className="bg-pink-500 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-bold">SPECIAL</Text>
                </View>
              )}
            </View>
            
            {rec.benefit && (
              <View className="bg-white/60 px-3 py-1.5 rounded-lg self-start">
                <Text className="text-gray-700 text-xs">{rec.benefit}</Text>
              </View>
            )}
          </View>
          
          {/* Shloka Content */}
          <View className="p-4">
            <Text className="text-gray-800 font-medium text-base leading-6 mb-2">
              {rec.shloka.devanagari}
            </Text>
            
            <Text className="text-gray-500 text-sm leading-5 mb-3">
              {rec.shloka.translation}
            </Text>
            
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="library-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs ml-1">{rec.shloka.source}</Text>
              </View>
              
              <TouchableOpacity className="bg-[#855332] px-4 py-2 rounded-xl">
                <Text className="text-white text-xs font-bold">{rec.action}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DailyRecommendations() {
  const timeOfDay = getTimeOfDay();
  const festival = getCurrentFestival();
  const timeRec = getTimeBasedRecommendation(timeOfDay);
  const aiShloka = getAIPickedShloka();
  
  const recommendations: Recommendation[] = [
    {
      id: 'ai-daily',
      type: 'daily',
      title: 'Recommended for You',
      subtitle: 'AI-curated for your journey',
      shloka: {
        devanagari: aiShloka.devanagari.split('\n')[0] + (aiShloka.devanagari.includes('\n') ? '...' : ''),
        translation: aiShloka.translation.substring(0, 100) + '...',
        source: aiShloka.source
      },
      icon: 'sparkles',
      iconColor: '#855332',
      bgColor: 'bg-[#F5EDE8]',
      benefit: `${aiShloka.difficulty} level • ${aiShloka.chandas.name} meter`,
      action: 'Start Learning'
    },
    {
      id: 'time-based',
      type: 'time-based',
      title: timeRec.title,
      subtitle: timeRec.subtitle,
      shloka: {
        devanagari: timeRec.shloka.devanagari.split('\n')[0] + (timeRec.shloka.devanagari.includes('\n') ? '...' : ''),
        translation: timeRec.shloka.translation.substring(0, 100) + '...',
        source: timeRec.shloka.source
      },
      icon: timeRec.icon,
      iconColor: timeRec.iconColor,
      bgColor: timeRec.bgColor,
      benefit: timeRec.benefit,
      action: 'Practice Now'
    }
  ];
  
  if (festival) {
    const festivalShloka = getFestivalShloka(festival);
    recommendations.splice(1, 0, {
      id: 'festival',
      type: 'festival',
      title: `${festival.name} Special`,
      subtitle: `Celebrate with ${festival.deity}`,
      shloka: {
        devanagari: festivalShloka.devanagari.split('\n')[0] + (festivalShloka.devanagari.includes('\n') ? '...' : ''),
        translation: festivalShloka.translation.substring(0, 100) + '...',
        source: festivalShloka.source
      },
      icon: 'gift',
      iconColor: '#ec4899',
      bgColor: 'bg-pink-50',
      benefit: `Festival blessing • ${festival.type}`,
      action: 'Celebrate'
    });
  }

  return (
    <View className="py-6 bg-white">
      {/* Section Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-900 text-lg font-bold">Today's Picks</Text>
          <Text className="text-gray-500 text-sm">Personalized for you</Text>
        </View>
        <View className="bg-[#F5EDE8] px-3 py-1 rounded-full">
          <Text className="text-[#855332] text-xs font-semibold">{recommendations.length} New</Text>
        </View>
      </View>
      
      {/* Recommendations Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {recommendations.map((rec, index) => (
          <RecommendationCard key={rec.id} rec={rec} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}
