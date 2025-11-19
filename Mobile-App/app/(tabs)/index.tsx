import React, { useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ENHANCED_SHLOKAS } from '../../data/enhancedData';
import Header from '../../components/home/Header';
import StatsGrid from '../../components/home/StatsGrid';
import QuickActions from '../../components/home/QuickActions';
import DailyRecommendations from '../../components/home/DailyRecommendations';
import ContinueLearning from '../../components/home/ContinueLearning';
import TrendingShlokas from '../../components/home/TrendingShlokas';
import MoodFilters from '../../components/home/MoodFilters';
import FeaturedAITools from '../../components/home/FeaturedAITools';
import ExploreCategories from '../../components/home/ExploreCategories';
import LiveEvents from '../../components/home/LiveEvents';
import CurrentShloka from '../../components/home/CurrentShloka';
import ShlokaAnalysisModal from '../../components/home/ShlokaAnalysisModal';

export default function HomeScreen() {
  const [selectedShloka] = useState(ENHANCED_SHLOKAS[0]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [stats] = useState({
    shlokasCompleted: 47,
    accuracy: 87,
    streakDays: 12,
    totalTime: 145
  });

  const quickActions = [
    {
      id: 'analyze',
      title: 'Analyze Shloka',
      subtitle: 'Upload & analyze',
      icon: 'analytics',
      action: () => setShowAnalysisModal(true)
    },
    {
      id: 'karaoke',
      title: 'Divine Karaoke',
      subtitle: 'Sing with rhythm',
      icon: 'musical-notes',
      action: () => console.log('Karaoke')
    },
    {
      id: 'speech',
      title: 'Voice Practice',
      subtitle: 'AI pronunciation',
      icon: 'mic',
      action: () => console.log('Speech')
    },
    {
      id: 'games',
      title: 'Sanskrit Games',
      subtitle: 'Fun learning',
      icon: 'game-controller',
      action: () => console.log('Games')
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with User Greeting, Hindu Calendar, and Daily Quote */}
        <Header userName="Shantanu" />

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Daily Recommendations */}
        <DailyRecommendations />

        {/* Continue Learning / LMS Progress */}
        <ContinueLearning />

        {/* Trending Shlokas in Community */}
        <TrendingShlokas />

        {/* Mood-Based Quick Explore Filters */}
        <MoodFilters />

        {/* Featured AI Tools */}
        <FeaturedAITools />

        {/* Explore Categories */}
        <ExploreCategories />

        {/* Live Events & Sessions */}
        <LiveEvents />

        {/* Current Shloka */}
        <CurrentShloka shloka={selectedShloka} />
      </ScrollView>

      {/* Shloka Analysis Modal */}
      <ShlokaAnalysisModal
        visible={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />
    </SafeAreaView>
  );
}