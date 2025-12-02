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

const actionStyles: { [key: string]: { bg: string; iconBg: string; icon: string; border: string } } = {
  heal: { bg: 'bg-[#F5EDE8]', iconBg: 'bg-[#855332]', icon: '#ffffff', border: 'border-[#E8D9CF]' },
  analyze: { bg: 'bg-slate-50', iconBg: 'bg-slate-800', icon: '#ffffff', border: 'border-slate-100' },
  karaoke: { bg: 'bg-purple-50', iconBg: 'bg-purple-500', icon: '#ffffff', border: 'border-purple-100' },
  speech: { bg: 'bg-blue-50', iconBg: 'bg-blue-500', icon: '#ffffff', border: 'border-blue-100' },
  'ai-tools': { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', icon: '#ffffff', border: 'border-emerald-100' },
  games: { bg: 'bg-orange-50', iconBg: 'bg-orange-500', icon: '#ffffff', border: 'border-orange-100' },
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
              <Text className="text-white text-[8px] font-bold">
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
            className="font-semibold text-xs text-gray-900 mb-0.5" 
            numberOfLines={2}
          >
            {action.title}
          </Text>
          
          {/* Subtitle */}
          <Text 
            className="text-[10px] text-gray-500" 
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
          <Text className="text-gray-900 text-lg font-bold">Quick Actions</Text>
          <Text className="text-gray-500 text-sm mt-0.5">Explore our core features</Text>
        </View>
        <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
          <Ionicons name="grid-outline" size={12} color="#6b7280" />
          <Text className="text-gray-600 text-xs font-medium ml-1.5">{quickActionsData.length} tools</Text>
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
