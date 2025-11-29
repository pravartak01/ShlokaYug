// VoiceAnalysisScreen - Main Voice Analysis screen with complete flow
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VoiceRecorder } from './VoiceRecorder';
import { ShlokaSelector } from './ShlokaSelector';
import { AnalysisResults } from './AnalysisResults';
import { AnalyzingOverlay } from './AnalyzingOverlay';
import { analyzeVoice } from '../../../services/geminiService';
import { VoiceAnalysisResult, ShlokaForAnalysis } from '../../../types/voiceAnalysis';

type AnalysisStep = 'select' | 'record' | 'analyzing' | 'results';

interface VoiceAnalysisScreenProps {
  onBack?: () => void;
}

const ANALYSIS_STAGES = ['audio', 'speech', 'pronunciation', 'chandas', 'rhythm', 'ai', 'report'];

export const VoiceAnalysisScreen: React.FC<VoiceAnalysisScreenProps> = ({
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('select');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaForAnalysis | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('audio');

  const handleShlokaSelect = useCallback((shloka: ShlokaForAnalysis) => {
    setSelectedShloka(shloka);
  }, []);

  const handleStartRecording = useCallback(() => {
    if (!selectedShloka) return;
    setCurrentStep('record');
  }, [selectedShloka]);

  const handleRecordingComplete = useCallback(async (uri: string, duration: number) => {
    if (!selectedShloka) return;

    setCurrentStep('analyzing');
    setAnalysisProgress(0);
    setAnalysisStage('audio');

    // Simulate progressive analysis stages
    const stageInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const newProgress = prev + (100 / (ANALYSIS_STAGES.length * 5));
        
        // Update stage based on progress
        const stageIndex = Math.min(
          Math.floor((newProgress / 100) * ANALYSIS_STAGES.length),
          ANALYSIS_STAGES.length - 1
        );
        setAnalysisStage(ANALYSIS_STAGES[stageIndex]);

        if (newProgress >= 100) {
          clearInterval(stageInterval);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    try {
      // Call Gemini API for analysis
      const result = await analyzeVoice(selectedShloka, duration);
      
      // Ensure progress completes
      clearInterval(stageInterval);
      setAnalysisProgress(100);
      setAnalysisStage('report');

      // Small delay to show complete state
      setTimeout(() => {
        setAnalysisResult(result);
        setCurrentStep('results');
      }, 500);
    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(stageInterval);
      // Could show error state here
      setCurrentStep('record');
    }
  }, [selectedShloka]);

  const handleRetry = useCallback(() => {
    setAnalysisResult(null);
    setCurrentStep('record');
    setAnalysisProgress(0);
  }, []);

  const handleBackToSelect = useCallback(() => {
    setSelectedShloka(null);
    setAnalysisResult(null);
    setCurrentStep('select');
    setAnalysisProgress(0);
  }, []);

  const renderHeader = () => {
    if (currentStep === 'results') return null;

    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={currentStep === 'select' ? onBack : handleBackToSelect}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Voice Analysis</Text>
          <View style={styles.stepIndicator}>
            {['select', 'record', 'results'].map((step, index) => (
              <View key={step} style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepDot,
                    (currentStep === step || 
                      (currentStep === 'analyzing' && step === 'record')) && 
                      styles.stepDotActive,
                    index < ['select', 'record', 'analyzing', 'results'].indexOf(currentStep) &&
                      styles.stepDotCompleted,
                  ]}
                >
                  {index < ['select', 'record', 'analyzing', 'results'].indexOf(currentStep) && (
                    <MaterialCommunityIcons name="check" size={10} color="white" />
                  )}
                </View>
                {index < 2 && (
                  <View
                    style={[
                      styles.stepLine,
                      index < ['select', 'record', 'analyzing', 'results'].indexOf(currentStep) &&
                        styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.headerRight} />
      </View>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <View style={styles.content}>
            <ShlokaSelector
              onSelect={handleShlokaSelect}
              selectedShloka={selectedShloka || undefined}
            />
            
            {selectedShloka && (
              <View style={styles.selectedShlokaPreview}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Selected Shloka</Text>
                </View>
                <Text style={styles.previewDevanagari}>
                  {selectedShloka.devanagariText}
                </Text>
                <Text style={styles.previewTransliteration}>
                  {selectedShloka.transliteration}
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartRecording}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#9333EA'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                  >
                    <MaterialCommunityIcons name="microphone" size={24} color="white" />
                    <Text style={styles.startButtonText}>Start Recording</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'record':
        return (
          <View style={styles.content}>
            {selectedShloka && (
              <View style={styles.shlokaDisplayCard}>
                <Text style={styles.shlokaDisplayTitle}>{selectedShloka.title}</Text>
                <Text style={styles.shlokaDisplayDevanagari}>
                  {selectedShloka.devanagariText}
                </Text>
                <Text style={styles.shlokaDisplayTransliteration}>
                  {selectedShloka.transliteration}
                </Text>
              </View>
            )}
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              shlokaTitle={selectedShloka?.title}
              isAnalyzing={false}
            />
          </View>
        );

      case 'results':
        return analysisResult ? (
          <AnalysisResults
            result={analysisResult}
            onRetry={handleRetry}
            onClose={handleBackToSelect}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460'] as const}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {renderHeader()}
          {renderContent()}

          {/* Analyzing Overlay */}
          <AnalyzingOverlay
            visible={currentStep === 'analyzing'}
            progress={analysisProgress}
            stage={analysisStage}
            shlokaTitle={selectedShloka?.title}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#9333EA',
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  selectedShlokaPreview: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333EA',
  },
  previewDevanagari: {
    fontSize: 18,
    color: 'white',
    lineHeight: 28,
    marginBottom: 8,
    fontWeight: '500',
  },
  previewTransliteration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  shlokaDisplayCard: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  shlokaDisplayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333EA',
    marginBottom: 10,
    textAlign: 'center',
  },
  shlokaDisplayDevanagari: {
    fontSize: 18,
    color: 'white',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  shlokaDisplayTransliteration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default VoiceAnalysisScreen;
