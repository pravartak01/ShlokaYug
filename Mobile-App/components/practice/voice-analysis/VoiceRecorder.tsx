// VoiceRecorder Component - Real-time voice recording with waveform visualization and playback
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WAVEFORM_BARS = 40;

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onRecordingStart?: () => void;
  isAnalyzing?: boolean;
  shlokaTitle?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  isAnalyzing = false,
  shlokaTitle,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(
    Array(WAVEFORM_BARS).fill(0.1)
  );
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Playback state
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const waveformIntervalRef = useRef<number | null>(null);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(
    Array(WAVEFORM_BARS).fill(0).map(() => new Animated.Value(0.1))
  ).current;

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
    return () => {
      cleanup();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const cleanup = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
    }
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
    }
    if (playbackSound) {
      await playbackSound.unloadAsync();
    }
  };

  // Pulse animation for recording button
  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    glowAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim, glowAnim]);

  // Simulate waveform animation (in production, use actual audio metering)
  const animateWaveform = useCallback(() => {
    const newData = waveformData.map(() => 
      0.1 + Math.random() * 0.9
    );
    setWaveformData(newData);

    newData.forEach((value, index) => {
      Animated.spring(barAnims[index], {
        toValue: value,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  }, [barAnims, waveformData]);

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestPermissions();
      return;
    }

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      onRecordingStart?.();
      startPulseAnimation();

      // Duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);

      // Waveform animation
      waveformIntervalRef.current = setInterval(() => {
        animateWaveform();
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      stopPulseAnimation();

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        setRecordedUri(uri);
        
        // Load audio for playback
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false },
            onPlaybackStatusUpdate
          );
          setPlaybackSound(sound);
        } catch (error) {
          console.error('Failed to load playback:', error);
        }
        
        // Keep for compatibility - call the completion handler
        onRecordingComplete(uri, recordingDuration);
      }

      recordingRef.current = null;

      // Reset waveform
      setWaveformData(Array(WAVEFORM_BARS).fill(0.1));
      barAnims.forEach(anim => {
        Animated.timing(anim, {
          toValue: 0.1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Playback status update
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  // Play recorded audio
  const playRecording = async () => {
    if (!playbackSound) return;
    
    try {
      await playbackSound.setPositionAsync(0);
      await playbackSound.playAsync();
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Pause playback
  const pausePlayback = async () => {
    if (!playbackSound) return;
    
    try {
      await playbackSound.pauseAsync();
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  // Clear recording
  const clearRecording = async () => {
    if (playbackSound) {
      await playbackSound.unloadAsync();
      setPlaybackSound(null);
    }
    setRecordedUri(null);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setRecordingDuration(0);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView 
      style={styles.scrollContainer} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Recording State - Full Screen Focus */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          {/* Large Waveform */}
          <View style={styles.waveformLarge}>
            <LinearGradient
              colors={['rgba(141,110,99,0.2)', 'rgba(141,110,99,0.05)']}
              style={styles.waveformGradientLarge}
            >
              <View style={styles.waveformBarsLarge}>
                {barAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBarLarge,
                      {
                        transform: [{ scaleY: anim }],
                        backgroundColor: `hsl(${(index / WAVEFORM_BARS) * 15 + 20}, 40%, 45%)`,
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Recording Duration - Large */}
          <View style={styles.durationLarge}>
            <Animated.View style={[styles.liveDot, { opacity: glowAnim }]} />
            <Text style={styles.liveText}>RECORDING</Text>
          </View>
          <Text style={styles.durationTextLarge}>
            {formatDuration(recordingDuration)}
          </Text>

          {/* Status */}
          <Text style={styles.recordingStatus}>🎤 Chanting in progress...</Text>

          {/* BIG STOP BUTTON - Main Focus */}
          <TouchableOpacity
            style={styles.stopButtonBig}
            onPress={stopRecording}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#8D6E63', '#6D4C41', '#4A2E1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.stopButtonBigGradient}
            >
              <View style={styles.stopIconContainer}>
                <MaterialCommunityIcons name="stop" size={50} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.stopButtonLabel}>TAP TO STOP & ANALYZE</Text>

          {/* Secondary smaller stop button at bottom */}
          <TouchableOpacity
            style={styles.stopButtonBottom}
            onPress={stopRecording}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="stop-circle-outline" size={28} color="#8D6E63" />
            <Text style={styles.stopButtonBottomText}>Stop Recording</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Not Recording State */}
      {!isRecording && !recordedUri && (
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Voice Analysis</Text>
            {shlokaTitle && (
              <Text style={styles.subtitle}>Analyzing: {shlokaTitle}</Text>
            )}
          </View>

          {/* Waveform Visualization */}
          <View style={styles.waveformContainer}>
            <LinearGradient
              colors={['rgba(141,110,99,0.1)', 'rgba(109,76,65,0.1)', 'rgba(74,46,28,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.waveformGradient}
            >
              <View style={styles.waveformBars}>
                {barAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        transform: [{ scaleY: anim }],
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Duration Display */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>

          {/* Status Message */}
          <Text style={styles.statusText}>
            {isAnalyzing 
              ? '🔄 Analyzing your chanting...'
              : '👆 Tap the button below to start recording'
            }
          </Text>

          {/* Record Button */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={startRecording}
              disabled={isAnalyzing}
              style={styles.recordButtonOuter}
            >
              <LinearGradient
                colors={isAnalyzing 
                  ? ['#888888', '#666666'] as const
                  : ['#8D6E63', '#6D4C41'] as const
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recordButton}
              >
                <View style={styles.recordButtonInner}>
                  {isAnalyzing ? (
                    <MaterialCommunityIcons name="loading" size={40} color="white" />
                  ) : (
                    <MaterialCommunityIcons name="microphone" size={40} color="white" />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.buttonLabel}>
              {isAnalyzing ? 'Analyzing...' : '🎤 Tap to Record'}
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>📝 Tips for best results:</Text>
            <Text style={styles.tipText}>• Find a quiet environment</Text>
            <Text style={styles.tipText}>• Hold phone 6-8 inches from mouth</Text>
            <Text style={styles.tipText}>• Chant at a steady pace</Text>
            <Text style={styles.tipText}>• Pronounce each syllable clearly</Text>
          </View>
        </View>
      )}

      {/* Playback State - After Recording */}
      {!isRecording && recordedUri && (
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recording Complete! 🎉</Text>
            <Text style={styles.subtitle}>
              Listen to your recording or analyze it
            </Text>
          </View>

          {/* Playback Waveform */}
          <View style={styles.waveformContainer}>
            <LinearGradient
              colors={['rgba(76,175,80,0.1)', 'rgba(139,195,74,0.1)', 'rgba(205,220,57,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.waveformGradient}
            >
              <View style={styles.waveformBars}>
                {barAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        transform: [{ scaleY: isPlaying ? anim : new Animated.Value(0.3) }],
                        backgroundColor: 'rgba(76,175,80,0.5)',
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Playback Progress */}
          <View style={styles.playbackProgress}>
            <Text style={styles.playbackTime}>
              {formatDuration(playbackPosition)} / {formatDuration(playbackDuration)}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0}%` }
                ]} 
              />
            </View>
          </View>

          {/* Playback Controls */}
          <View style={styles.playbackControlsContainer}>
            <TouchableOpacity
              style={styles.playbackButton}
              onPress={isPlaying ? pausePlayback : playRecording}
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.playbackButtonGradient}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.playbackLabel}>
              {isPlaying ? 'Pause' : 'Play Recording'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={clearRecording}
            >
              <MaterialCommunityIcons name="refresh" size={24} color="#8D6E63" />
              <Text style={styles.actionButtonSecondaryText}>Re-record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonPrimary}
              onPress={() => recordedUri && onRecordingComplete(recordedUri, recordingDuration)}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionButtonPrimaryGradient}
              >
                <MaterialCommunityIcons 
                  name={isAnalyzing ? "loading" : "chart-line"} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.actionButtonPrimaryText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Recording Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              📊 Duration: {formatDuration(recordingDuration)}
            </Text>
            <Text style={styles.infoText}>
              ✅ Recording saved successfully
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Recording Overlay - Full screen stop UI
  recordingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    minHeight: SCREEN_HEIGHT - 200,
  },
  waveformLarge: {
    width: SCREEN_WIDTH - 40,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  waveformGradientLarge: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(141,110,99,0.3)',
    borderRadius: 20,
  },
  waveformBarsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    gap: 4,
  },
  waveformBarLarge: {
    width: 5,
    height: 50,
    borderRadius: 3,
  },
  durationLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8D6E63',
    marginRight: 10,
  },
  liveText: {
    color: '#8D6E63',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  durationTextLarge: {
    fontSize: 64,
    fontWeight: '200',
    color: 'white',
    fontVariant: ['tabular-nums'],
    marginBottom: 10,
  },
  recordingStatus: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 30,
  },
  
  // Big Stop Button
  stopButtonBig: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 15,
  },
  stopButtonBigGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF3B30',
    letterSpacing: 1,
    marginBottom: 30,
  },
  stopButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,59,48,0.15)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,59,48,0.4)',
    gap: 10,
  },
  stopButtonBottomText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },

  // Not Recording State
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  waveformContainer: {
    width: SCREEN_WIDTH - 40,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  waveformGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 48,
    fontWeight: '200',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordButtonOuter: {
    width: 100,
    height: 100,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  recordButtonInner: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 35,
  },
  buttonLabel: {
    marginTop: 16,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginVertical: 2,
  },
  
  // Playback styles
  playbackProgress: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  playbackTime: {
    fontSize: 24,
    fontWeight: '300',
    color: 'white',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  progressBar: {
    width: '100%',
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
  playbackControlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playbackButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  playbackButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackLabel: {
    marginTop: 16,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(141,110,99,0.3)',
  },
  actionButtonSecondaryText: {
    color: '#8D6E63',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonPrimary: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default VoiceRecorder;
