import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  isNew?: boolean;
  bgColor: string;
  iconColor: string;
}

const aiTools: AITool[] = [
  {
    id: 'composer',
    title: 'AI Composer',
    description: 'Generate Sanskrit shlokas',
    icon: 'sparkles',
    isPremium: true,
    isNew: true,
    bgColor: 'bg-purple-500',
    iconColor: '#ffffff'
  },
  {
    id: 'tagline',
    title: 'Tagline Generator',
    description: 'Create Sanskrit taglines',
    icon: 'bulb',
    isPremium: true,
    bgColor: 'bg-blue-500',
    iconColor: '#ffffff'
  },
  {
    id: 'pronunciation',
    title: 'Voice Coach',
    description: 'AI pronunciation feedback',
    icon: 'mic',
    isPremium: false,
    bgColor: 'bg-green-500',
    iconColor: '#ffffff'
  },
  {
    id: 'meter-detection',
    title: 'Meter Detection',
    description: 'Detect chandas patterns',
    icon: 'analytics',
    isPremium: true,
    bgColor: 'bg-[#855332]',
    iconColor: '#ffffff'
  }
];

export default function FeaturedAITools() {
  return (
    <View className="py-6 bg-white">
      {/* Section Header */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center mb-1">
          <Ionicons name="sparkles" size={18} color="#855332" />
          <Text className="text-gray-900 text-lg font-bold ml-2">AI-Powered Tools</Text>
        </View>
        <Text className="text-gray-500 text-sm">Enhance your learning experience</Text>
      </View>

      {/* Tools Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {aiTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            className="mr-3"
            activeOpacity={0.8}
          >
            <View 
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ 
                width: 160,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Header */}
              <View className={`${tool.bgColor} p-4`}>
                <View className="flex-row items-start justify-between">
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Ionicons name={tool.icon as any} size={24} color={tool.iconColor} />
                  </View>
                  <View className="flex-col items-end">
                    {tool.isNew && (
                      <View className="bg-white px-2 py-0.5 rounded-full mb-1">
                        <Text className="text-gray-900 text-xs font-bold">NEW</Text>
                      </View>
                    )}
                    {tool.isPremium && (
                      <View className="bg-white/20 px-2 py-0.5 rounded-full flex-row items-center">
                        <Ionicons name="diamond" size={8} color="white" />
                        <Text className="text-white text-xs font-bold ml-1">PRO</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Content */}
              <View className="p-4">
                <Text className="text-gray-900 font-bold text-sm mb-1">{tool.title}</Text>
                <Text className="text-gray-500 text-xs leading-4">{tool.description}</Text>
                
                <TouchableOpacity className="mt-3 bg-gray-50 rounded-lg py-2">
                  <Text className="text-gray-700 text-xs font-semibold text-center">
                    {tool.isPremium ? 'Try Premium' : 'Start Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Upgrade Banner */}
      <View className="mx-5 mt-4 bg-[#F5EDE8] rounded-xl p-4 flex-row items-center border border-[#E8D9CF]">
        <View className="bg-[#855332] w-10 h-10 rounded-xl items-center justify-center mr-3">
          <Ionicons name="diamond" size={18} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-sm">Unlock All AI Tools</Text>
          <Text className="text-gray-500 text-xs">Get premium for full access</Text>
        </View>
        <TouchableOpacity className="bg-[#855332] px-4 py-2 rounded-xl">
          <Text className="text-white text-xs font-bold">Upgrade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
