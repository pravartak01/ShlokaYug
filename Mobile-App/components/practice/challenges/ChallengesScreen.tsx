// ChallengesScreen - Main gamified challenges hub
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ChallengeCard } from './ChallengeCard';
import { QuizGame } from './QuizGame';
import { ResultsScreen } from './ResultsScreen';
import { Leaderboard } from './Leaderboard';
import { CertificateView } from './CertificateView';
import { SocialShareCard } from './SocialShareCard';
import { useAuth } from '../../../context/AuthContext';
import {
  MOCK_LEADERBOARD,
  MOCK_USER_STATS,
  getChallengesByCategory,
} from '../../../data/challenges';
import {
  Challenge,
  UserChallengeProgress,
  Certificate,
  ChallengeCategory,
} from '../../../types/challenges';

Dimensions.get('window');

type ScreenState = 'home' | 'game' | 'results' | 'leaderboard' | 'certificate' | 'share';

interface ChallengesScreenProps {
  onBack?: () => void;
}

const CATEGORIES: { key: ChallengeCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'view-grid' },
  { key: 'shlokas', label: 'Shlokas', icon: 'book-open-variant' },
  { key: 'bhagavad-gita', label: 'Bhagavad Gita', icon: 'book-cross' },
  { key: 'vedic', label: 'Vedic', icon: 'fire' },
  { key: 'chandas', label: 'Chandas', icon: 'music-note' },
  { key: 'upanishads', label: 'Upanishads', icon: 'brain' },
];

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [screenState, setScreenState] = useState<ScreenState>('home');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<UserChallengeProgress | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shareType, setShareType] = useState<'achievement' | 'badge' | 'streak'>('achievement');

  // Get user's display name from auth context
  const getUserDisplayName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user?.profile?.firstName) {
      return user.profile.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Learner';
  };

  // Create user stats with actual user info
  const [userStats, setUserStats] = useState({
    ...MOCK_USER_STATS,
    userId: user?.id || 'current-user',
    username: getUserDisplayName(),
    avatar: user?.profile?.avatar || 'https://i.pravatar.cc/150?img=10',
  });

  // Update userStats when user changes
  useEffect(() => {
    setUserStats(prev => ({
      ...prev,
      userId: user?.id || 'current-user',
      username: getUserDisplayName(),
      avatar: user?.profile?.avatar || 'https://i.pravatar.cc/150?img=10',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredChallenges = getChallengesByCategory(selectedCategory);

  const handleChallengePress = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setScreenState('game');
  }, []);

  const handleGameComplete = useCallback((progress: UserChallengeProgress) => {
    setChallengeProgress(progress);
    
    // Update user stats
    setUserStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + progress.earnedXp,
      totalCoins: prev.totalCoins + progress.earnedCoins,
      challengesCompleted: progress.completed ? prev.challengesCompleted + 1 : prev.challengesCompleted,
      badges: progress.earnedBadge ? [...prev.badges, progress.earnedBadge] : prev.badges,
    }));

    // Generate certificate if passed
    if (progress.completed && selectedChallenge) {
      const cert: Certificate = {
        id: `cert-${Date.now()}`,
        userId: userStats.userId,
        username: userStats.username,
        challengeTitle: selectedChallenge.title,
        category: selectedChallenge.category,
        score: progress.score,
        percentage: progress.percentage,
        completedAt: new Date(),
        badge: progress.earnedBadge,
        certificateNumber: `SY-${Date.now().toString(36).toUpperCase()}`,
      };
      setCertificate(cert);
    }

    setScreenState('results');
  }, [selectedChallenge, userStats]);

  const handleRetry = useCallback(() => {
    setChallengeProgress(null);
    setScreenState('game');
  }, []);

  const handleViewCertificate = useCallback(() => {
    setScreenState('certificate');
  }, []);

  const handleShare = useCallback((type: 'achievement' | 'badge' | 'streak' = 'achievement') => {
    setShareType(type);
    setScreenState('share');
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreenState('home');
    setSelectedChallenge(null);
    setChallengeProgress(null);
    setCertificate(null);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Render different screens based on state
  if (screenState === 'game' && selectedChallenge) {
    return (
      <QuizGame
        challenge={selectedChallenge}
        onComplete={handleGameComplete}
        onExit={handleBackToHome}
      />
    );
  }

  if (screenState === 'results' && challengeProgress && selectedChallenge) {
    return (
      <ResultsScreen
        challenge={selectedChallenge}
        progress={challengeProgress}
        onRetry={handleRetry}
        onExit={handleBackToHome}
        onViewCertificate={handleViewCertificate}
        onShare={() => handleShare('achievement')}
      />
    );
  }

  if (screenState === 'leaderboard') {
    return (
      <Leaderboard
        entries={MOCK_LEADERBOARD}
        currentUserStats={userStats}
        onClose={() => setScreenState('home')}
      />
    );
  }

  if (screenState === 'certificate' && certificate && selectedChallenge) {
    return (
      <CertificateView
        certificate={certificate}
        challenge={selectedChallenge}
        userStats={userStats}
        onClose={() => setScreenState('results')}
        onShare={(platform) => handleShare('achievement')}
      />
    );
  }

  if (screenState === 'share') {
    return (
      <SocialShareCard
        type={shareType}
        challenge={selectedChallenge || undefined}
        progress={challengeProgress || undefined}
        userStats={userStats}
        badge={challengeProgress?.earnedBadge}
        onClose={() => setScreenState(challengeProgress ? 'results' : 'home')}
      />
    );
  }

  // Main Home Screen
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          )}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🎮 Challenges</Text>
            <Text style={styles.headerSubtitle}>Test your knowledge & earn rewards!</Text>
          </View>
          <TouchableOpacity 
            style={styles.leaderboardButton}
            onPress={() => setScreenState('leaderboard')}
          >
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
          </TouchableOpacity>
        </Animated.View>

        {/* User Stats Card */}
        <Animated.View
          style={[
            styles.statsCard,
            {
              opacity: statsAnim,
              transform: [{ scale: statsAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(141,110,99,0.3)', 'rgba(109,76,65,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsGradient}
          >
            {/* Level & XP */}
            <View style={styles.levelSection}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{userStats.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>Level</Text>
                <View style={styles.xpBar}>
                  <View
                    style={[
                      styles.xpFill,
                      { width: `${((userStats.totalXp % 1000) / 1000) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.xpText}>
                  {userStats.totalXp % 1000}/{1000} XP
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>{userStats.challengesCompleted}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="gold" size={20} color="#FFC107" />
                <Text style={styles.statValue}>{userStats.totalCoins}</Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="medal" size={20} color="#8D6E63" />
                <Text style={styles.statValue}>{userStats.badges.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Daily Challenge Banner */}
        <TouchableOpacity style={styles.dailyBanner} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dailyGradient}
          >
            <View style={styles.dailyIcon}>
              <MaterialCommunityIcons name="calendar-star" size={32} color="white" />
            </View>
            <View style={styles.dailyContent}>
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <Text style={styles.dailySubtitle}>Complete today&apos;s special challenge!</Text>
            </View>
            <View style={styles.dailyReward}>
              <Text style={styles.dailyRewardText}>+200 XP</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryTab,
                selectedCategory === category.key && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={18}
                color={selectedCategory === category.key ? 'white' : 'rgba(255,255,255,0.6)'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Challenges' : CATEGORIES.find(c => c.key === selectedCategory)?.label}
          </Text>
          <Text style={styles.sectionCount}>{filteredChallenges.length} challenges</Text>
        </View>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {filteredChallenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              userLevel={userStats.level}
              onPress={handleChallengePress}
              index={index}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleShare('streak')}
            >
              <LinearGradient
                colors={['rgba(255,107,107,0.2)', 'rgba(255,107,107,0.1)']}
                style={styles.quickActionGradient}
              >
                <MaterialCommunityIcons name="share-variant" size={24} color="#FF6B6B" />
                <Text style={styles.quickActionText}>Share Streak</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setScreenState('leaderboard')}
            >
              <LinearGradient
                colors={['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.1)']}
                style={styles.quickActionGradient}
              >
                <MaterialCommunityIcons name="podium" size={24} color="#FFD700" />
                <Text style={styles.quickActionText}>Leaderboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges Preview */}
        <View style={styles.badgesSection}>
          <View style={styles.badgesHeader}>
            <Text style={styles.badgesTitle}>Your Badges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesList}
          >
            {userStats.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  <MaterialCommunityIcons name={badge.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              </View>
            ))}
            {/* Locked badge placeholder */}
            {[...Array(Math.max(0, 5 - userStats.badges.length))].map((_, index) => (
              <View key={`locked-${index}`} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, styles.badgeLocked]}>
                  <MaterialCommunityIcons name="lock" size={24} color="rgba(255,255,255,0.3)" />
                </View>
                <Text style={styles.badgeNameLocked}>Locked</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  leaderboardButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
    borderRadius: 20,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  levelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  levelLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  dailyBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dailyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dailyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyContent: {
    flex: 1,
    marginLeft: 12,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  dailySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  dailyReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyRewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: '#9333EA',
  },
  categoryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  sectionCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  challengesList: {
    marginBottom: 24,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
  },
  badgesSection: {
    paddingHorizontal: 16,
  },
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  viewAllText: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '600',
  },
  badgesList: {
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: 70,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  badgeName: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  badgeNameLocked: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});

export default ChallengesScreen;
