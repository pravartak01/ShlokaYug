import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShlokaSelector } from './ShlokaSelector';
import { RecordingControls } from '../karaoke/RecordingControls';
import { AnalyzingAnimation } from '../karaoke/AnalyzingAnimation';
import { AnalysisResults } from './AnalysisResults';
import { analyzeVoice, transformAnalysisResponse } from '../../../services/voiceAnalysisService';
import { ShlokaForAnalysis } from '../../../types/voiceAnalysis';
import { Audio } from 'expo-av';

type ViewMode = 'select' | 'practice' | 'analyzing' | 'results';

export const VoiceAnalysisScreen: React.FC = () => {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaForAnalysis | null>(null);

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedSound, setRecordedSound] = useState<Audio.Sound | null>(null);
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Initialize audio
  React.useEffect(() => {
    const initAudio = async () => {
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
  }, []);

  // Cleanup audio
  const cleanupAudio = async () => {
    try {
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

  const handleShlokaSelect = useCallback((shloka: ShlokaForAnalysis) => {
    setSelectedShloka(shloka);
    setViewMode('practice');
  }, []);

  const handleBackToSelection = useCallback(() => {
    setViewMode('select');
    setSelectedShloka(null);
    setRecordedUri(null);
    setRecordingDuration(0);
  }, []);

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

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
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
    if (!recordedUri || !selectedShloka) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    setViewMode('analyzing');

    try {
      const rawResponse = await analyzeVoice(recordedUri, selectedShloka.text);
      const transformedResponse = transformAnalysisResponse(rawResponse);
      
      setAnalysisResult(transformedResponse);
      setViewMode('results');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze recording. Please try again.');
      setViewMode('practice');
    }
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
            setViewMode('select');
            setAnalysisResult(null);
            setRecordedUri(null);
            setSelectedShloka(null);
          }}
        />
      </View>
    );
  }

  if (viewMode === 'select') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Voice Analysis</Text>
            <Text style={styles.subtitle}>Select a shloka to practice</Text>
          </View>
        </View>

        {/* Shloka Selection */}
        <ShlokaSelector onSelect={handleShlokaSelect} />
      </View>
    );
  }

  // Practice view with selected shloka
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToSelection} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#EFEBE9" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>
            {selectedShloka?.title}
          </Text>
          <Text style={styles.subtitle}>{selectedShloka?.source}</Text>
        </View>

        <View style={styles.headerActions} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shloka Display */}
        <View style={styles.shlokaCard}>
          <LinearGradient
            colors={['rgba(141, 110, 99, 0.1)', 'rgba(109, 76, 65, 0.05)']}
            style={styles.shlokaGradient}
          >
            <Text style={styles.shlokaText}>{selectedShloka?.text}</Text>
            {selectedShloka?.transliteration && (
              <Text style={styles.transliteration}>
                {selectedShloka.transliteration}
              </Text>
            )}
            {selectedShloka?.translation && (
              <Text style={styles.translation}>
                {selectedShloka.translation}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Recording Instructions */}
        <View style={styles.instructionsCard}>
          <MaterialCommunityIcons name="information" size={20} color="#8D6E63" />
          <Text style={styles.instructionsText}>
            Read the shloka aloud clearly. Your pronunciation, rhythm, and accuracy will be analyzed.
          </Text>
        </View>

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
  headerActions: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EFEBE9',
  },
  subtitle: {
    fontSize: 12,
    color: '#A1887F',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  shlokaCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shlokaGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A2E1C',
    borderRadius: 16,
  },
  shlokaText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EFEBE9',
    lineHeight: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  transliteration: {
    fontSize: 16,
    color: '#BCAAA4',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  translation: {
    fontSize: 14,
    color: '#A1887F',
    lineHeight: 20,
    textAlign: 'center',
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(141, 110, 99, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(141, 110, 99, 0.3)',
    marginBottom: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#D7CCC8',
    lineHeight: 20,
  },
});
