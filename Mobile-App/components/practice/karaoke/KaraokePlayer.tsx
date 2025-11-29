import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ShlokaData, ShlokaLine } from '../../../data/shlokas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KaraokePlayerProps {
  shloka: ShlokaData;
  onBack: () => void;
  onComplete?: (score: number) => void;
}

const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  shloka,
  onBack,
  onComplete,
}) => {
  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lyric state
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const wordPulseAnim = useRef(new Animated.Value(1)).current;

  // Settings
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await loadAudio();
    };
    
    initAudio();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudio = async () => {
    try {
      // Skip audio loading if no audio file provided
      if (!shloka.audioFile) {
        console.log('No audio file provided, running in demo mode');
        setDuration(shloka.duration * 1000);
        setIsDemoMode(true);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // For demo purposes, we'll handle the case where audio might not exist
      const { sound: audioSound } = await Audio.Sound.createAsync(
        shloka.audioFile,
        { shouldPlay: false, progressUpdateIntervalMillis: 50 },
        onPlaybackStatusUpdate
      );

      setSound(audioSound);
    } catch (error) {
      console.log('Audio load error:', error);
      // Continue without audio for demo
      setDuration(shloka.duration * 1000);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis || shloka.duration * 1000);
      setIsPlaying(status.isPlaying);

      // Update current line and word based on position
      updateLyricPosition(status.positionMillis);

      if (status.didJustFinish) {
        handlePlaybackComplete();
      }
    }
  };

  const updateLyricPosition = (positionMs: number) => {
    // Find current line
    let lineIdx = -1;
    let wordIdx = -1;

    for (let i = 0; i < shloka.lines.length; i++) {
      const line = shloka.lines[i];
      if (positionMs >= line.startTime && positionMs < line.endTime) {
        lineIdx = i;
        
        // Find current word in line
        for (let j = 0; j < line.words.length; j++) {
          const word = line.words[j];
          if (positionMs >= word.startTime && positionMs < word.endTime) {
            wordIdx = j;
            break;
          }
        }
        break;
      }
    }

    if (lineIdx !== currentLineIndex) {
      setCurrentLineIndex(lineIdx);
      // Auto-scroll to current line
      if (lineIdx >= 0 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: lineIdx * 140,
          animated: true,
        });
      }
    }

    if (wordIdx !== currentWordIndex) {
      setCurrentWordIndex(wordIdx);
      // Pulse animation for current word
      Animated.sequence([
        Animated.timing(wordPulseAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wordPulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePlaybackComplete = () => {
    setIsPlaying(false);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }
    onComplete?.(95); // Mock score for demo
  };

  // Demo mode timer for simulating playback
  const startDemoPlayback = () => {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }
    
    setIsPlaying(true);
    const startTime = currentTime;
    const startTimestamp = Date.now();
    
    demoTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const newTime = startTime + (elapsed * playbackSpeed);
      
      if (newTime >= duration) {
        handlePlaybackComplete();
        return;
      }
      
      setCurrentTime(newTime);
      updateLyricPosition(newTime);
    }, 50);
  };

  const stopDemoPlayback = () => {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    if (isDemoMode) {
      // Demo mode without audio - use timer
      if (isPlaying) {
        stopDemoPlayback();
      } else {
        startDemoPlayback();
      }
      return;
    }

    if (!sound) {
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const restart = async () => {
    setCurrentTime(0);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    
    if (isDemoMode) {
      if (isPlaying) {
        stopDemoPlayback();
        setTimeout(() => startDemoPlayback(), 100);
      }
      return;
    }
    
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  };

  const seekTo = async (position: number) => {
    setCurrentTime(position);
    updateLyricPosition(position);
    
    if (sound) {
      await sound.setPositionAsync(position);
    }
  };

  const changeSpeed = async () => {
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (sound) {
      await sound.setRateAsync(newSpeed, true);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render lyric line
  const renderLine = (line: ShlokaLine, index: number) => {
    const isCurrentLine = index === currentLineIndex;
    const isPastLine = index < currentLineIndex;
    const isFutureLine = index > currentLineIndex;

    return (
      <TouchableOpacity
        key={line.id}
        style={[
          styles.lineContainer,
          isCurrentLine && styles.currentLineContainer,
        ]}
        onPress={() => seekTo(line.startTime)}
        activeOpacity={0.8}
      >
        {/* Sanskrit Text with word highlighting */}
        <View style={styles.wordsContainer}>
          {line.words.map((word, wordIndex) => {
            const isCurrentWord = isCurrentLine && wordIndex === currentWordIndex;
            const isPastWord = isCurrentLine && wordIndex < currentWordIndex;

            return (
              <Animated.Text
                key={word.id}
                style={[
                  styles.wordText,
                  isPastLine && styles.pastText,
                  isPastWord && styles.pastText,
                  isFutureLine && styles.futureText,
                  isCurrentWord && styles.currentWordText,
                  isCurrentWord && { transform: [{ scale: wordPulseAnim }] },
                ]}
              >
                {word.text}{' '}
              </Animated.Text>
            );
          })}
        </View>

        {/* Transliteration */}
        {showTransliteration && (
          <View style={styles.wordsContainer}>
            {line.words.map((word, wordIndex) => {
              const isCurrentWord = isCurrentLine && wordIndex === currentWordIndex;
              const isPastWord = isCurrentLine && wordIndex < currentWordIndex;

              return (
                <Text
                  key={`trans-${word.id}`}
                  style={[
                    styles.transliterationText,
                    isPastLine && styles.pastTransliteration,
                    isPastWord && styles.pastTransliteration,
                    isFutureLine && styles.futureTransliteration,
                    isCurrentWord && styles.currentTransliteration,
                  ]}
                >
                  {word.transliteration}{' '}
                </Text>
              );
            })}
          </View>
        )}

        {/* Translation */}
        {showTranslation && isCurrentLine && (
          <Animated.Text
            style={[
              styles.translationText,
              { opacity: fadeAnim },
            ]}
          >
            {line.translation}
          </Animated.Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[shloka.thumbnailColor, '#1a1a2e', '#16213e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.nowPlaying}>NOW PLAYING</Text>
          <Text style={styles.title} numberOfLines={1}>{shloka.title}</Text>
          <Text style={styles.source}>{shloka.source}</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lyrics Display */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.lyricsContainer}
        contentContainerStyle={styles.lyricsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer for centering */}
        <View style={{ height: 100 }} />
        
        {shloka.lines.map((line, index) => renderLine(line, index))}
        
        {/* Bottom spacer */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showTransliteration && styles.toggleActive]}
          onPress={() => setShowTransliteration(!showTransliteration)}
        >
          <MaterialCommunityIcons
            name="alphabetical"
            size={20}
            color={showTransliteration ? '#fff' : '#888'}
          />
          <Text style={[styles.toggleText, showTransliteration && styles.toggleTextActive]}>
            Romanized
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showTranslation && styles.toggleActive]}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <MaterialCommunityIcons
            name="translate"
            size={20}
            color={showTranslation ? '#fff' : '#888'}
          />
          <Text style={[styles.toggleText, showTranslation && styles.toggleTextActive]}>
            Translation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <TouchableOpacity
          style={styles.progressBarBg}
          activeOpacity={0.9}
          onPress={(e) => {
            const { locationX } = e.nativeEvent;
            const percentage = locationX / (SCREEN_WIDTH - 100);
            seekTo(percentage * duration);
          }}
        >
          <View style={[styles.progressBarFill, { width: `${progress}%` }]}>
            <View style={styles.progressKnob} />
          </View>
        </TouchableOpacity>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Speed Control */}
        <TouchableOpacity style={styles.sideControl} onPress={changeSpeed}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(Math.max(0, currentTime - 10000))}
          >
            <MaterialCommunityIcons name="rewind-10" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
            <LinearGradient
              colors={[shloka.thumbnailColor, shloka.thumbnailColor + 'CC']}
              style={styles.playButtonGradient}
            >
              <MaterialCommunityIcons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(Math.min(duration, currentTime + 10000))}
          >
            <MaterialCommunityIcons name="fast-forward-10" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Restart */}
        <TouchableOpacity style={styles.sideControl} onPress={restart}>
          <MaterialCommunityIcons name="restart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Safe Area */}
      <View style={{ height: 34 }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  nowPlaying: {
    fontSize: 10,
    color: '#ffffff80',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  source: {
    fontSize: 12,
    color: '#ffffff80',
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsContainer: {
    flex: 1,
  },
  lyricsContent: {
    paddingHorizontal: 24,
  },
  lineContainer: {
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  currentLineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 6,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff60',
  },
  pastText: {
    color: '#ffffff40',
  },
  futureText: {
    color: '#ffffff50',
  },
  currentWordText: {
    color: '#fff',
    textShadowColor: 'rgba(255, 107, 53, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  transliterationText: {
    fontSize: 16,
    color: '#ffffff50',
    fontStyle: 'italic',
  },
  pastTransliteration: {
    color: '#ffffff30',
  },
  futureTransliteration: {
    color: '#ffffff40',
  },
  currentTransliteration: {
    color: '#FF6B35',
  },
  translationText: {
    fontSize: 14,
    color: '#ffffff70',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
  },
  toggleText: {
    fontSize: 12,
    color: '#888',
  },
  toggleTextActive: {
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff80',
    fontFamily: 'monospace',
    minWidth: 40,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  progressKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginRight: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  sideControl: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KaraokePlayer;
