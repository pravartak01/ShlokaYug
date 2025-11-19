import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ENHANCED_ACHIEVEMENTS } from '../../data/enhancedData';

export default function ProfileScreen() {
  const [user] = useState({
    name: 'Sanskrit Scholar',
    email: 'scholar@sanskrit.com',
    avatar: '🙏',
    joinDate: '2024-01-15',
    level: 'Intermediate',
    nextLevel: 'Advanced'
  });

  const [stats] = useState({
    shlokasCompleted: 47,
    accuracy: 87,
    streakDays: 12,
    totalTime: 145,
    practiceMinutes: 1250,
    perfectSessions: 23,
    favoriteChanda: 'Gayatri'
  });

  const profileSections = [
    {
      title: 'Learning Progress',
      items: [
        { label: 'Current Level', value: user.level, icon: 'school' },
        { label: 'Shlokas Mastered', value: stats.shlokasCompleted, icon: 'book' },
        { label: 'Average Accuracy', value: `${stats.accuracy}%`, icon: 'target' },
        { label: 'Study Streak', value: `${stats.streakDays} days`, icon: 'flame' }
      ]
    },
    {
      title: 'Practice Statistics',
      items: [
        { label: 'Total Practice Time', value: `${stats.practiceMinutes} min`, icon: 'time' },
        { label: 'Perfect Sessions', value: stats.perfectSessions, icon: 'trophy' },
        { label: 'Favorite Chanda', value: stats.favoriteChanda, icon: 'musical-note' },
        { label: 'Sessions This Week', value: '8', icon: 'calendar' }
      ]
    }
  ];

  const settingsOptions = [
    {
      title: 'Notifications',
      subtitle: 'Daily reminders and updates',
      icon: 'notifications',
      hasToggle: true,
      enabled: true
    },
    {
      title: 'Audio Settings',
      subtitle: 'Voice and pronunciation preferences',
      icon: 'volume-high',
      hasToggle: false
    },
    {
      title: 'Learning Preferences',
      subtitle: 'Customize your learning experience',
      icon: 'settings',
      hasToggle: false
    },
    {
      title: 'Community Settings',
      subtitle: 'Privacy and contribution settings',
      icon: 'people',
      hasToggle: false
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle',
      hasToggle: false
    }
  ];

  const recentAchievements = ENHANCED_ACHIEVEMENTS.slice(0, 3);

  const getLevelProgress = () => {
    // Simulate progress to next level
    const current = 850;
    const nextLevelRequirement = 1000;
    return (current / nextLevelRequirement) * 100;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-gradient-to-br from-ancient-600 to-ancient-800 px-6 pt-12 pb-8 rounded-b-3xl">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">{user.avatar}</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-1">
              {user.name}
            </Text>
            <Text className="text-white/90 text-base">
              {user.email}
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full mt-2">
              <Text className="text-white text-sm font-medium">
                {user.level} Scholar
              </Text>
            </View>
          </View>

          {/* Level Progress */}
          <View className="bg-white/10 p-4 rounded-2xl">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/80 text-sm">Progress to {user.nextLevel}</Text>
              <Text className="text-white/80 text-sm">{Math.round(getLevelProgress())}%</Text>
            </View>
            <View className="bg-white/20 h-2 rounded-full">
              <View 
                className="bg-white h-2 rounded-full"
                style={{ width: `${getLevelProgress()}%` }}
              />
            </View>
            <Text className="text-white/70 text-xs mt-1 text-center">
              150 more points needed
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mt-6">
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%] mb-4">
              <View className="items-center">
                <Ionicons name="book" size={24} color="#f97316" />
                <Text className="text-2xl font-bold text-saffron-600 mt-2">
                  {stats.shlokasCompleted}
                </Text>
                <Text className="text-ancient-600 text-sm text-center">
                  Shlokas Completed
                </Text>
              </View>
            </View>

            <View className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 w-[48%] mb-4">
              <View className="items-center">
                <Ionicons name="flame" size={24} color="#f97316" />
                <Text className="text-2xl font-bold text-saffron-600 mt-2">
                  {stats.streakDays}
                </Text>
                <Text className="text-ancient-600 text-sm text-center">
                  Day Streak
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        <View className="px-6 mt-6">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentAchievements.map((achievement) => (
              <View 
                key={achievement.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 mr-4 w-40"
              >
                <View className="items-center">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: getRarityColor(achievement.rarity) + '20' }}
                  >
                    <Text className="text-2xl">{achievement.icon}</Text>
                  </View>
                  <Text className="text-ancient-800 font-semibold text-sm text-center mb-1">
                    {achievement.name}
                  </Text>
                  <Text className="text-ancient-600 text-xs text-center">
                    {achievement.description}
                  </Text>
                  <View 
                    className="px-2 py-1 rounded-full mt-2"
                    style={{ backgroundColor: getRarityColor(achievement.rarity) + '20' }}
                  >
                    <Text 
                      className="text-xs font-medium"
                      style={{ color: getRarityColor(achievement.rarity) }}
                    >
                      {achievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-6 mt-6">
            <Text className="text-ancient-800 text-xl font-bold mb-4">
              {section.title}
            </Text>
            <View className="bg-white rounded-2xl shadow-sm border border-ancient-200">
              {section.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex}
                  className={`flex-row items-center justify-between p-4 ${
                    itemIndex < section.items.length - 1 ? 'border-b border-ancient-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={item.icon as any} size={20} color="#f97316" />
                    <Text className="text-ancient-800 text-base ml-3">
                      {item.label}
                    </Text>
                  </View>
                  <Text className="text-ancient-600 font-medium">
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Settings */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-ancient-800 text-xl font-bold mb-4">Settings</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-ancient-200">
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between p-4 ${
                  index < settingsOptions.length - 1 ? 'border-b border-ancient-100' : ''
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-saffron-100 p-2 rounded-lg mr-3">
                    <Ionicons name={option.icon as any} size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-ancient-800 text-base font-medium">
                      {option.title}
                    </Text>
                    <Text className="text-ancient-600 text-sm">
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
                
                {option.hasToggle ? (
                  <View className={`w-12 h-6 rounded-full ${option.enabled ? 'bg-saffron-500' : 'bg-ancient-300'}`}>
                    <View className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all ${option.enabled ? 'ml-6' : 'ml-0.5'}`} />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#996f0a" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity className="bg-red-500 p-4 rounded-2xl mt-6">
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}