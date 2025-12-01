import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface ProgressStatsProps {
  stats: StatItem[];
  totalAchievements: number;
  unlockedAchievements: number;
  currentStreak?: number;
  longestStreak?: number;
  level?: number;
  experience?: number;
  nextLevelExp?: number;
}

export default function ProgressStats({
  stats,
  totalAchievements,
  unlockedAchievements,
  currentStreak = 0,
  longestStreak = 0,
  level = 1,
  experience = 0,
  nextLevelExp = 100,
}: ProgressStatsProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  const completionPercent = totalAchievements > 0 
    ? Math.round((unlockedAchievements / totalAchievements) * 100) 
    : 0;
  const levelProgress = nextLevelExp > 0 
    ? Math.min((experience / nextLevelExp) * 100, 100) 
    : 0;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(progressAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progressAnim, statsAnim]);

  return (
    <View style={styles.container}>
      {/* Level & Experience Card */}
      <Animated.View
        style={[
          styles.levelCard,
          {
            opacity: progressAnim,
            transform: [{ scale: progressAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#1f2937', '#374151']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <LinearGradient
                colors={['#f97316', '#fb923c']}
                style={styles.levelBadgeGradient}
              >
                <Text style={styles.levelNumber}>{level}</Text>
              </LinearGradient>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Level {level}</Text>
              <Text style={styles.levelTitle}>
                {level <= 5 ? 'Beginner' : level <= 10 ? 'Apprentice' : level <= 20 ? 'Scholar' : level <= 30 ? 'Expert' : 'Master'}
              </Text>
            </View>
            <View style={styles.expContainer}>
              <Text style={styles.expValue}>{experience}</Text>
              <Text style={styles.expLabel}>XP</Text>
            </View>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <Animated.View
                style={[
                  styles.levelProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${levelProgress}%`],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={['#f97316', '#fb923c', '#fbbf24']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.levelProgressGradient}
                />
              </Animated.View>
            </View>
            <Text style={styles.levelProgressText}>
              {experience}/{nextLevelExp} XP to Level {level + 1}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Achievement Progress */}
      <Animated.View
        style={[
          styles.achievementProgress,
          {
            opacity: progressAnim,
            transform: [
              {
                translateY: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={20} color="#f97316" />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementLabel}>Achievements Unlocked</Text>
            <Text style={styles.achievementValue}>
              {unlockedAchievements} of {totalAchievements}
            </Text>
          </View>
          <Text style={styles.achievementPercent}>{completionPercent}%</Text>
        </View>

        <View style={styles.achievementBar}>
          <Animated.View
            style={[
              styles.achievementFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${completionPercent}%`],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#f97316', '#fb923c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.achievementGradient}
            />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Streak Cards */}
      <Animated.View
        style={[
          styles.streakContainer,
          {
            opacity: statsAnim,
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.streakCard}>
          <View style={[styles.streakIconBg, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="flame" size={22} color="#f59e0b" />
          </View>
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>

        <View style={styles.streakDivider} />

        <View style={styles.streakCard}>
          <View style={[styles.streakIconBg, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="medal" size={22} color="#ef4444" />
          </View>
          <Text style={styles.streakValue}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
        </View>
      </Animated.View>

      {/* Stats Grid */}
      <Animated.View
        style={[
          styles.statsGrid,
          {
            opacity: statsAnim,
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {stats.map((stat, index) => (
          <View key={stat.id} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={styles.statValue}>
              {stat.value}
              {stat.suffix && <Text style={styles.statSuffix}>{stat.suffix}</Text>}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {stat.trend && stat.trendValue && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={stat.trend === 'up' ? 'trending-up' : stat.trend === 'down' ? 'trending-down' : 'remove'}
                  size={12}
                  color={stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#9ca3af',
                    },
                  ]}
                >
                  {stat.trendValue}
                </Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  levelCard: {
    marginBottom: 16,
  },
  levelGradient: {
    borderRadius: 20,
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    marginRight: 14,
  },
  levelBadgeGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  expContainer: {
    alignItems: 'flex-end',
  },
  expValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fbbf24',
  },
  expLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  levelProgressContainer: {
    marginTop: 4,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressGradient: {
    flex: 1,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementProgress: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  achievementPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f97316',
  },
  achievementBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementGradient: {
    flex: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
  },
  streakIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
});
