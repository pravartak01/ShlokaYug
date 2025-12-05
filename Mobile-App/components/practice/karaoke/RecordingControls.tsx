import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RecordingControlsProps {
  isRecording: boolean;
  recordingDuration: number;
  hasRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
  onAnalyze: () => void;
  disabled?: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  recordingDuration,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onAnalyze,
  disabled = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Recording Status */}
      {isRecording && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording</Text>
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}

      {/* Main Control Button */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={isRecording ? onStopRecording : onStartRecording}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
          <LinearGradient
            colors={isRecording ? ['#F44336', '#D32F2F'] : ['#8D6E63', '#6D4C41']}
            style={styles.mainButtonGradient}
          >
            <MaterialCommunityIcons
              name={isRecording ? 'stop' : 'microphone'}
              size={40}
              color="#EFEBE9"
            />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      <Text style={styles.mainButtonLabel}>
        {isRecording ? 'Stop Recording' : hasRecording ? 'Re-record' : 'Start Recording'}
      </Text>

      {/* Action Buttons */}
      {hasRecording && !isRecording && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onPlayRecording}>
            <LinearGradient
              colors={['rgba(141, 110, 99, 0.3)', 'rgba(109, 76, 65, 0.3)']}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="play" size={24} color="#EFEBE9" />
            </LinearGradient>
            <Text style={styles.actionButtonLabel}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onAnalyze}>
            <LinearGradient colors={['#8D6E63', '#6D4C41']} style={styles.actionButtonGradient}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#EFEBE9" />
            </LinearGradient>
            <Text style={styles.actionButtonLabel}>Analyze</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions */}
      {!hasRecording && !isRecording && (
        <Text style={styles.instructions}>
          Tap the microphone to start recording your practice
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EFEBE9',
  },
  mainButton: {
    marginBottom: 12,
  },
  mainButtonGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4A2E1C',
  },
  mainButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EFEBE9',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A2E1C',
  },
  actionButtonLabel: {
    fontSize: 14,
    color: '#D7CCC8',
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: '#A1887F',
    textAlign: 'center',
    marginTop: 10,
  },
});
