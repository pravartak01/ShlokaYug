// ChallengeCard - Beautiful gamified challenge card component
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Challenge, DifficultyLevel } from '../../../types/challenges';

Dimensions.get('window');

interface ChallengeCardProps {
  challenge: Challenge;
  userLevel: number;
  onPress: (challenge: Challenge) => void;
  isCompleted?: boolean;
  progress?: number;
  index?: number;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { color: string; label: string; stars: number }> = {
  beginner: { color: '#4CAF50', label: 'Beginner', stars: 1 },
  intermediate: { color: '#FF9800', label: 'Intermediate', stars: 2 },
  advanced: { color: '#F44336', label: 'Advanced', stars: 3 },
  master: { color: '#9C27B0', label: 'Master', stars: 4 },
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  userLevel,
  onPress,
  isCompleted = false,
  progress = 0,
  index = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isLocked = challenge.requiredLevel > userLevel;
  const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isLocked && !isCompleted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isLocked, isCompleted]);

  const handlePress = () => {
    if (!isLocked) {
      onPress(challenge);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(4)].map((_, i) => (
          <MaterialCommunityIcons
            key={i}
            name={i < diffConfig.stars ? 'star' : 'star-outline'}
            size={14}
            color={i < diffConfig.stars ? '#FFD700' : 'rgba(255,255,255,0.3)'}
          />
        ))}
      </View>
    );
  };

  const renderBadge = () => {
    if (!challenge.badge) return null;

    const rarityColors = {
      common: '#4CAF50',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FFD700',
    };

    return (
      <View style={[styles.badgeContainer, { backgroundColor: rarityColors[challenge.badge.rarity] }]}>
        <MaterialCommunityIcons name={challenge.badge.icon as any} size={12} color="white" />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={isLocked ? 1 : 0.9}
        onPress={handlePress}
        style={styles.touchable}
      >
        {/* Glow effect for available challenges */}
        {!isLocked && !isCompleted && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              },
            ]}
          />
        )}

        <LinearGradient
          colors={isLocked ? ['#1A1A1A', '#0A0A0A'] as const : challenge.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, isCompleted && styles.completedCard]}
        >
          {/* Lock Overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <MaterialCommunityIcons name="lock" size={32} color="rgba(255,255,255,0.5)" />
              <Text style={styles.lockText}>Level {challenge.requiredLevel}</Text>
            </View>
          )}

          {/* Completed Badge */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            </View>
          )}

          {/* Badge Reward Indicator */}
          {renderBadge()}

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, isLocked && styles.lockedIcon]}>
              <MaterialCommunityIcons
                name={challenge.icon as any}
                size={28}
                color="white"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.title, isLocked && styles.lockedText]} numberOfLines={1}>
                {challenge.title}
              </Text>
              <Text style={[styles.titleHindi, isLocked && styles.lockedText]} numberOfLines={1}>
                {challenge.titleHindi}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, isLocked && styles.lockedText]} numberOfLines={2}>
            {challenge.description}
          </Text>

          {/* Progress Bar */}
          {progress > 0 && !isCompleted && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            {/* Difficulty */}
            <View style={styles.difficultyContainer}>
              <View style={[styles.difficultyBadge, { backgroundColor: diffConfig.color }]}>
                <Text style={styles.difficultyText}>{diffConfig.label}</Text>
              </View>
              {renderStars()}
            </View>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="star-circle" size={16} color="#FFD700" />
                <Text style={styles.rewardText}>{challenge.xpReward} XP</Text>
              </View>
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="gold" size={16} color="#FFC107" />
                <Text style={styles.rewardText}>{challenge.coinsReward}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statText}>{Math.floor(challenge.timeLimit / 60)}m</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statText}>{challenge.questions.length} Q</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statText}>{challenge.completedBy.toLocaleString()}</Text>
            </View>
          </View>

          {/* Play Button */}
          {!isLocked && (
            <View style={styles.playButtonContainer}>
              <LinearGradient
                colors={isCompleted ? ['#6D4C41', '#4A2E1C'] as const : ['#8D6E63', '#6D4C41'] as const}
                style={styles.playButton}
              >
                <MaterialCommunityIcons
                  name={isCompleted ? 'replay' : 'play'}
                  size={20}
                  color="white"
                />
                <Text style={styles.playButtonText}>
                  {isCompleted ? 'Retry' : 'Play'}
                </Text>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    backgroundColor: '#FF6B6B',
    zIndex: -1,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    minHeight: 200,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lockText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 44,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    opacity: 0.5,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  titleHindi: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  lockedText: {
    opacity: 0.5,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  playButtonContainer: {
    alignItems: 'flex-end',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ChallengeCard;
