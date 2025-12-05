import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { ShlokaData } from '../../../data/shlokas';
import { hasAudio, getAudioUrl } from '../../../data/shlokaAudioMap';
import { analyzeVoice, transformAnalysisResponse } from '../../../services/voiceAnalysisService';
import { LyricsDisplay } from './LyricsDisplay';
import { RecordingControls } from './RecordingControls';
import { AnalyzingAnimation } from './AnalyzingAnimation';
import { AnalysisResults } from '../voice-analysis/AnalysisResults';

interface KaraokePlayerProps {
  shloka: ShlokaData;
  onBack: () => void;
  onComplete?: (score: number) => void;
}

type ViewMode = 'practice' | 'analyzing' | 'results';

const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  shloka,
  onBack,
  onComplete,
}) => {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('practice');
  
  // Reference audio state (for preview only)
  const [referenceSound, setReferenceSound] = useState<Audio.Sound | null>(null);
  const [hasReferenceAudio, setHasReferenceAudio] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedSound, setRecordedSound] = useState<Audio.Sound | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Lyric display state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Animation
  const wordPulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      setHasReferenceAudio(hasAudio(shloka.id));
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    };
    
    initAudio();
    
    return () => {
      cleanupAudio();
    };
  }, [shloka.id]);

  // Word pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(wordPulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(wordPulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [wordPulseAnim]);

  // Cleanup audio
  const cleanupAudio = async () => {
    try {
      if (referenceSound) {
        await referenceSound.stopAsync();
        await referenceSound.unloadAsync();
      }
      if (recordedSound) {
        await recordedSound.stopAsync();
        await recordedSound.unloadAsync();
      }
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // Load reference audio
  const loadReferenceAudio = async () => {
    try {
      const audioUrl = getAudioUrl(shloka.id);
      if (!audioUrl) return;

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setReferenceSound(sound);
    } catch (error) {
      console.error('Error loading reference audio:', error);
    }
  };

  // Play/pause reference audio
  const toggleReferenceAudio = async () => {
    try {
      if (!referenceSound) {
        await loadReferenceAudio();
        return;
      }

      const status = await referenceSound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await referenceSound.pauseAsync();
          setIsPlayingReference(false);
        } else {
          await referenceSound.playAsync();
          setIsPlayingReference(true);
        }
      }
    } catch (error) {
      console.error('Error toggling reference audio:', error);
      Alert.alert('Error', 'Failed to play reference audio');
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
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
      setCurrentLineIndex(0);
      setCurrentWordIndex(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Auto-scroll lyrics
      startLyricsAnimation();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      setIsRecording(false);
      setRecordedUri(uri);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Load recorded audio for playback
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setRecordedSound(sound);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    try {
      if (!recordedSound) return;

      const status = await recordedSound.getStatusAsync();
      if (status.isLoaded) {
        await recordedSound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const analyzeRecording = async () => {
    if (!recordedUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    setViewMode('analyzing');

    try {
      const shlokaText = shloka.lines.map(line => 
        line.words.map(word => word.text).join(' ')
      ).join(' ');
      const rawResponse = await analyzeVoice(recordedUri, shlokaText);
      const transformedResponse = transformAnalysisResponse(rawResponse);
      
      setAnalysisResult(transformedResponse);
      setViewMode('results');
      
      if (onComplete && transformedResponse.overallScore) {
        onComplete(transformedResponse.overallScore);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze recording. Please try again.');
      setViewMode('practice');
    }
  };

  // Lyrics animation
  const startLyricsAnimation = () => {
    const totalWords = shloka.lines.reduce((acc, line) => acc + line.words.length, 0);
    const wordsPerSecond = totalWords / (recordingDuration || 30);
    
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        const currentLine = shloka.lines[currentLineIndex];
        if (!currentLine) return prev;

        if (prev < currentLine.words.length - 1) {
          return prev + 1;
        } else {
          setCurrentLineIndex(prevLine => {
            if (prevLine < shloka.lines.length - 1) {
              setCurrentWordIndex(0);
              return prevLine + 1;
            }
            clearInterval(interval);
            return prevLine;
          });
          return prev;
        }
      });
    }, 1000 / wordsPerSecond);

    return () => clearInterval(interval);
  };

  // Render based on view mode
  if (viewMode === 'analyzing') {
    return (
      <View style={styles.container}>
        <AnalyzingAnimation message="Analyzing your pronunciation..." />
      </View>
    );
  }

  if (viewMode === 'results' && analysisResult) {
    return (
      <View style={styles.container}>
        <AnalysisResults
          result={analysisResult}
          onClose={() => {
            setViewMode('practice');
            setAnalysisResult(null);
            setRecordedUri(null);
          }}
        />
      </View>
    );
  }

  // Main practice view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#EFEBE9" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>
            {shloka.title}
          </Text>
          <Text style={styles.source}>{shloka.source}</Text>
        </View>

        <View style={styles.headerActions}>
          {hasReferenceAudio && (
            <TouchableOpacity
              onPress={toggleReferenceAudio}
              style={styles.referenceButton}
            >
              <LinearGradient
                colors={isPlayingReference ? ['#4CAF50', '#388E3C'] : ['rgba(141, 110, 99, 0.3)', 'rgba(109, 76, 65, 0.3)']}
                style={styles.referenceButtonGradient}
              >
                <MaterialCommunityIcons
                  name={isPlayingReference ? 'pause' : 'play'}
                  size={20}
                  color="#EFEBE9"
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable Lyrics */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LyricsDisplay
          lines={shloka.lines}
          currentLineIndex={currentLineIndex}
          currentWordIndex={currentWordIndex}
          showTransliteration={showTransliteration}
          showTranslation={showTranslation}
          wordPulseAnim={wordPulseAnim}
        />

        {/* Recording Controls */}
        <RecordingControls
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          hasRecording={!!recordedUri}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPlayRecording={playRecording}
          onAnalyze={analyzeRecording}
        />

        {/* Display Options */}
        <View style={styles.displayOptions}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setShowTransliteration(!showTransliteration)}
          >
            <MaterialCommunityIcons
              name={showTransliteration ? 'eye' : 'eye-off'}
              size={20}
              color={showTransliteration ? '#8D6E63' : '#666'}
            />
            <Text style={[styles.optionText, !showTransliteration && styles.optionTextDisabled]}>
              Transliteration
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <MaterialCommunityIcons
              name={showTranslation ? 'eye' : 'eye-off'}
              size={20}
              color={showTranslation ? '#8D6E63' : '#666'}
            />
            <Text style={[styles.optionText, !showTranslation && styles.optionTextDisabled]}>
              Translation
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EFEBE9',
  },
  source: {
    fontSize: 12,
    color: '#A1887F',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  referenceButton: {
    borderRadius: 20,
  },
  referenceButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A2E1C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for bottom navbar
  },
  displayOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  optionText: {
    fontSize: 14,
    color: '#D7CCC8',
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: '#666',
  },
});

export default KaraokePlayer;
