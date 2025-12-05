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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    gradient: ['#8D6E63', '#6D4C41'],
  },
  {
    id: 'voice-analysis',
    label: 'Voice Analysis',
    icon: 'mic',
    gradient: ['#A1887F', '#8D6E63'],
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: 'trophy',
    gradient: ['#BCAAA4', '#A1887F'],
  },
];

const Practice = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('karaoke');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaData | null>(null);
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Header with Gradient */}
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fixedHeader}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Practice</Text>
              <Text style={styles.headerSubtitle}>Master your Sanskrit skills</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={['#8D6E63', '#6D4C41']}
                style={styles.headerIcon}
              >
                <MaterialCommunityIcons name="meditation" size={28} color="#EFEBE9" />
              </LinearGradient>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation - Will scroll under header */}
        <View style={styles.tabContainer}>
          <LinearGradient
            colors={['#1A1A1A', '#0A0A0A']}
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
                colors={TABS.find(t => t.id === activeTab)?.gradient || ['#8D6E63', '#6D4C41']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabIndicatorGradient}
              />
              <View style={styles.tabIndicatorGlow} />
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
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 140, // Space for fixed header
    paddingBottom: 100, // Extra space for bottom navbar
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A2E1C',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EFEBE9',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D7CCC8',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  tabContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
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
    height: 4,
    borderRadius: 2,
  },
  tabIndicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  tabIndicatorGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#BCAAA4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#EFEBE9',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});

export default Practice;