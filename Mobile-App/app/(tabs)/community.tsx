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

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('contributions');

  const communityStats = {
    totalContributors: 1247,
    totalShlokas: 3456,
    totalVotes: 12890,
    activeModerators: 15,
    verifiedShlokas: 2897,
    pendingReview: 89
  };

  const leaderboard = [
    { rank: 1, name: 'Sanskrit Master', points: 2847, avatar: '👑', contributions: 145 },
    { rank: 2, name: 'Prosody Expert', points: 2156, avatar: '🏆', contributions: 123 },
    { rank: 3, name: 'Vedic Scholar', points: 1892, avatar: '📚', contributions: 98 },
    { rank: 4, name: 'Chandas Guru', points: 1567, avatar: '🎵', contributions: 87 },
    { rank: 5, name: 'Sanskrit Seeker', points: 1234, avatar: '🙏', contributions: 76 }
  ];

  const recentContributions = [
    {
      id: 1,
      user: 'Vedic Scholar',
      avatar: '📚',
      shloka: 'नमो नमः शिवायाह्म',
      source: 'Shiva Mahimna Stotra',
      timeAgo: '2 hours ago',
      votes: 15,
      status: 'verified'
    },
    {
      id: 2,
      user: 'Sanskrit Master',
      avatar: '👑',
      shloka: 'अहं ब्रह्मास्मि',
      source: 'Brihadaranyaka Upanishad',
      timeAgo: '5 hours ago',
      votes: 23,
      status: 'approved'
    },
    {
      id: 3,
      user: 'Prosody Expert',
      avatar: '🏆',
      shloka: 'सत्यं शिवं सुन्दरम्',
      source: 'Traditional',
      timeAgo: '1 day ago',
      votes: 18,
      status: 'pending'
    }
  ];

  const communityGuidelines = [
    {
      title: 'Authenticity First',
      description: 'Only submit verified Sanskrit verses with proper sources',
      icon: 'shield-checkmark'
    },
    {
      title: 'Respectful Discourse',
      description: 'Maintain cultural sensitivity and scholarly respect',
      icon: 'heart'
    },
    {
      title: 'Collaborative Spirit',
      description: 'Help others learn and grow in their Sanskrit journey',
      icon: 'people'
    },
    {
      title: 'Quality Over Quantity',
      description: 'Focus on accurate and well-researched contributions',
      icon: 'star'
    }
  ];

  const tabs = [
    { id: 'contributions', label: 'Contributions', icon: 'library' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
    { id: 'guidelines', label: 'Guidelines', icon: 'information-circle' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'approved': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'approved': return 'thumbs-up';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-br from-lotus-500 to-lotus-700 px-6 pt-12 pb-8 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">
                🤝 Sangha Community
              </Text>
              <Text className="text-white/90 text-base mt-1">
                Preserve Sanskrit knowledge together
              </Text>
            </View>
            <TouchableOpacity className="bg-white/20 p-3 rounded-full">
              <Ionicons name="add-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Community Stats */}
          <View className="bg-white/10 p-4 rounded-2xl">
            <Text className="text-white/80 text-sm mb-2">📊 Community Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {communityStats.totalContributors.toLocaleString()}
                </Text>
                <Text className="text-white/90 text-xs">Contributors</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {communityStats.totalShlokas.toLocaleString()}
                </Text>
                <Text className="text-white/90 text-xs">Shlokas</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {communityStats.verifiedShlokas.toLocaleString()}
                </Text>
                <Text className="text-white/90 text-xs">Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 mt-6">
          <View className="flex-row bg-white rounded-2xl p-2 shadow-sm border border-ancient-200">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${
                  activeTab === tab.id ? 'bg-saffron-500' : ''
                }`}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={activeTab === tab.id ? 'white' : '#996f0a'} 
                />
                <Text 
                  className={`ml-2 text-sm font-medium ${
                    activeTab === tab.id ? 'text-white' : 'text-ancient-600'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 mt-6 mb-8">
          {activeTab === 'contributions' && (
            <View>
              <Text className="text-ancient-800 text-xl font-bold mb-4">
                Recent Contributions
              </Text>
              {recentContributions.map((contribution) => (
                <View 
                  key={contribution.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200 mb-4"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="bg-ancient-100 p-2 rounded-full mr-3">
                        <Text className="text-lg">{contribution.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-ancient-800 font-semibold text-base">
                          {contribution.user}
                        </Text>
                        <Text className="text-ancient-500 text-sm">
                          {contribution.timeAgo}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={getStatusIcon(contribution.status) as any}
                        size={16} 
                        color={getStatusColor(contribution.status)} 
                      />
                      <Text 
                        className="text-xs font-medium ml-1"
                        style={{ color: getStatusColor(contribution.status) }}
                      >
                        {contribution.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-ancient-50 p-4 rounded-xl mb-3">
                    <Text className="text-ancient-800 text-base font-medium mb-1">
                      {contribution.shloka}
                    </Text>
                    <Text className="text-ancient-600 text-sm">
                      Source: {contribution.source}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-4">
                      <TouchableOpacity className="flex-row items-center">
                        <Ionicons name="heart" size={16} color="#f97316" />
                        <Text className="text-ancient-600 text-sm ml-1">
                          {contribution.votes}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center">
                        <Ionicons name="chatbubble" size={16} color="#f97316" />
                        <Text className="text-ancient-600 text-sm ml-1">
                          Discuss
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="bookmark" size={16} color="#996f0a" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'leaderboard' && (
            <View>
              <Text className="text-ancient-800 text-xl font-bold mb-4">
                Top Contributors
              </Text>
              {leaderboard.map((user) => (
                <View 
                  key={user.rank}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-ancient-200 mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-saffron-100 rounded-full items-center justify-center mr-4">
                      <Text className="text-lg">{user.avatar}</Text>
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-ancient-800 font-semibold text-base mr-2">
                          #{user.rank}
                        </Text>
                        <Text className="text-ancient-700 font-medium text-base">
                          {user.name}
                        </Text>
                      </View>
                      <Text className="text-ancient-500 text-sm">
                        {user.contributions} contributions
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-saffron-600 font-bold text-lg">
                        {user.points.toLocaleString()}
                      </Text>
                      <Text className="text-ancient-500 text-xs">
                        points
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'guidelines' && (
            <View>
              <Text className="text-ancient-800 text-xl font-bold mb-4">
                Community Guidelines
              </Text>
              {communityGuidelines.map((guideline, index) => (
                <View 
                  key={index}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-ancient-200 mb-4"
                >
                  <View className="flex-row items-start">
                    <View className="bg-saffron-100 p-3 rounded-xl mr-4">
                      <Ionicons 
                        name={guideline.icon as any} 
                        size={24} 
                        color="#f97316" 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-ancient-800 font-semibold text-base mb-2">
                        {guideline.title}
                      </Text>
                      <Text className="text-ancient-600 text-sm leading-5">
                        {guideline.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {/* Contribution Button */}
              <TouchableOpacity className="bg-saffron-500 p-4 rounded-2xl mt-4">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Contribute a Shloka
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}