// Leaderboard Component - Global rankings and achievements
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LeaderboardEntry, UserStats } from '../../../types/challenges';

Dimensions.get('window');

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserStats: UserStats;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'friends'>('global');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return 'rgba(255,255,255,0.5)';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'crown';
      case 2: return 'medal';
      case 3: return 'medal-outline';
      default: return null;
    }
  };

  const renderTopThree = () => {
    const topThree = entries.slice(0, 3);
    const reordered = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

    return (
      <View style={styles.topThreeContainer}>
        {reordered.map((entry, index) => {
          const isFirst = index === 1;
          const actualRank = entry?.rank || 0;

          if (!entry) return null;

          return (
            <Animated.View
              key={entry.userId}
              style={[
                styles.topThreeItem,
                isFirst && styles.topThreeFirst,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                  opacity: slideAnim,
                },
              ]}
            >
              {/* Crown/Medal for top 3 */}
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(actualRank) }]}>
                <MaterialCommunityIcons
                  name={getRankIcon(actualRank) as any || 'numeric'}
                  size={isFirst ? 28 : 20}
                  color={actualRank <= 3 ? '#1a1a2e' : 'white'}
                />
              </View>

              {/* Avatar */}
              <View style={[styles.avatarContainer, isFirst && styles.avatarFirst]}>
                <Image source={{ uri: entry.avatar }} style={styles.avatar} />
                <View style={[styles.levelBadge, { backgroundColor: getRankColor(actualRank) }]}>
                  <Text style={styles.levelText}>{entry.level}</Text>
                </View>
              </View>

              {/* Name & Stats */}
              <Text style={[styles.topThreeName, isFirst && styles.topThreeNameFirst]} numberOfLines={1}>
                {entry.username}
              </Text>
              <View style={styles.xpContainer}>
                <MaterialCommunityIcons name="star-circle" size={14} color="#FFD700" />
                <Text style={styles.xpText}>{entry.totalXp.toLocaleString()}</Text>
              </View>

              {/* Streak */}
              <View style={styles.streakBadge}>
                <MaterialCommunityIcons name="fire" size={12} color="#FF6B6B" />
                <Text style={styles.streakText}>{entry.streak}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    if (item.rank <= 3) return null;

    const isCurrentUser = item.isCurrentUser;

    return (
      <Animated.View
        style={[
          styles.listItem,
          isCurrentUser && styles.listItemCurrent,
          {
            opacity: slideAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>

        {/* Avatar */}
        <Image source={{ uri: item.avatar }} style={styles.listAvatar} />

        {/* Info */}
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.username}</Text>
          <View style={styles.listStats}>
            <Text style={styles.listStatText}>Lv.{item.level}</Text>
            <Text style={styles.listStatText}>•</Text>
            <Text style={styles.listStatText}>{item.challengesCompleted} challenges</Text>
          </View>
        </View>

        {/* XP */}
        <View style={styles.listXp}>
          <MaterialCommunityIcons name="star-circle" size={16} color="#FFD700" />
          <Text style={styles.listXpText}>{item.totalXp.toLocaleString()}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderCurrentUserCard = () => {
    return (
      <LinearGradient
        colors={['rgba(147,51,234,0.3)', 'rgba(255,107,107,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.currentUserCard}
      >
        <View style={styles.currentUserRank}>
          <Text style={styles.currentUserRankNumber}>#{currentUserStats.rank}</Text>
          <Text style={styles.currentUserRankLabel}>Your Rank</Text>
        </View>

        <View style={styles.currentUserDivider} />

        <View style={styles.currentUserStats}>
          <View style={styles.currentUserStatItem}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#FFD700" />
            <Text style={styles.currentUserStatValue}>{currentUserStats.totalXp.toLocaleString()}</Text>
            <Text style={styles.currentUserStatLabel}>XP</Text>
          </View>
          <View style={styles.currentUserStatItem}>
            <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
            <Text style={styles.currentUserStatValue}>{currentUserStats.currentStreak}</Text>
            <Text style={styles.currentUserStatLabel}>Streak</Text>
          </View>
          <View style={styles.currentUserStatItem}>
            <MaterialCommunityIcons name="trophy" size={20} color="#4CAF50" />
            <Text style={styles.currentUserStatValue}>{currentUserStats.challengesCompleted}</Text>
            <Text style={styles.currentUserStatLabel}>Done</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['global', 'weekly', 'friends'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current User Card */}
      {renderCurrentUserCard()}

      {/* Top 3 Podium */}
      {renderTopThree()}

      {/* Rest of Leaderboard */}
      <FlatList
        data={entries}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: '#9333EA',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  currentUserRank: {
    alignItems: 'center',
  },
  currentUserRankNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  currentUserRankLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  currentUserDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  currentUserStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentUserStatItem: {
    alignItems: 'center',
  },
  currentUserStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  currentUserStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  topThreeItem: {
    alignItems: 'center',
    flex: 1,
  },
  topThreeFirst: {
    marginBottom: 20,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarFirst: {
    transform: [{ scale: 1.2 }],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  topThreeName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 80,
  },
  topThreeNameFirst: {
    fontSize: 14,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
    gap: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemCurrent: {
    backgroundColor: 'rgba(147,51,234,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.5)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  listStats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  listStatText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  listXp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listXpText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
});

export default Leaderboard;
