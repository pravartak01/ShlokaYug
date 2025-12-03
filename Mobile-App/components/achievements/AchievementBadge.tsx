import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeSize = 'small' | 'medium' | 'large';

interface AchievementBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  rarity?: BadgeRarity;
  size?: BadgeSize;
  unlocked?: boolean;
  progress?: number; // 0-100
  showProgress?: boolean;
  animated?: boolean;
}

const RARITY_COLORS: Record<BadgeRarity, { primary: readonly [string, string, ...string[]]; glow: string }> = {
  common: {
    primary: ['#6b7280', '#9ca3af'] as const,
    glow: 'rgba(107, 114, 128, 0.3)',
  },
  rare: {
    primary: ['#3b82f6', '#60a5fa'] as const,
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  epic: {
    primary: ['#a0704a', '#c08552'] as const,
    glow: 'rgba(160, 112, 74, 0.4)',
  },
  legendary: {
    primary: ['#f59e0b', '#fbbf24', '#f97316'] as const,
    glow: 'rgba(249, 115, 22, 0.5)',
  },
};

const SIZE_CONFIG: Record<BadgeSize, { container: number; icon: number; ring: number }> = {
  small: { container: 48, icon: 20, ring: 2 },
  medium: { container: 72, icon: 28, ring: 3 },
  large: { container: 96, icon: 40, ring: 4 },
};

export default function AchievementBadge({
  icon,
  rarity = 'common',
  size = 'medium',
  unlocked = true,
  progress = 100,
  showProgress = false,
  animated = true,
}: AchievementBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const colors = RARITY_COLORS[rarity];
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();

      if (unlocked && rarity === 'legendary') {
        // Shimmer effect for legendary badges
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.8,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.4,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      scaleAnim.setValue(1);
    }
  }, [animated, scaleAnim, glowAnim, rotateAnim, unlocked, rarity]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow Effect */}
      {unlocked && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: colors.glow,
              opacity: glowAnim,
              width: sizeConfig.container + 12,
              height: sizeConfig.container + 12,
              borderRadius: (sizeConfig.container + 12) / 2,
            },
          ]}
        />
      )}

      {/* Progress Ring */}
      {showProgress && progress < 100 && (
        <View
          style={[
            styles.progressRing,
            {
              width: sizeConfig.container + 6,
              height: sizeConfig.container + 6,
              borderRadius: (sizeConfig.container + 6) / 2,
              borderWidth: sizeConfig.ring,
              borderColor: 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          {/* This is a simplified progress indicator */}
          <View
            style={[
              styles.progressIndicator,
              {
                width: sizeConfig.container + 6,
                height: sizeConfig.container + 6,
                borderRadius: (sizeConfig.container + 6) / 2,
                borderWidth: sizeConfig.ring,
                borderColor: colors.primary[0],
                borderTopColor: 'transparent',
                borderRightColor: progress > 25 ? colors.primary[0] : 'transparent',
                borderBottomColor: progress > 50 ? colors.primary[0] : 'transparent',
                borderLeftColor: progress > 75 ? colors.primary[0] : 'transparent',
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        </View>
      )}

      {/* Badge Background */}
      <LinearGradient
        colors={unlocked ? colors.primary : (['#e5e7eb', '#d1d5db'] as const)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badgeOuter,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
          },
        ]}
      >
        <View
          style={[
            styles.badgeInner,
            {
              width: sizeConfig.container - 6,
              height: sizeConfig.container - 6,
              borderRadius: (sizeConfig.container - 6) / 2,
              backgroundColor: unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={sizeConfig.icon}
            color={unlocked ? '#ffffff' : '#9ca3af'}
          />
        </View>
      </LinearGradient>

      {/* Lock Overlay */}
      {!unlocked && (
        <View
          style={[
            styles.lockOverlay,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={sizeConfig.icon * 0.6} color="#6b7280" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  progressIndicator: {
    position: 'absolute',
  },
  badgeOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
