import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

interface ActivityCardProps {
  title: string;
  description: string;
  colors: string[];
  icon: string;
  badge?: string;
  index: number;
  onPress: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  colors,
  icon,
  badge,
  index,
  onPress,
}) => {
  const animations = ['fadeInUp', 'fadeInUp', 'fadeInUp', 'fadeInUp'];
  const animation = animations[index % animations.length];

  const getBadgeStyle = (badge: string) => {
    if (badge.includes('GAME')) {
      return { bg: '#fef3c7', text: '#f59e0b', border: '#fbbf24' };
    } else if (badge.includes('FUN')) {
      return { bg: '#fce7f3', text: '#ec4899', border: '#f9a8d4' };
    } else if (badge.includes('COOL')) {
      return { bg: '#dbeafe', text: '#3b82f6', border: '#93c5fd' };
    }
    return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
  };

  const badgeStyle = badge ? getBadgeStyle(badge) : null;

  return (
    <Animatable.View
      animation={animation as any}
      duration={800}
      delay={index * 150}
      useNativeDriver
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge */}
          {badgeStyle && (
            <Animatable.View
              animation="fadeIn"
              delay={index * 150 + 300}
              style={[
                styles.badge,
                {
                  backgroundColor: badgeStyle.bg,
                  borderColor: badgeStyle.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                {badge}
              </Text>
            </Animatable.View>
          )}

          <View style={styles.content}>
            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <View style={styles.iconInner}>
                <Ionicons name={icon as any} size={44} color="#ffffff" />
              </View>
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            </View>

            {/* Chevron */}
            <Ionicons
              name="chevron-forward-circle"
              size={36}
              color="rgba(255, 255, 255, 0.9)"
              style={styles.chevron}
            />
          </View>

          {/* Decorative elements */}
          <View style={styles.decorDot1} />
          <View style={styles.decorDot2} />
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  touchable: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fffbeb',
    lineHeight: 20,
    opacity: 0.95,
  },
  chevron: {
    elevation: 2,
  },
  decorDot1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -20,
    right: 60,
  },
  decorDot2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -10,
    left: -10,
  },
});
