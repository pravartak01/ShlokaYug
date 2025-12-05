import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ShlokaData, ShlokaLine } from '../../../data/shlokas';
import { hasAudio, getAudioUrl } from '../../../data/shlokaAudioMap';
import { analyzeVoice, transformAnalysisResponse } from '../../../services/voiceAnalysisService';
import { AnalysisResults } from '../voice-analysis/AnalysisResults';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KaraokePlayerProps {
  shloka: ShlokaData;
  onBack: () => void;
  onComplete?: (score: number) => void;
}

type KaraokeMode = 'guide' | 'recording' | 'playback' | 'results';

const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  shloka,
  onBack,
  onComplete,
}) => {
  // Mode state
  const [mode, setMode] = useState<KaraokeMode>('guide');
  
  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordedSound, setRecordedSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reference Audio state (guide audio)
  const [referenceSound, setReferenceSound] = useState<Audio.Sound | null>(null);
  const [hasReferenceAudio, setHasReferenceAudio] = useState(false);

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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
  const recordPulseAnim = useRef(new Animated.Value(1)).current;

  // Settings
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await loadGuideAudio();
      setHasReferenceAudio(hasAudio(shloka.id));
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
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
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    if (referenceSound) {
      await referenceSound.unloadAsync();
    }
    if (recordedSound) {
      await recordedSound.unloadAsync();
    }
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const loadGuideAudio = async () => {
    try {
      const audioUrl = getAudioUrl(shloka.id);
      if (!audioUrl) {
        console.log('No guide audio available, using demo mode');
        setDuration(shloka.duration * 1000);
        setIsDemoMode(true);
        return;
      }

      const { sound: guideSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, progressUpdateIntervalMillis: 50 },
        onPlaybackStatusUpdate
      );

      setReferenceSound(guideSound);
      setSound(guideSound);
      console.log('Guide audio loaded successfully');
    } catch (error) {
      console.log('Guide audio load error:', error);
      setDuration(shloka.duration * 1000);
      setIsDemoMode(true);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis || shloka.duration * 1000);
      setIsPlaying(status.isPlaying);

      updateLyricPosition(status.positionMillis);

      if (status.didJustFinish) {
        handlePlaybackComplete();
      }
    }
  };

  const updateLyricPosition = (positionMs: number) => {
    let lineIdx = -1;
    let wordIdx = -1;

    for (let i = 0; i < shloka.lines.length; i++) {
      const line = shloka.lines[i];
      if (positionMs >= line.startTime && positionMs < line.endTime) {
        lineIdx = i;
        
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
      if (lineIdx >= 0 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: lineIdx * 140,
          animated: true,
        });
      }
    }

    if (wordIdx !== currentWordIndex) {
      setCurrentWordIndex(wordIdx);
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

  const handlePlaybackComplete = async () => {
    setIsPlaying(false);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }
    
    // After guide playback completes, prompt user to start recording
    if (mode === 'guide') {
      Alert.alert(
        'Ready to Practice?',
        'The guide playback is complete. Would you like to start recording your practice?',
        [
          { text: 'Listen Again', onPress: () => restart() },
          { text: 'Start Recording', onPress: () => startRecordingMode() },
        ]
      );
    }
  };

  // Start recording mode
  const startRecordingMode = () => {
    setMode('recording');
    setCurrentTime(0);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    setIsPlaying(false);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please grant microphone permission to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Duration counter
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 100);
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      recordPulseAnim.stopAnimation();
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setRecordedUri(uri);
        // Load recorded audio for playback
        const { sound: playbackSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        setRecordedSound(playbackSound);
        
        // Switch to playback mode
        setMode('playback');
        
        // Ask user what to do next
        Alert.alert(
          'Recording Complete!',
          'What would you like to do?',
          [
            { text: 'Play Recording', onPress: () => playRecording() },
            { text: 'Analyze Now', onPress: () => analyzeRecording(uri) },
            { text: 'Re-record', onPress: () => restartRecording() },
          ]
        );
      }

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  // Play recorded audio
  const playRecording = async () => {
    if (!recordedSound) return;
    
    try {
      await recordedSound.setPositionAsync(0);
      await recordedSound.playAsync();
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Restart recording
  const restartRecording = () => {
    setMode('recording');
    setRecordedUri(null);
    setRecordingDuration(0);
    if (recordedSound) {
      recordedSound.unloadAsync();
      setRecordedSound(null);
    }
  };

  // Analyze recording
  const analyzeRecording = async (uri: string) => {
    setIsAnalyzing(true);
    
    try {
      // Get full shloka text as reference
      const referenceShloka = shloka.lines.map(line => 
        line.words.map(w => w.text).join(' ')
      ).join('\n');
      
      const response = await analyzeVoice(uri, referenceShloka);
      const transformedResult = transformAnalysisResponse(response);
      
      setAnalysisResult(transformedResult);
      setMode('results');
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Failed to analyze your recording. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle guide playback
  const togglePlay = async () => {
    if (isDemoMode) {
      if (isPlaying) {
        stopDemoPlayback();
      } else {
        startDemoPlayback();
      }
      return;
    }

    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

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
        onPress={() => mode === 'guide' && seekTo(line.startTime)}
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

  // Show analysis results
  if (mode === 'results' && analysisResult) {
    return (
      <AnalysisResults
        result={analysisResult}
        onRetry={() => {
          setMode('recording');
          setAnalysisResult(null);
        }}
        onClose={onBack}
      />
    );
  }

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
          <Text style={styles.nowPlaying}>
            {mode === 'guide' ? 'GUIDE MODE' : 
             mode === 'recording' ? 'RECORDING MODE' :
             mode === 'playback' ? 'PLAYBACK MODE' : 'NOW PLAYING'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>{shloka.title}</Text>
          <Text style={styles.source}>{shloka.source}</Text>
        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            if (mode === 'guide') {
              startRecordingMode();
            } else if (mode === 'recording' || mode === 'playback') {
              setMode('guide');
              restart();
            }
          }}
        >
          <MaterialCommunityIcons 
            name={mode === 'guide' ? 'microphone' : 'headphones'} 
            size={24} 
            color="#fff" 
          />
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

      {/* Progress Bar (Guide and Playback mode) */}
      {(mode === 'guide' || mode === 'playback') && (
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <TouchableOpacity
            style={styles.progressBarBg}
            activeOpacity={0.9}
            onPress={(e) => {
              if (mode === 'guide') {
                const { locationX } = e.nativeEvent;
                const percentage = locationX / (SCREEN_WIDTH - 100);
                seekTo(percentage * duration);
              }
            }}
          >
            <View style={[styles.progressBarFill, { width: `${progress}%` }]}>
              <View style={styles.progressKnob} />
            </View>
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      )}

      {/* Recording Duration Display */}
      {mode === 'recording' && (
        <View style={styles.recordingDurationContainer}>
          <View style={styles.recordingIndicator}>
            <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
            <Text style={styles.recordingText}>
              {isRecording ? 'RECORDING' : 'READY TO RECORD'}
            </Text>
          </View>
          <Text style={styles.recordingTime}>{formatTime(recordingDuration)}</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Guide Mode Controls */}
        {mode === 'guide' && (
          <>
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
          </>
        )}

        {/* Recording Mode Controls */}
        {mode === 'recording' && (
          <View style={styles.recordingControls}>
            {!isRecording ? (
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <LinearGradient
                  colors={['#FF6B6B', '#EE5A6F']}
                  style={styles.recordButtonGradient}
                >
                  <MaterialCommunityIcons name="microphone" size={36} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ transform: [{ scale: recordPulseAnim }] }}>
                <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                  <View style={styles.stopButtonInner}>
                    <MaterialCommunityIcons name="stop" size={36} color="#fff" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
            <Text style={styles.recordButtonLabel}>
              {isRecording ? 'Tap to Stop' : 'Tap to Record'}
            </Text>
          </View>
        )}

        {/* Playback Mode Controls */}
        {mode === 'playback' && (
          <View style={styles.playbackControls}>
            <TouchableOpacity style={styles.actionButton} onPress={playRecording}>
              <MaterialCommunityIcons name="play-circle" size={48} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Play Recording</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => recordedUri && analyzeRecording(recordedUri)}
              disabled={isAnalyzing}
            >
              <MaterialCommunityIcons 
                name={isAnalyzing ? "loading" : "chart-line"} 
                size={48} 
                color="#FF9800" 
              />
              <Text style={styles.actionButtonText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={restartRecording}>
              <MaterialCommunityIcons name="refresh" size={48} color="#F44336" />
              <Text style={styles.actionButtonText}>Re-record</Text>
            </TouchableOpacity>
          </View>
        )}
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
  recordingDurationContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#666',
  },
  recordingDotActive: {
    backgroundColor: '#FF6B6B',
  },
  recordingText: {
    fontSize: 12,
    color: '#ffffff80',
    letterSpacing: 2,
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: '200',
    color: '#fff',
    fontFamily: 'monospace',
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
  recordingControls: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  playbackControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default KaraokePlayer;
