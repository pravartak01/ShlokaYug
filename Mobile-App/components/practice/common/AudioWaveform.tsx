import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AudioWaveformProps {
  // Audio data
  samples?: number[];
  isPlaying?: boolean;
  isRecording?: boolean;
  
  // Visual customization
  width?: number;
  height?: number;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  
  // Colors
  activeColor?: string;
  inactiveColor?: string;
  gradientColors?: string[];
  useGradient?: boolean;
  
  // Progress
  progress?: number; // 0-1
  showProgress?: boolean;
  progressColor?: string;
  
  // Animation
  animationSpeed?: number;
  smoothing?: number;
  
  // Style
  style?: object;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  samples = [],
  isPlaying = false,
  isRecording = false,
  width = SCREEN_WIDTH - 48,
  height = 60,
  barCount = 40,
  barWidth = 3,
  barGap = 2,
  barRadius = 2,
  activeColor = '#FF6B35',
  inactiveColor = '#E0E0E0',
  gradientColors = ['#FF6B35', '#FF8F6B', '#FFB89A'],
  useGradient = true,
  progress = 0,
  showProgress = true,
  progressColor = '#4CAF50',
  animationSpeed = 100,
  smoothing = 0.3,
  style = {},
}) => {
  // Animated values for each bar
  const barAnimations = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  // Generate waveform data from samples or random for visualization
  const waveformData = useMemo(() => {
    if (samples.length >= barCount) {
      // Downsample to match bar count
      const step = Math.floor(samples.length / barCount);
      return Array.from({ length: barCount }, (_, i) => {
        const start = i * step;
        const end = Math.min(start + step, samples.length);
        const slice = samples.slice(start, end);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        return Math.max(0.1, Math.min(1, avg));
      });
    } else if (samples.length > 0) {
      // Upsample
      return Array.from({ length: barCount }, (_, i) => {
        const index = Math.floor((i / barCount) * samples.length);
        return Math.max(0.1, Math.min(1, samples[index] || 0.3));
      });
    }
    // Generate placeholder waveform
    return Array.from({ length: barCount }, (_, i) => {
      const wave = Math.sin((i / barCount) * Math.PI * 3);
      return 0.3 + Math.abs(wave) * 0.5;
    });
  }, [samples, barCount]);

  // Animate bars when playing or recording
  useEffect(() => {
    if (isPlaying || isRecording) {
      const animations = barAnimations.map((anim, index) => {
        const randomDelay = Math.random() * 200;
        const randomDuration = animationSpeed + Math.random() * 100;
        
        const loopAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.8 + Math.random() * 0.2,
              duration: randomDuration,
              useNativeDriver: true,
              delay: randomDelay,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.2,
              duration: randomDuration,
              useNativeDriver: true,
            }),
          ])
        );
        
        return loopAnimation;
      });

      Animated.parallel(animations).start();
      
      return () => {
        barAnimations.forEach(anim => anim.stopAnimation());
      };
    } else {
      // Reset to static waveform
      barAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: waveformData[index],
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying, isRecording, barAnimations, waveformData, animationSpeed]);

  // Calculate bar dimensions
  const totalBarWidth = barWidth + barGap;
  const adjustedBarCount = Math.min(barCount, Math.floor(width / totalBarWidth));
  const startOffset = (width - adjustedBarCount * totalBarWidth) / 2;

  // Calculate progress position
  const progressIndex = Math.floor(progress * adjustedBarCount);

  return (
    <View style={[styles.container, { width, height }, style]}>
      {/* Waveform Bars */}
      <View style={styles.barsContainer}>
        {Array.from({ length: adjustedBarCount }).map((_, index) => {
          const isActive = showProgress && index <= progressIndex;
          const barColor = isActive ? progressColor : (useGradient ? gradientColors[0] : activeColor);
          const opacity = isActive ? 1 : 0.6;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  marginHorizontal: barGap / 2,
                  borderRadius: barRadius,
                  backgroundColor: barColor,
                  opacity,
                  transform: [
                    {
                      scaleY: barAnimations[index] || new Animated.Value(waveformData[index]),
                    },
                  ],
                  height: height * 0.8,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Center line */}
      <View style={[styles.centerLine, { backgroundColor: activeColor + '30' }]} />

      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, { backgroundColor: '#FF4444' }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  bar: {
    alignSelf: 'center',
  },
  centerLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    opacity: 0.3,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default AudioWaveform;
