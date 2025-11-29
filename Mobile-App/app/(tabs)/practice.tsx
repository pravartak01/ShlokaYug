import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShlokaList, KaraokePlayer } from '../../components/practice/karaoke';
import { VoiceAnalysisScreen } from '../../components/practice/voice-analysis';
import { ChallengesScreen } from '../../components/practice/challenges';
import { ShlokaData } from '../../data/shlokas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PracticeTab = 'karaoke' | 'voice-analysis' | 'challenges';

interface TabItem {
  id: PracticeTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
}

const TABS: TabItem[] = [
  {
    id: 'karaoke',
    label: 'Karaoke',
    icon: 'musical-notes',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 'voice-analysis',
    label: 'Voice Analysis',
    icon: 'mic',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: 'trophy',
    gradient: ['#4facfe', '#00f2fe'],
  },
];

const Practice = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('karaoke');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaData | null>(null);
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const tabIndex = TABS.findIndex(tab => tab.id === activeTab);
    Animated.spring(indicatorPosition, {
      toValue: tabIndex * (SCREEN_WIDTH / 3),
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabPress = (tab: PracticeTab, index: number) => {
    // Animate tab press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
              onComplete={(score) => {
                console.log('Karaoke completed with score:', score);
              }}
            />
          );
        }
        return <ShlokaList onSelectShloka={handleShlokaSelect} />;
      
      case 'voice-analysis':
        return <VoiceAnalysisScreen />;
      
      case 'challenges':
        return <ChallengesScreen />;
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Practice</Text>
        <Text style={styles.headerSubtitle}>Master your skills</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.tabGradient}
        >
          {/* Animated Indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX: indicatorPosition }],
              },
            ]}
          >
            <LinearGradient
              colors={TABS.find(t => t.id === activeTab)?.gradient || ['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tabIndicatorGradient}
            />
          </Animated.View>

          {/* Tab Items */}
          {TABS.map((tab, index) => (
            <Animated.View
              key={tab.id}
              style={[
                styles.tabItem,
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabPress(tab.id, index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </LinearGradient>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  tabContainer: {
    paddingHorizontal: 0,
  },
  tabGradient: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 0,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH / 3,
    height: 3,
    borderRadius: 2,
  },
  tabIndicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default Practice;