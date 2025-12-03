import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface MoodItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  shlokaCount: number;
}

const moodData: MoodItem[] = [
  {
    id: 'peace',
    label: 'Peace',
    icon: 'leaf-outline',
    color: '#22c55e',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Find inner calm',
    shlokaCount: 28
  },
  {
    id: 'anger',
    label: 'Anger Control',
    icon: 'water-outline',
    color: '#DD7A1F', // Saffron for transformative energy
    bgColor: 'bg-[#FEF3E8]',
    borderColor: 'border-[#FCDFC2]',
    description: 'Cool your mind',
    shlokaCount: 15
  },
  {
    id: 'anxiety',
    label: 'Anxiety Relief',
    icon: 'heart-outline',
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Soothing mantras',
    shlokaCount: 22
  },
  {
    id: 'depression',
    label: 'Uplift Mood',
    icon: 'sunny-outline',
    color: '#D4A017', // Bright Gold for uplifting
    bgColor: 'bg-[#FDF8E8]',
    borderColor: 'border-[#F0E4C0]',
    description: 'Bring back joy',
    shlokaCount: 19
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: 'eye-outline',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Sharp concentration',
    shlokaCount: 24
  },
  {
    id: 'sleep',
    label: 'Better Sleep',
    icon: 'moon-outline',
    color: '#B87333', // Copper for sleep warmth
    bgColor: 'bg-[#F9F0E6]',
    borderColor: 'border-[#E8D5C4]',
    description: 'Peaceful rest',
    shlokaCount: 12
  },
  {
    id: 'energy',
    label: 'Energy Boost',
    icon: 'flash-outline',
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Energize yourself',
    shlokaCount: 18
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    icon: 'sparkles-outline',
    color: '#14b8a6',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Feel thankful',
    shlokaCount: 16
  }
];

// Animated mood card component
const MoodCard = ({ mood, isSelected, onPress, index }: { 
  mood: MoodItem; 
  isSelected: boolean; 
  onPress: () => void;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="mr-3"
      >
        <View 
          className={`rounded-2xl p-4 border-2 ${
            isSelected 
              ? 'border-[#4A2E1C] bg-[#F5EDE8]' 
              : `${mood.bgColor} ${mood.borderColor}`
          }`}
          style={{ 
            width: 120,
            shadowColor: isSelected ? '#4A2E1C' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSelected ? 0.2 : 0.05,
            shadowRadius: 12,
            elevation: isSelected ? 8 : 2,
          }}
        >
          {/* Icon & Check */}
          <View className="flex-row items-center justify-between mb-2">
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${mood.color}15` }}
            >
              <Ionicons name={mood.icon} size={22} color={mood.color} />
            </View>
            {isSelected && (
              <View className="bg-[#4A2E1C] w-5 h-5 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
          
          {/* Label */}
          <Text 
            className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-[#5C3D2A]' : 'text-gray-800'}`}
            numberOfLines={1}
          >
            {mood.label}
          </Text>
          
          {/* Description */}
          <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
            {mood.description}
          </Text>
          
          {/* Count Badge */}
          <View className={`self-start px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#4A2E1C]' : 'bg-gray-100'}`}>
            <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
              {mood.shlokaCount} shlokas
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MoodFilters() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const selectedMoodData = moodData.find(m => m.id === selectedMood);
  const router = useRouter();

  const handleStartListening = () => {
    router.push('/heal');
  };

  return (
    <View className="py-6 bg-white">
      {/* Section Header with Featured Badge */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center">
            <View className="bg-[#DD7A1F] px-2.5 py-1 rounded-lg mr-2 flex-row items-center">
              <Ionicons name="heart-circle" size={12} color="white" />
              <Text className="text-white text-xs font-bold ml-1">USP</Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">Heal with Shlokas</Text>
          </View>
          <TouchableOpacity 
            onPress={handleStartListening}
            className="flex-row items-center"
          >
            <Text className="text-[#4A2E1C] text-sm font-semibold mr-1">View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#4A2E1C" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-500 text-sm">
          Choose your current mood & find the perfect shloka
        </Text>
      </View>

      {/* Mood Cards Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-4"
      >
        {moodData.map((mood, index) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            isSelected={selectedMood === mood.id}
            onPress={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Selected Mood Preview */}
      {selectedMoodData && (
        <View className="mx-5 bg-[#F3E4C8] rounded-2xl p-4 border border-[#E5D1AF]">
          <View className="flex-row items-center mb-3">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${selectedMoodData.color}20` }}
            >
              <Ionicons name={selectedMoodData.icon} size={24} color={selectedMoodData.color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base">
                {selectedMoodData.label} Shlokas
              </Text>
              <Text className="text-gray-600 text-xs">
                {selectedMoodData.shlokaCount} curated shlokas to {selectedMoodData.description.toLowerCase()}
              </Text>
            </View>
          </View>
          
          {/* Preview Cards */}
          <View className="flex-row mb-3">
            {[1, 2, 3].map((_, idx) => (
              <View 
                key={idx} 
                className="bg-white rounded-xl p-2 mr-2 flex-1 border border-gray-100"
              >
                <View className="flex-row items-center mb-1">
                  <Ionicons name="musical-note" size={10} color="#4A2E1C" />
                  <Text className="text-gray-400 text-xs ml-1">0:{30 + idx * 15}</Text>
                </View>
                <View className="h-1 bg-gray-100 rounded-full">
                  <View className={`h-full bg-[#B87333] rounded-full`} style={{ width: `${30 + idx * 25}%` }} />
                </View>
              </View>
            ))}
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-[#4A2E1C] flex-1 py-3 rounded-xl flex-row items-center justify-center mr-2"
              activeOpacity={0.8}
              onPress={handleStartListening}
            >
              <Ionicons name="play" size={18} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Start Listening</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-white border border-[#E8D9CF] px-4 py-3 rounded-xl items-center justify-center"
              activeOpacity={0.8}
              onPress={handleStartListening}
            >
              <Ionicons name="list" size={18} color="#4A2E1C" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Suggestion Text when no mood selected */}
      {!selectedMood && (
        <View className="mx-5 flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
          <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-2 flex-1">
            Select a mood above to discover shlokas that can help you feel better
          </Text>
        </View>
      )}
    </View>
  );
}
