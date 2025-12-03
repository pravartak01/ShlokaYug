import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AchievementBadge, { BadgeRarity } from './AchievementBadge';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  rarity: BadgeRarity;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  reward?: string;
  category: 'learning' | 'streak' | 'social' | 'explorer' | 'mastery';
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  learning: { bg: '#eff6ff', text: '#3b82f6' },
  streak: { bg: '#fef3c7', text: '#f59e0b' },
  social: { bg: '#fdf2f8', text: '#ec4899' },
  explorer: { bg: '#ecfdf5', text: '#10b981' },
  mastery: { bg: '#faf5f0', text: '#a0704a' },
};

export default function AchievementCard({
  achievement,
  onPress,
  index = 0,
}: AchievementCardProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { title, description, icon, rarity, unlocked, progress, maxProgress, reward, category } =
    achievement;

  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.learning;
  const hasProgress = progress !== undefined && maxProgress !== undefined;
  const progressPercent = hasProgress ? Math.min((progress / maxProgress) * 100, 100) : 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.card, !unlocked && styles.cardLocked]}
      >
        {/* Badge */}
        <View style={styles.badgeContainer}>
          <AchievementBadge
            icon={icon}
            rarity={rarity}
            size="medium"
            unlocked={unlocked}
            progress={progressPercent}
            showProgress={hasProgress && !unlocked}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: categoryColor.bg }]}>
            <Text style={[styles.categoryText, { color: categoryColor.text }]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, !unlocked && styles.titleLocked]}>{title}</Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Progress Bar */}
          {hasProgress && !unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#f97316', '#fb923c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progressPercent}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{maxProgress}
              </Text>
            </View>
          )}

          {/* Reward */}
          {reward && unlocked && (
            <View style={styles.rewardContainer}>
              <Ionicons name="gift-outline" size={14} color="#f59e0b" />
              <Text style={styles.rewardText}>{reward}</Text>
            </View>
          )}

          {/* Unlocked Date */}
          {unlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Rarity Indicator */}
        <View style={styles.rarityContainer}>
          {rarity === 'legendary' && (
            <LinearGradient
              colors={['#f59e0b', '#fbbf24']}
              style={styles.rarityBadge}
            >
              <Ionicons name="star" size={10} color="#ffffff" />
            </LinearGradient>
          )}
          {rarity === 'epic' && (
            <View style={[styles.rarityBadge, { backgroundColor: '#a0704a' }]}>
              <Ionicons name="diamond" size={10} color="#ffffff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardLocked: {
    backgroundColor: '#fafafa',
  },
  badgeContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  titleLocked: {
    color: '#6b7280',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginLeft: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rewardText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  unlockedDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
  rarityContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  rarityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
