import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic, Trophy, Sparkles, BookOpen } from 'lucide-react';
import ShlokaList from '../components/practice/ShlokaList';
import KaraokePlayer from '../components/practice/KaraokePlayer';
import VoiceAnalysisScreen from '../components/practice/VoiceAnalysisScreen';
import ChallengesScreen from '../components/practice/ChallengesScreen';
import type { ShlokaData } from '../data/shlokas';

type PracticeTab = 'karaoke' | 'voice-analysis' | 'challenges';

interface TabItem {
  id: PracticeTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}

const TABS: TabItem[] = [
  {
    id: 'karaoke',
    label: 'Karaoke',
    icon: <Music className="w-5 h-5" />,
    description: 'Follow along with audio',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'voice-analysis',
    label: 'Voice Analysis',
    icon: <Mic className="w-5 h-5" />,
    description: 'Record & analyze',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Earn rewards',
    gradient: 'from-orange-500 to-amber-500',
  },
];

const Practice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('karaoke');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaData | null>(null);

  const handleTabPress = (tab: PracticeTab) => {
    setActiveTab(tab);
    // Reset shloka selection when switching tabs
    if (tab !== 'karaoke') {
      setSelectedShloka(null);
    }
  };

  const handleShlokaSelect = (shloka: ShlokaData) => {
    setSelectedShloka(shloka);
  };

  const handleBackToList = () => {
    setSelectedShloka(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'karaoke':
        if (selectedShloka) {
          return (
            <KaraokePlayer
              shloka={selectedShloka}
              onBack={handleBackToList}
            />
          );
        }
        return <ShlokaList onSelectShloka={handleShlokaSelect} />;

      case 'voice-analysis':
        return <VoiceAnalysisScreen onBack={handleBackToList} />;

      case 'challenges':
        return <ChallengesScreen />;

      default:
        return null;
    }
  };

  // Hide header/tabs when in karaoke player mode
  const showHeader = !(activeTab === 'karaoke' && selectedShloka);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
      {/* Header with Tabs */}
      {showHeader && (
        <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0f0f1a] to-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    Practice
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">Master shlokas with interactive learning</p>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation - Card Style */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab.id)}
                  className={`relative group flex flex-col items-center justify-center p-4 md:p-5 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-2 border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'bg-[#1a1a2e]/60 border-2 border-transparent hover:bg-[#252545]/60 hover:border-white/10'
                  }`}
                >
                  {/* Active Indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-[#252545] text-gray-400 group-hover:text-white group-hover:bg-[#303060]'
                  }`}>
                    {tab.icon}
                  </div>
                  <span className={`font-semibold text-sm md:text-base transition-colors ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {tab.label}
                  </span>
                  <span className={`text-[10px] md:text-xs mt-0.5 transition-colors hidden md:block ${
                    activeTab === tab.id ? 'text-orange-300/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${selectedShloka?.id || 'list'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Practice;