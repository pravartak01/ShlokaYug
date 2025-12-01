import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AchievementCard, { Achievement } from './AchievementCard';
import ProgressStats, { StatItem } from './ProgressStats';

// Sample achievements data
const ACHIEVEMENTS_DATA: Achievement[] = [
  // Learning Category
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first shloka',
    icon: 'footsteps',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    category: 'learning',
    reward: '+10 XP',
  },
  {
    id: '2',
    title: 'Dedicated Learner',
    description: 'Complete 10 shlokas',
    icon: 'book',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-02-01'),
    category: 'learning',
    progress: 10,
    maxProgress: 10,
    reward: '+25 XP',
  },
  {
    id: '3',
    title: 'Sanskrit Scholar',
    description: 'Complete 50 shlokas',
    icon: 'school',
    rarity: 'rare',
    unlocked: false,
    category: 'learning',
    progress: 23,
    maxProgress: 50,
    reward: '+100 XP',
  },
  {
    id: '4',
    title: 'Vedic Master',
    description: 'Complete 100 shlokas',
    icon: 'ribbon',
    rarity: 'epic',
    unlocked: false,
    category: 'learning',
    progress: 23,
    maxProgress: 100,
    reward: '+250 XP',
  },
  {
    id: '5',
    title: 'Enlightened One',
    description: 'Complete all 500 shlokas',
    icon: 'sunny',
    rarity: 'legendary',
    unlocked: false,
    category: 'learning',
    progress: 23,
    maxProgress: 500,
    reward: '+1000 XP',
  },
  // Streak Category
  {
    id: '6',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: 'flame',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-01-18'),
    category: 'streak',
    reward: '+15 XP',
  },
  {
    id: '7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'calendar',
    rarity: 'rare',
    unlocked: true,
    unlockedAt: new Date('2024-02-10'),
    category: 'streak',
    reward: '+50 XP',
  },
  {
    id: '8',
    title: 'Monthly Champion',
    description: 'Maintain a 30-day streak',
    icon: 'medal',
    rarity: 'epic',
    unlocked: false,
    category: 'streak',
    progress: 14,
    maxProgress: 30,
    reward: '+200 XP',
  },
  {
    id: '9',
    title: 'Year-Round Devotee',
    description: 'Maintain a 365-day streak',
    icon: 'diamond',
    rarity: 'legendary',
    unlocked: false,
    category: 'streak',
    progress: 14,
    maxProgress: 365,
    reward: '+2000 XP',
  },
  // Explorer Category
  {
    id: '10',
    title: 'Curious Mind',
    description: 'Explore 5 different categories',
    icon: 'compass',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-01-20'),
    category: 'explorer',
    reward: '+20 XP',
  },
  {
    id: '11',
    title: 'AI Enthusiast',
    description: 'Generate 10 shlokas with AI Composer',
    icon: 'sparkles',
    rarity: 'rare',
    unlocked: false,
    category: 'explorer',
    progress: 5,
    maxProgress: 10,
    reward: '+75 XP',
  },
  {
    id: '12',
    title: 'Tagline Creator',
    description: 'Create 5 Sanskrit taglines',
    icon: 'pricetag',
    rarity: 'rare',
    unlocked: false,
    category: 'explorer',
    progress: 2,
    maxProgress: 5,
    reward: '+75 XP',
  },
  // Social Category
  {
    id: '13',
    title: 'Sharing is Caring',
    description: 'Share your first shloka',
    icon: 'share-social',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-01-25'),
    category: 'social',
    reward: '+15 XP',
  },
  {
    id: '14',
    title: 'Community Builder',
    description: 'Share 25 shlokas with friends',
    icon: 'people',
    rarity: 'rare',
    unlocked: false,
    category: 'social',
    progress: 8,
    maxProgress: 25,
    reward: '+100 XP',
  },
  // Mastery Category
  {
    id: '15',
    title: 'Perfect Pronunciation',
    description: 'Get 100% on pronunciation quiz',
    icon: 'mic',
    rarity: 'epic',
    unlocked: false,
    category: 'mastery',
    reward: '+150 XP',
  },
  {
    id: '16',
    title: 'Memory Master',
    description: 'Memorize 10 shlokas perfectly',
    icon: 'bulb',
    rarity: 'legendary',
    unlocked: false,
    category: 'mastery',
    progress: 3,
    maxProgress: 10,
    reward: '+500 XP',
  },
];

const STATS_DATA: StatItem[] = [
  { id: '1', label: 'Shlokas Learned', value: 23, icon: 'book', color: '#3b82f6', trend: 'up', trendValue: '+5 this week' },
  { id: '2', label: 'Hours Practiced', value: 12, icon: 'time', color: '#10b981', suffix: 'h', trend: 'up', trendValue: '+2h' },
  { id: '3', label: 'Categories', value: 5, icon: 'grid', color: '#8b5cf6' },
  { id: '4', label: 'Favorites', value: 8, icon: 'heart', color: '#ec4899' },
];

type CategoryFilter = 'all' | 'learning' | 'streak' | 'social' | 'explorer' | 'mastery';

const CATEGORY_FILTERS: { key: CategoryFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'learning', label: 'Learning', icon: 'book' },
  { key: 'streak', label: 'Streak', icon: 'flame' },
  { key: 'explorer', label: 'Explorer', icon: 'compass' },
  { key: 'social', label: 'Social', icon: 'people' },
  { key: 'mastery', label: 'Mastery', icon: 'trophy' },
];

export default function Achievements() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, contentAnim]);

  const filteredAchievements = ACHIEVEMENTS_DATA.filter((achievement) => {
    if (activeFilter !== 'all' && achievement.category !== activeFilter) return false;
    if (showUnlockedOnly && !achievement.unlocked) return false;
    return true;
  });

  const unlockedCount = ACHIEVEMENTS_DATA.filter((a) => a.unlocked).length;
  const totalCount = ACHIEVEMENTS_DATA.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={{
          transform: [{ scale: headerAnim }],
          opacity: headerAnim,
        }}
      >
        <LinearGradient
          colors={['#1f2937', '#374151']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          {/* Back Button & Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>
                Achievements
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Track your progress
              </Text>
            </View>

            {/* Trophy Icon with Count */}
            <View
              style={{
                backgroundColor: 'rgba(249,115,22,0.2)',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="trophy" size={18} color="#fbbf24" />
              <Text style={{ color: '#fbbf24', fontWeight: '700', marginLeft: 6 }}>
                {unlockedCount}/{totalCount}
              </Text>
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor:
                    activeFilter === filter.key
                      ? 'rgba(249,115,22,0.9)'
                      : 'rgba(255,255,255,0.1)',
                  marginRight: 10,
                }}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={activeFilter === filter.key ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: activeFilter === filter.key ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    marginLeft: 6,
                  }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={{
          flex: 1,
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Stats */}
          <ProgressStats
            stats={STATS_DATA}
            totalAchievements={totalCount}
            unlockedAchievements={unlockedCount}
            currentStreak={14}
            longestStreak={21}
            level={7}
            experience={450}
            nextLevelExp={600}
          />

          {/* Filter Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
              {activeFilter === 'all' ? 'All Achievements' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Achievements`}
            </Text>

            <TouchableOpacity
              onPress={() => setShowUnlockedOnly(!showUnlockedOnly)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: showUnlockedOnly ? '#fff7ed' : '#f3f4f6',
              }}
            >
              <Ionicons
                name={showUnlockedOnly ? 'checkmark-circle' : 'filter'}
                size={16}
                color={showUnlockedOnly ? '#f97316' : '#6b7280'}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: showUnlockedOnly ? '#f97316' : '#6b7280',
                  marginLeft: 4,
                }}
              >
                {showUnlockedOnly ? 'Unlocked' : 'Show All'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Achievements List */}
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                onPress={() => {
                  // Show achievement details modal
                }}
              />
            ))
          ) : (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 40,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="trophy-outline" size={36} color="#9ca3af" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', marginBottom: 4 }}>
                No achievements found
              </Text>
              <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
                {showUnlockedOnly
                  ? 'No unlocked achievements in this category yet'
                  : 'Start your journey to unlock achievements!'}
              </Text>
            </View>
          )}

          {/* Motivational Footer */}
          <View
            style={{
              alignItems: 'center',
              marginTop: 24,
              padding: 20,
              backgroundColor: '#fff7ed',
              borderRadius: 16,
            }}
          >
            <Ionicons name="sparkles" size={28} color="#f97316" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>
              Keep learning to unlock more achievements!
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 6 }}>
              You&apos;re {Math.round((unlockedCount / totalCount) * 100)}% complete
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
