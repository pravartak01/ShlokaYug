import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TimerDisplayProps {
  // Time values (in seconds)
  elapsed?: number;
  remaining?: number;
  total?: number;
  
  // Display mode
  mode?: 'countdown' | 'stopwatch' | 'both';
  
  // Format
  format?: 'mm:ss' | 'hh:mm:ss' | 'm:ss' | 'ss' | 'auto';
  showMilliseconds?: boolean;
  
  // Display type
  type?: 'digital' | 'analog' | 'circular' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  
  // State
  isRunning?: boolean;
  isPaused?: boolean;
  isWarning?: boolean;
  isCritical?: boolean;
  
  // Thresholds (in seconds)
  warningThreshold?: number;
  criticalThreshold?: number;
  
  // Customization
  showIcon?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  pulse?: boolean;
  
  // Colors
  primaryColor?: string;
  warningColor?: string;
  criticalColor?: string;
  backgroundColor?: string;
  textColor?: string;
  
  // Callbacks
  onWarning?: () => void;
  onCritical?: () => void;
  onComplete?: () => void;
  
  // Style
  style?: object;
}

const SIZES = {
  small: { fontSize: 18, iconSize: 16, padding: 8 },
  medium: { fontSize: 28, iconSize: 20, padding: 12 },
  large: { fontSize: 42, iconSize: 28, padding: 16 },
};

const formatTime = (
  seconds: number,
  format: 'mm:ss' | 'hh:mm:ss' | 'm:ss' | 'ss' | 'auto',
  showMilliseconds: boolean = false
): string => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const ms = Math.floor((seconds % 1) * 100);
  const secs = totalSeconds % 60;
  const mins = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, digits: number = 2) => n.toString().padStart(digits, '0');

  let timeString = '';
  
  switch (format) {
    case 'hh:mm:ss':
      timeString = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
      break;
    case 'mm:ss':
      timeString = `${pad(mins)}:${pad(secs)}`;
      break;
    case 'm:ss':
      timeString = `${mins}:${pad(secs)}`;
      break;
    case 'ss':
      timeString = `${totalSeconds}`;
      break;
    case 'auto':
    default:
      if (hours > 0) {
        timeString = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
      } else if (mins > 0) {
        timeString = `${pad(mins)}:${pad(secs)}`;
      } else {
        timeString = `0:${pad(secs)}`;
      }
      break;
  }

  if (showMilliseconds) {
    timeString += `.${pad(ms)}`;
  }

  return timeString;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsed = 0,
  remaining,
  total,
  mode = 'stopwatch',
  format = 'auto',
  showMilliseconds = false,
  type = 'digital',
  size = 'medium',
  isRunning = false,
  isPaused = false,
  isWarning: externalWarning,
  isCritical: externalCritical,
  warningThreshold = 30,
  criticalThreshold = 10,
  showIcon = true,
  showLabel = false,
  label = 'Time',
  animated = true,
  pulse = true,
  primaryColor = '#FF6B35',
  warningColor = '#FF9800',
  criticalColor = '#F44336',
  backgroundColor = '#F5F5F5',
  textColor = '#333',
  onWarning,
  onCritical,
  onComplete,
  style = {},
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sizeConfig = SIZES[size];

  // Determine time to display
  const displayTime = useMemo(() => {
    if (mode === 'countdown' && remaining !== undefined) {
      return remaining;
    }
    return elapsed;
  }, [mode, elapsed, remaining]);

  // Determine warning/critical state
  const isWarning = externalWarning ?? (mode === 'countdown' && remaining !== undefined && remaining <= warningThreshold && remaining > criticalThreshold);
  const isCritical = externalCritical ?? (mode === 'countdown' && remaining !== undefined && remaining <= criticalThreshold);

  // Get current color based on state
  const currentColor = useMemo(() => {
    if (isCritical) return criticalColor;
    if (isWarning) return warningColor;
    return primaryColor;
  }, [isCritical, isWarning, criticalColor, warningColor, primaryColor]);

  // Pulse animation for warning/critical states
  useEffect(() => {
    if (pulse && (isWarning || isCritical)) {
      const duration = isCritical ? 300 : 500;
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: duration / 2,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isWarning, isCritical, pulse]);

  // Callbacks for thresholds
  useEffect(() => {
    if (mode === 'countdown' && remaining !== undefined) {
      if (remaining <= warningThreshold && remaining > warningThreshold - 1) {
        onWarning?.();
      }
      if (remaining <= criticalThreshold && remaining > criticalThreshold - 1) {
        onCritical?.();
      }
      if (remaining <= 0) {
        onComplete?.();
      }
    }
  }, [remaining, warningThreshold, criticalThreshold, onWarning, onCritical, onComplete]);

  // Calculate progress for circular type
  const progress = useMemo(() => {
    if (total && total > 0) {
      if (mode === 'countdown') {
        return remaining !== undefined ? remaining / total : 1;
      }
      return elapsed / total;
    }
    return 0;
  }, [elapsed, remaining, total, mode]);

  // Digital Timer Display
  const DigitalTimer = () => (
    <Animated.View
      style={[
        styles.digitalContainer,
        {
          backgroundColor: backgroundColor,
          padding: sizeConfig.padding,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {showIcon && (
        <MaterialCommunityIcons
          name={mode === 'countdown' ? 'timer-sand' : 'timer-outline'}
          size={sizeConfig.iconSize}
          color={currentColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.digitalTime,
          {
            fontSize: sizeConfig.fontSize,
            color: currentColor,
          },
        ]}
      >
        {formatTime(displayTime, format, showMilliseconds)}
      </Text>
      {isPaused && (
        <View style={[styles.pauseBadge, { backgroundColor: warningColor }]}>
          <MaterialCommunityIcons name="pause" size={12} color="#fff" />
        </View>
      )}
    </Animated.View>
  );

  // Minimal Timer Display
  const MinimalTimer = () => (
    <View style={styles.minimalContainer}>
      <Text
        style={[
          styles.minimalTime,
          {
            fontSize: sizeConfig.fontSize * 0.8,
            color: currentColor,
          },
        ]}
      >
        {formatTime(displayTime, format, showMilliseconds)}
      </Text>
    </View>
  );

  // Circular Timer Display
  const CircularTimer = () => {
    const circleSize = sizeConfig.fontSize * 3;
    const strokeWidth = 4;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <View style={[styles.circularContainer, { width: circleSize, height: circleSize }]}>
        {/* Background Circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        {/* Progress Circle */}
        <Animated.View
          style={[
            styles.circleProgress,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
              borderColor: currentColor,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [
                { rotate: '-45deg' },
                { rotate: `${progress * 360}deg` },
                { scale: pulseAnim },
              ],
            },
          ]}
        />
        {/* Center Content */}
        <View style={styles.circularCenter}>
          <Text
            style={[
              styles.circularTime,
              {
                fontSize: sizeConfig.fontSize * 0.6,
                color: currentColor,
              },
            ]}
          >
            {formatTime(displayTime, 'm:ss')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      
      {type === 'digital' && <DigitalTimer />}
      {type === 'minimal' && <MinimalTimer />}
      {type === 'circular' && <CircularTimer />}

      {/* Running indicator */}
      {isRunning && !isPaused && (
        <View style={styles.runningIndicator}>
          <View style={[styles.runningDot, { backgroundColor: currentColor }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  digitalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  digitalTime: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  pauseBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalContainer: {
    alignItems: 'center',
  },
  minimalTime: {
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  circularCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTime: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  runningIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default TimerDisplay;
