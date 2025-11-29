// AnalyzingOverlay Component - Real-time analysis progress display
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyzingOverlayProps {
  visible: boolean;
  progress: number;
  stage: string;
  shlokaTitle?: string;
}

const ANALYSIS_STAGES = [
  { key: 'audio', label: 'Processing Audio', icon: 'waveform' },
  { key: 'speech', label: 'Detecting Speech', icon: 'text-recognition' },
  { key: 'pronunciation', label: 'Analyzing Pronunciation', icon: 'microphone' },
  { key: 'chandas', label: 'Checking Chandas Meter', icon: 'music-note' },
  { key: 'rhythm', label: 'Evaluating Rhythm', icon: 'metronome' },
  { key: 'ai', label: 'AI Analysis', icon: 'brain' },
  { key: 'report', label: 'Generating Report', icon: 'file-document-outline' },
];

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({
  visible,
  progress,
  stage,
  shlokaTitle,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, pulseAnim, rotateAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentStageIndex = ANALYSIS_STAGES.findIndex(s => s.key === stage);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['rgba(26, 26, 46, 0.98)', 'rgba(22, 33, 62, 0.98)'] as const}
        style={styles.gradient}
      >
        {/* Main Animation */}
        <Animated.View
          style={[
            styles.mainAnimation,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#FF6B6B', '#9333EA', '#3B82F6'] as const}
            style={styles.outerRing}
          >
            <View style={styles.middleRing}>
              <Animated.View
                style={[
                  styles.innerRing,
                  { transform: [{ rotate: spin }] },
                ]}
              >
                <MaterialCommunityIcons
                  name="brain"
                  size={40}
                  color="white"
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Analyzing Your Chanting</Text>
        {shlokaTitle && (
          <Text style={styles.subtitle}>{shlokaTitle}</Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#FF6B6B', '#9333EA'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Analysis Stages */}
        <View style={styles.stagesContainer}>
          {ANALYSIS_STAGES.map((stageItem, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;

            return (
              <View
                key={stageItem.key}
                style={[
                  styles.stageItem,
                  isActive && styles.stageItemActive,
                  isCompleted && styles.stageItemCompleted,
                ]}
              >
                <View
                  style={[
                    styles.stageIcon,
                    isActive && styles.stageIconActive,
                    isCompleted && styles.stageIconCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color="white"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={stageItem.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={14}
                      color={isActive ? 'white' : 'rgba(255,255,255,0.4)'}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    isActive && styles.stageLabelActive,
                    isCompleted && styles.stageLabelCompleted,
                  ]}
                >
                  {stageItem.label}
                </Text>
                {isActive && (
                  <View style={styles.stageActiveIndicator} />
                )}
              </View>
            );
          })}
        </View>

        {/* Current Stage Message */}
        <View style={styles.messageContainer}>
          <MaterialCommunityIcons
            name={
              (ANALYSIS_STAGES[currentStageIndex]?.icon || 'loading') as keyof typeof MaterialCommunityIcons.glyphMap
            }
            size={20}
            color="#9333EA"
          />
          <Text style={styles.messageText}>
            {ANALYSIS_STAGES[currentStageIndex]?.label || 'Processing...'}
          </Text>
        </View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <MaterialCommunityIcons name="lightbulb-on" size={16} color="#FFD700" />
          <Text style={styles.tipText}>
            Our AI analyzes pronunciation, meter (chandas), rhythm, and more for comprehensive feedback.
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  mainAnimation: {
    marginBottom: 30,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  middleRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: SCREEN_WIDTH - 80,
    marginBottom: 30,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
  stagesContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  stageItemActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  stageItemCompleted: {
    opacity: 0.7,
  },
  stageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIconActive: {
    backgroundColor: '#9333EA',
  },
  stageIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  stageLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  stageLabelActive: {
    color: 'white',
    fontWeight: '600',
  },
  stageLabelCompleted: {
    color: 'rgba(255,255,255,0.6)',
  },
  stageActiveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333EA',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    maxWidth: SCREEN_WIDTH - 60,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255, 215, 0, 0.9)',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});

export default AnalyzingOverlay;
