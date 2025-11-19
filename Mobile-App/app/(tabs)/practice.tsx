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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ENHANCED_SHLOKAS } from '../../data/enhancedData';

export default function PracticeScreen() {
  const [showKaraokeModal, setShowKaraokeModal] = useState(false);
  const [currentShloka] = useState(ENHANCED_SHLOKAS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [karaokeProgress, setKaraokeProgress] = useState(0);

  const practiceFeatures = [
    {
      id: 'karaoke',
      title: 'Divine Karaoke 🎵',
      subtitle: 'Sing along with perfect timing',
      description: 'Practice pronunciation and rhythm with our enhanced karaoke system',
      icon: 'musical-notes',
      color: '#d946ef',
      action: () => setShowKaraokeModal(true)
    },
    {
      id: 'speech',
      title: 'Voice Analysis 🎤',
      subtitle: 'AI-powered pronunciation coach',
      description: 'Get real-time feedback on your Sanskrit pronunciation',
      icon: 'mic',
      color: '#10b981',
      action: () => console.log('Speech Analysis')
    },
    {
      id: 'rhythm',
      title: 'Rhythm Training 🥁',
      subtitle: 'Master the beat patterns',
      description: 'Learn the musical aspects of different chandas meters',
      icon: 'pulse',
      color: '#f59e0b',
      action: () => console.log('Rhythm Training')
    },
    {
      id: 'identify',
      title: 'Meter Identification 🔍',
      subtitle: 'Test your chandas knowledge',
      description: 'Identify the meter patterns in various Sanskrit verses',
      icon: 'search',
      color: '#ef4444',
      action: () => console.log('Meter Identification')
    }
  ];

  const quickPractice = [
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      subtitle: '5 minutes of focused practice',
      icon: 'trophy',
      streak: 12
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation Drill',
      subtitle: 'Perfect your Sanskrit sounds',
      icon: 'volume-high',
      completed: 7
    },
    {
      id: 'rhythm-game',
      title: 'Rhythm Game',
      subtitle: 'Fun way to learn meters',
      icon: 'game-controller',
      score: 1250
    }
  ];

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control audio playback
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setKaraokeProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#f97316', '#ea580c', '#c2410c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-12 pb-8 rounded-b-3xl"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">
                🎯 Practice Hub
              </Text>
              <Text className="text-white/90 text-base mt-1">
                Enhance your Sanskrit skills with interactive practice
              </Text>
            </View>
            <View className="bg-white/20 p-3 rounded-full">
              <Ionicons name="fitness" size={24} color="white" />
            </View>
          </View>

          {/* Practice Stats */}
          <View className="bg-white/10 p-4 rounded-2xl">
            <Text className="text-white/80 text-sm mb-2">📊 Today&apos;s Progress</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">15</Text>
                <Text className="text-white/90 text-xs">Minutes</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">3</Text>
                <Text className="text-white/90 text-xs">Sessions</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">92%</Text>
                <Text className="text-white/90 text-xs">Accuracy</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Practice */}
        <View className="px-6 mt-6">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Quick Practice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {quickPractice.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 mr-4 w-40"
                activeOpacity={0.7}
              >
                <View className="items-center mb-3">
                  <View className="bg-saffron-100 p-3 rounded-full mb-2">
                    <Ionicons name={item.icon as any} size={24} color="#f97316" />
                  </View>
                  <Text className="text-ancient-800 font-semibold text-sm text-center">
                    {item.title}
                  </Text>
                  <Text className="text-ancient-600 text-xs text-center mt-1">
                    {item.subtitle}
                  </Text>
                </View>
                
                <View className="items-center">
                  {item.streak && (
                    <Text className="text-saffron-600 text-xs font-bold">
                      🔥 {item.streak} day streak
                    </Text>
                  )}
                  {item.completed && (
                    <Text className="text-green-600 text-xs font-bold">
                      ✅ {item.completed}/10 completed
                    </Text>
                  )}
                  {item.score && (
                    <Text className="text-blue-600 text-xs font-bold">
                      🏆 {item.score} points
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Practice Features */}
        <View className="px-6">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Practice Features</Text>
          
          {practiceFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              onPress={feature.action}
              className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200 mb-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start">
                <View 
                  className="p-3 rounded-xl mr-4"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Ionicons 
                    name={feature.icon as any} 
                    size={24} 
                    color={feature.color} 
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-ancient-800 text-lg font-bold mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-ancient-600 text-sm mb-2">
                    {feature.subtitle}
                  </Text>
                  <Text className="text-ancient-500 text-sm leading-5">
                    {feature.description}
                  </Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#996f0a" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Practice */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Recent Practice</Text>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-saffron-600 font-semibold text-base">
                {currentShloka.source}
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-medium">
                  COMPLETED
                </Text>
              </View>
            </View>
            
            <Text className="text-ancient-800 text-base font-medium mb-2">
              {currentShloka.devanagari.split('\n')[0]}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="musical-note" size={14} color="#f97316" />
                <Text className="text-ancient-600 text-sm ml-1">
                  {currentShloka.chandas.name}
                </Text>
              </View>
              <Text className="text-ancient-500 text-xs">
                Practiced 2 hours ago
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Karaoke Modal */}
      <Modal
        visible={showKaraokeModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowKaraokeModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-600 to-indigo-700" edges={['top']}>
          <View className="flex-row items-center justify-between p-6">
            <Text className="text-white text-xl font-bold">
              🎵 Divine Karaoke
            </Text>
            <TouchableOpacity 
              onPress={() => setShowKaraokeModal(false)}
              className="bg-white/20 p-2 rounded-full"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 justify-center px-6">
            {/* Shloka Display */}
            <View className="bg-white/10 p-6 rounded-3xl mb-8">
              <Text className="text-white/80 text-center text-sm mb-4">
                {currentShloka.source}
              </Text>
              <Text className="text-white text-center text-xl font-bold leading-8 mb-4">
                {currentShloka.devanagari}
              </Text>
              <Text className="text-white/90 text-center text-base">
                {currentShloka.translation}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="mb-8">
              <View className="bg-white/20 h-2 rounded-full">
                <View 
                  className="bg-white h-2 rounded-full transition-all duration-100"
                  style={{ width: `${karaokeProgress}%` }}
                />
              </View>
              <Text className="text-white/80 text-center text-sm mt-2">
                {Math.round(karaokeProgress)}% Complete
              </Text>
            </View>

            {/* Controls */}
            <View className="flex-row items-center justify-center space-x-8">
              <TouchableOpacity className="bg-white/20 p-4 rounded-full">
                <Ionicons name="play-skip-back" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={togglePlayback}
                className="bg-white p-4 rounded-full"
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="#7c3aed" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity className="bg-white/20 p-4 rounded-full">
                <Ionicons name="play-skip-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Settings */}
            <View className="flex-row justify-center mt-8 space-x-6">
              <TouchableOpacity className="bg-white/20 p-3 rounded-full">
                <Ionicons name="volume-medium" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white/20 p-3 rounded-full">
                <Ionicons name="settings" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white/20 p-3 rounded-full">
                <Ionicons name="repeat" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}