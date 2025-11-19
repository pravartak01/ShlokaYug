import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ENHANCED_CHANDAS_PATTERNS } from '../../data/enhancedData';

export default function LearnScreen() {
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [learningProgress] = useState<Record<string, number>>({
    gayatri: 75,
    anushtubh: 45,
  });

  const handlePatternPress = (pattern: any) => {
    setSelectedPattern(pattern);
    setShowModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'leaf';
      case 'intermediate': return 'flash';
      case 'advanced': return 'flame';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-br from-ancient-600 to-ancient-700 px-6 pt-12 pb-8 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">
                📚 Sacred Learning
              </Text>
              <Text className="text-white/90 text-base mt-1">
                Master the ancient art of Sanskrit prosody
              </Text>
            </View>
            <View className="bg-white/20 p-3 rounded-full">
              <Ionicons name="school" size={24} color="white" />
            </View>
          </View>

          {/* Progress Overview */}
          <View className="bg-white/10 p-4 rounded-2xl">
            <Text className="text-white/80 text-sm mb-2">🎯 Learning Progress</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{ENHANCED_CHANDAS_PATTERNS.length}</Text>
                <Text className="text-white/90 text-xs">Meters to Master</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">2</Text>
                <Text className="text-white/90 text-xs">In Progress</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">60%</Text>
                <Text className="text-white/90 text-xs">Avg Progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chandas Patterns List */}
        <View className="px-6 mt-6">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Chandas Patterns</Text>
          
          {ENHANCED_CHANDAS_PATTERNS.map((pattern) => (
            <TouchableOpacity
              key={pattern.id}
              onPress={() => handlePatternPress(pattern)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200 mb-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-ancient-800 text-lg font-bold mr-3">
                      {pattern.name}
                    </Text>
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: getDifficultyColor(pattern.difficulty) + '20' }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={getDifficultyIcon(pattern.difficulty) as any} 
                          size={12} 
                          color={getDifficultyColor(pattern.difficulty)} 
                        />
                        <Text 
                          className="text-xs font-medium ml-1"
                          style={{ color: getDifficultyColor(pattern.difficulty) }}
                        >
                          {pattern.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text className="text-ancient-600 text-base mb-2">
                    {pattern.nameDevanagari}
                  </Text>
                  
                  <Text className="text-ancient-500 text-sm mb-3 leading-5">
                    {pattern.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="musical-notes" size={14} color="#f97316" />
                      <Text className="text-ancient-600 text-sm ml-1">
                        {pattern.syllableCount} syllables
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="grid" size={14} color="#f97316" />
                      <Text className="text-ancient-600 text-sm ml-1">
                        {pattern.pattern}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View className="ml-4 items-center">
                  {learningProgress[pattern.id] ? (
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-full border-4 border-saffron-200 items-center justify-center mb-1">
                        <Text className="text-saffron-600 text-xs font-bold">
                          {learningProgress[pattern.id]}%
                        </Text>
                      </View>
                      <Text className="text-saffron-600 text-xs font-medium">
                        Progress
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-full bg-ancient-100 items-center justify-center mb-1">
                        <Ionicons name="play" size={20} color="#996f0a" />
                      </View>
                      <Text className="text-ancient-600 text-xs">
                        Start
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Quick Preview */}
              <View className="bg-ancient-50 p-3 rounded-xl mt-3">
                <Text className="text-ancient-600 text-xs mb-1">Example:</Text>
                <Text className="text-ancient-700 text-sm font-medium">
                  {pattern.examples[0]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Study Tips */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Study Tips</Text>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200">
            <View className="flex-row items-start mb-3">
              <Ionicons name="bulb" size={20} color="#f97316" />
              <Text className="text-ancient-800 font-semibold text-base ml-3 flex-1">
                Master the Basics First
              </Text>
            </View>
            <Text className="text-ancient-600 text-sm leading-5 ml-8">
              Start with Gayatri meter - it&apos;s the foundation of Sanskrit prosody and will help you understand rhythm patterns.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Pattern Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView className="flex-1 bg-ancient-50" edges={['top']}>
          <View className="flex-row items-center justify-between p-6 border-b border-ancient-200">
            <Text className="text-ancient-800 text-xl font-bold">
              {selectedPattern?.name} Details
            </Text>
            <TouchableOpacity 
              onPress={() => setShowModal(false)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#5c4106" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-6">
            {selectedPattern && (
              <View>
                <Text className="text-ancient-800 text-lg font-bold mb-2">
                  {selectedPattern.nameDevanagari}
                </Text>
                
                <Text className="text-ancient-600 text-base mb-4 leading-6">
                  {selectedPattern.description}
                </Text>

                {/* Characteristics */}
                <View className="mb-6">
                  <Text className="text-ancient-800 font-semibold text-base mb-3">
                    Characteristics
                  </Text>
                  {selectedPattern.characteristics.map((char: string, index: number) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text className="text-ancient-600 text-sm ml-2">{char}</Text>
                    </View>
                  ))}
                </View>

                {/* Musical Properties */}
                <View className="mb-6">
                  <Text className="text-ancient-800 font-semibold text-base mb-3">
                    Musical Properties
                  </Text>
                  <View className="bg-white p-4 rounded-xl">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-ancient-600 text-sm">Tempo:</Text>
                      <Text className="text-ancient-800 text-sm font-medium">
                        {selectedPattern.musicalProperties.tempo}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-ancient-600 text-sm">Mood:</Text>
                      <Text className="text-ancient-800 text-sm font-medium">
                        {selectedPattern.musicalProperties.mood}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-ancient-600 text-sm">Raga:</Text>
                      <Text className="text-ancient-800 text-sm font-medium">
                        {selectedPattern.musicalProperties.raga}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Examples */}
                <View className="mb-6">
                  <Text className="text-ancient-800 font-semibold text-base mb-3">
                    Examples
                  </Text>
                  {selectedPattern.examples.map((example: string, index: number) => (
                    <View key={index} className="bg-ancient-100 p-4 rounded-xl mb-3">
                      <Text className="text-ancient-800 text-base font-medium">
                        {example}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-4">
                  <TouchableOpacity className="flex-1 bg-saffron-500 p-4 rounded-xl">
                    <Text className="text-white text-center font-semibold">
                      Start Learning
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-ancient-200 p-4 rounded-xl">
                    <Text className="text-ancient-800 text-center font-semibold">
                      Practice
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}