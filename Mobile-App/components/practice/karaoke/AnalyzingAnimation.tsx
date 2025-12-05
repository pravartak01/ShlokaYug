import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnalyzingAnimationProps {
  message?: string;
}

export const AnalyzingAnimation: React.FC<AnalyzingAnimationProps> = ({
  message = 'Analyzing your voice...',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Wave animations
    const waveAnimations = waveAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
    );

    pulseAnimation.start();
    rotateAnimation.start();
    waveAnimations.forEach(anim => anim.start());

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      waveAnimations.forEach(anim => anim.stop());
    };
  }, [pulseAnim, rotateAnim, waveAnims]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(141, 110, 99, 0.1)', 'rgba(109, 76, 65, 0.1)']}
        style={styles.gradient}
      >
        {/* Wave visualization */}
        <View style={styles.waveContainer}>
          {waveAnims.map((anim, index) => {
            const scaleY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 1, 0.3],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY }],
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Rotating icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }, { rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={['#8D6E63', '#6D4C41']}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons name="waveform" size={48} color="#EFEBE9" />
          </LinearGradient>
        </Animated.View>

        {/* Status text */}
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.submessage}>
          AI is processing your pronunciation, rhythm, and accuracy
        </Text>

        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => {
            const opacity = waveAnims[index].interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 1, 0.3],
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, { opacity }]}
              />
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  waveBar: {
    width: 6,
    height: 60,
    backgroundColor: '#8D6E63',
    borderRadius: 3,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4A2E1C',
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EFEBE9',
    marginBottom: 8,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    color: '#D7CCC8',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8D6E63',
  },
});
