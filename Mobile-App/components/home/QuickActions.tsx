import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  featured?: boolean;
}

interface QuickActionsProps {
  onAnalyze?: () => void;
  onHeal?: () => void;
  onKaraoke?: () => void;
  onSpeech?: () => void;
  onGames?: () => void;
  onAI?: () => void;
}

// All USPs of the application
const quickActionsData: QuickAction[] = [
  {
    id: 'heal',
    title: 'Heal with Shlokas',
    subtitle: 'Mood-based therapy',
    icon: 'heart-circle',
    featured: true,
  },
  {
    id: 'analyze',
    title: 'Analyze Shloka',
    subtitle: 'Chandas detection',
    icon: 'scan-outline',
  },
  {
    id: 'karaoke',
    title: 'Divine Karaoke',
    subtitle: 'Sing along',
    icon: 'musical-notes-outline',
  },
  {
    id: 'speech',
    title: 'Voice Coach',
    subtitle: 'AI pronunciation',
    icon: 'mic-outline',
    badge: 'AI',
  },
  {
    id: 'ai-tools',
    title: 'AI Composer',
    subtitle: 'Create shlokas',
    icon: 'sparkles-outline',
    badge: 'NEW',
  },
  {
    id: 'games',
    title: 'Sanskrit Games',
    subtitle: 'Fun learning',
    icon: 'game-controller-outline',
  },
];

const CARD_WIDTH = 120; // Uniform card width

// Brighter color scheme with Gold/Saffron/Copper highlights and vintage brown theme
const actionStyles: { [key: string]: { bg: string; iconBg: string; icon: string; border: string } } = {
  heal: { bg: 'bg-[#FEF3E8]', iconBg: 'bg-[#DD7A1F]', icon: '#ffffff', border: 'border-[#FCDFC2]' }, // Saffron - key feature
  analyze: { bg: 'bg-[#F3E4C8]', iconBg: 'bg-[#4A2E1C]', icon: '#ffffff', border: 'border-[#E5D1AF]' }, // Vintage brown
  karaoke: { bg: 'bg-[#F9F0E6]', iconBg: 'bg-[#B87333]', icon: '#ffffff', border: 'border-[#E8D5C4]' }, // Copper
  speech: { bg: 'bg-[#FDF8E8]', iconBg: 'bg-[#D4A017]', icon: '#ffffff', border: 'border-[#F0E4C0]' }, // Gold
  'ai-tools': { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', icon: '#ffffff', border: 'border-emerald-100' }, // Keep green for AI
  games: { bg: 'bg-red-50', iconBg: 'bg-red-500', icon: '#ffffff', border: 'border-red-100' }, // Bright red for games
};

// Animated card component for subtle entrance animation
const AnimatedCard = ({ action, index, onPress }: { action: QuickAction; index: number; onPress?: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  const styles = actionStyles[action.id] || actionStyles.analyze;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        className="mr-3"
        activeOpacity={0.7}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View 
          className={`${styles.bg} rounded-2xl p-4 border ${styles.border}`} 
          style={{ width: CARD_WIDTH }}
        >
          {/* Badge */}
          {action.badge && (
            <View 
              className={`absolute top-2 right-2 px-1.5 py-0.5 rounded ${
                action.badge === 'AI' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            >
              <Text className="text-white text-[8px] font-poppins-bold">
                {action.badge}
              </Text>
            </View>
          )}

          {/* Icon */}
          <View className={`w-10 h-10 ${styles.iconBg} rounded-xl items-center justify-center mb-2`}>
            <Ionicons name={action.icon as any} size={20} color={styles.icon} />
          </View>
          
          {/* Title */}
          <Text 
            className="font-poppins-semibold text-xs text-gray-900 mb-0.5" 
            numberOfLines={2}
          >
            {action.title}
          </Text>
          
          {/* Subtitle */}
          <Text 
            className="text-[10px] text-gray-500 font-poppins" 
            numberOfLines={1}
          >
            {action.subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function QuickActions({ onAnalyze, onHeal, onKaraoke, onSpeech, onGames, onAI }: QuickActionsProps) {
  const getActionHandler = (id: string) => {
    switch (id) {
      case 'heal': return onHeal;
      case 'analyze': return onAnalyze;
      case 'karaoke': return onKaraoke;
      case 'speech': return onSpeech;
      case 'ai-tools': return onAI;
      case 'games': return onGames;
      default: return undefined;
    }
  };

  return (
    <View className="py-5 bg-white">
      {/* Section Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-900 text-lg font-playfair-bold">Quick Actions</Text>
          <Text className="text-gray-500 text-sm mt-0.5 font-poppins">Explore our core features</Text>
        </View>
        <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
          <Ionicons name="grid-outline" size={12} color="#6b7280" />
          <Text className="text-gray-600 text-xs font-poppins-medium ml-1.5">{quickActionsData.length} tools</Text>
        </View>
      </View>

      {/* Horizontal Scroll Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {quickActionsData.map((action, index) => (
          <AnimatedCard 
            key={action.id} 
            action={action} 
            index={index}
            onPress={getActionHandler(action.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
