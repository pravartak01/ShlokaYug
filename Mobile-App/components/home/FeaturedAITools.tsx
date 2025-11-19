import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  isNew?: boolean;
  features: string[];
}

const aiTools: AITool[] = [
  {
    id: 'composer',
    title: 'AI Composer',
    description: 'Generate authentic Sanskrit shlokas with perfect chandas',
    icon: 'sparkles',
    isPremium: true,
    isNew: true,
    features: ['Custom themes', 'Multiple meters', 'Instant generation']
  },
  {
    id: 'tagline',
    title: 'Tagline Generator',
    description: 'Create Sanskrit taglines for organizations & brands',
    icon: 'bulb',
    isPremium: true,
    features: ['Brand-specific', 'Cultural relevance', 'Professional']
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation Coach',
    description: 'AI-powered feedback with confidence scoring',
    icon: 'mic',
    isPremium: false,
    features: ['Real-time feedback', 'Accent training', 'Progress tracking']
  },
  {
    id: 'meter-detection',
    title: 'Meter Detection',
    description: 'Detect chandas pattern from audio recordings',
    icon: 'analytics',
    isPremium: true,
    features: ['Audio upload', 'Pattern analysis', 'Instant results']
  }
];

export default function FeaturedAITools() {
  return (
    <View className="px-6 mt-8 mb-4">
      {/* Section Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="sparkles" size={20} color="#f97316" />
              <Text className="text-ancient-800 text-xl font-bold ml-2">AI Tools for You</Text>
            </View>
            <Text className="text-ancient-600 text-sm">
              Powerful AI features to enhance your learning
            </Text>
          </View>
        </View>
        
        {/* Premium Badge */}
        <View className="bg-saffron-50 rounded-xl border border-saffron-200 p-3 flex-row items-center">
          <View className="bg-saffron-500 p-1.5 rounded-full mr-3">
            <Ionicons name="diamond" size={14} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-saffron-800 font-semibold text-xs">
              Unlock all AI tools with Premium
            </Text>
          </View>
          <TouchableOpacity className="bg-saffron-500 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">Upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Tools Grid (2 columns) */}
      <View className="flex-row flex-wrap justify-between">
        {aiTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            className="w-[48%] mb-4"
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-2xl border border-ancient-200 overflow-hidden">
              {/* Header with Icon */}
              <View className="bg-saffron-50 px-4 pt-4 pb-3">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="bg-saffron-500 w-12 h-12 rounded-xl items-center justify-center">
                    <Ionicons name={tool.icon as any} size={24} color="white" />
                  </View>
                  
                  {/* Badges */}
                  <View className="flex-col items-end">
                    {tool.isNew && (
                      <View className="bg-saffron-500 px-2 py-0.5 rounded-full mb-1">
                        <Text className="text-white text-xs font-bold">NEW</Text>
                      </View>
                    )}
                    {tool.isPremium && (
                      <View className="bg-ancient-200 px-2 py-0.5 rounded-full flex-row items-center">
                        <Ionicons name="diamond" size={8} color="#996f0a" />
                        <Text className="text-ancient-700 text-xs font-bold ml-1">PRO</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Content */}
              <View className="p-4">
                <Text className="text-ancient-800 font-bold text-base mb-2">
                  {tool.title}
                </Text>
                <Text className="text-ancient-600 text-xs leading-5 mb-3">
                  {tool.description}
                </Text>

                {/* Features */}
                <View className="mb-3">
                  {tool.features.slice(0, 2).map((feature, idx) => (
                    <View key={idx} className="flex-row items-center mb-1.5">
                      <View className="w-1 h-1 bg-saffron-500 rounded-full mr-2" />
                      <Text className="text-ancient-600 text-xs flex-1">{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Button */}
              <View className="px-4 pb-4">
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-xl"
                >
                  <View className="py-2.5 flex-row items-center justify-center">
                    <Text className="text-white font-bold text-xs">
                      {tool.isPremium ? 'Try Premium' : 'Start Now'}
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color="white" className="ml-1" />
                  </View>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* View All AI Tools */}
      <TouchableOpacity className="bg-ancient-100 rounded-xl border border-ancient-200 py-3 mt-2">
        <View className="flex-row items-center justify-center">
          <Ionicons name="grid" size={16} color="#996f0a" />
          <Text className="text-ancient-800 font-semibold text-sm ml-2">
            View All AI Tools
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
