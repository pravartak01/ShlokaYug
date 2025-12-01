import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressRingProps {
  // Progress
  progress: number; // 0-100
  
  // Size
  size?: number;
  strokeWidth?: number;
  
  // Customization
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  centerContent?: React.ReactNode;
  
  // Animation
  animated?: boolean;
  animationDuration?: number;
  
  // Colors
  progressColor?: string;
  backgroundColor?: string;
  textColor?: string;
  gradientColors?: string[];
  useGradient?: boolean;
  
  // Glow effect
  showGlow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  
  // Style
  style?: object;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  showPercentage = true,
  showLabel = false,
  label = '',
  centerContent,
  animated = true,
  animationDuration = 1000,
  progressColor = '#FF6B35',
  backgroundColor = '#E0E0E0',
  textColor = '#333',
  gradientColors = ['#FF6B35', '#FF8F6B'],
  useGradient = false,
  showGlow = true,
  glowColor,
  glowIntensity = 0.3,
  style = {},
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animationDuration]);

  // Continuous rotation for indeterminate state
  useEffect(() => {
    if (progress === -1) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayProgress = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  // Determine the color based on progress
  const getProgressColor = () => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    if (progress >= 30) return '#FFC107';
    return progressColor;
  };

  const finalProgressColor = useGradient ? progressColor : getProgressColor();
  const finalGlowColor = glowColor || finalProgressColor;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Glow Effect */}
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              backgroundColor: finalGlowColor,
              opacity: glowIntensity * (progress / 100),
            },
          ]}
        />
      )}

      {/* Background Ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />

      {/* Progress Ring */}
      <Animated.View
        style={[
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: finalProgressColor,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [
              { rotate: '-135deg' },
              {
                rotate: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0deg', '270deg'],
                }),
              },
            ],
          },
        ]}
      />

      {/* Second Progress Ring for full circle effect */}
      <Animated.View
        style={[
          styles.progressRingSecond,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: finalProgressColor,
            borderLeftColor: 'transparent',
            borderTopColor: 'transparent',
            opacity: animatedValue.interpolate({
              inputRange: [0, 50, 100],
              outputRange: [0, 0, 1],
            }),
            transform: [
              { rotate: '45deg' },
              {
                rotate: animatedValue.interpolate({
                  inputRange: [50, 100],
                  outputRange: ['0deg', '180deg'],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerContent}>
        {centerContent ? (
          centerContent
        ) : (
          <>
            {showPercentage && (
              <Animated.Text
                style={[
                  styles.percentageText,
                  {
                    color: textColor,
                    fontSize: size * 0.2,
                  },
                ]}
              >
                {Math.round(progress)}%
              </Animated.Text>
            )}
            {showLabel && label && (
              <Text
                style={[
                  styles.labelText,
                  {
                    color: textColor + '80',
                    fontSize: size * 0.08,
                  },
                ]}
              >
                {label}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Progress Indicator Dot */}
      <Animated.View
        style={[
          styles.progressDot,
          {
            width: strokeWidth + 4,
            height: strokeWidth + 4,
            borderRadius: (strokeWidth + 4) / 2,
            backgroundColor: finalProgressColor,
            transform: [
              { translateX: -((strokeWidth + 4) / 2) },
              { translateY: -((strokeWidth + 4) / 2) },
              {
                rotate: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['-135deg', '135deg'],
                }),
              },
              { translateX: radius },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.2,
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  progressRingSecond: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontWeight: 'bold',
  },
  labelText: {
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressDot: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ProgressRing;
