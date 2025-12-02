import React, { useState } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ENHANCED_SHLOKAS } from '../../data/enhancedData';
import Header from '../../components/home/Header';
import QuickActions from '../../components/home/QuickActions';
import DailyRecommendations from '../../components/home/DailyRecommendations';
import TrendingShlokas from '../../components/home/TrendingShlokas';
import MoodFilters from '../../components/home/MoodFilters';
import FeaturedAITools from '../../components/home/FeaturedAITools';
import ExploreCategories from '../../components/home/ExploreCategories';
import LiveEvents from '../../components/home/LiveEvents';
import CurrentShloka from '../../components/home/CurrentShloka';
import ShlokaAnalysisModal from '../../components/home/ShlokaAnalysisModal';
import WelcomePopup from '../../components/home/WelcomePopup';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const [selectedShloka] = useState(ENHANCED_SHLOKAS[0]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Welcome Popup - Shows on app open */}
      <WelcomePopup userName={user?.profile?.firstName || user?.username || 'Friend'} />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1. Header with User Greeting & Daily Quote */}
        <Header />

        {/* 2. Quick Actions - All USPs in one glance */}
        <QuickActions 
          onAnalyze={() => setShowAnalysisModal(true)}
        />

        {/* 3. Heal with Shlokas - Key USP Feature */}
        <MoodFilters />

        {/* 4. Today's Shloka - Daily Engagement */}
        <CurrentShloka shloka={selectedShloka} />

        {/* 5. AI-Curated Daily Recommendations */}
        <DailyRecommendations />

        {/* 6. Trending Shlokas - Social Proof */}
        <TrendingShlokas />

        {/* 7. Featured AI Tools */}
        <FeaturedAITools />

        {/* 8. Explore Categories */}
        <ExploreCategories />

        {/* 9. Live Events & Sessions */}
        <LiveEvents />
      </ScrollView>

      {/* Shloka Analysis Modal */}
      <ShlokaAnalysisModal
        visible={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />
    </SafeAreaView>
  );
}