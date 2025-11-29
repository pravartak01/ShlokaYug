// AnalysisResults Component - Detailed voice analysis results display
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  VoiceAnalysisResult,
  MetricScore,
  Suggestion,
} from '../../../types/voiceAnalysis';

interface AnalysisResultsProps {
  result: VoiceAnalysisResult;
  onRetry: () => void;
  onClose: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  onRetry,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnim, {
        toValue: result.overallScore,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scoreAnim, result.overallScore]);

  const getScoreGradient = (score: number): readonly [string, string] => {
    if (score >= 85) return ['#4CAF50', '#8BC34A'] as const;
    if (score >= 70) return ['#8BC34A', '#CDDC39'] as const;
    if (score >= 50) return ['#FF9800', '#FFC107'] as const;
    return ['#F44336', '#FF5722'] as const;
  };

  const renderScoreCircle = () => {
    return (
      <View style={styles.scoreCircleContainer}>
        <View style={styles.scoreCircleOuter}>
          <LinearGradient
            colors={getScoreGradient(result.overallScore)}
            style={styles.scoreCircleGradient}
          >
            <View style={styles.scoreCircleInner}>
              <Text style={styles.scoreValue}>{result.overallScore}</Text>
              <Text style={styles.scoreLabel}>Overall Score</Text>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.confidenceContainer}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
          <Text style={styles.confidenceText}>
            {result.confidence}% Confidence
          </Text>
        </View>
      </View>
    );
  };

  const renderMetricBar = (metric: MetricScore, label: string, icon: string) => (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <View style={styles.metricLabelContainer}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={metric.color}
          />
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
        <View style={styles.metricScoreContainer}>
          <Text style={[styles.metricScore, { color: metric.color }]}>
            {metric.score}%
          </Text>
          <Text style={[styles.metricScoreLabel, { color: metric.color }]}>
            {metric.label}
          </Text>
        </View>
      </View>
      <View style={styles.metricBarContainer}>
        <View style={styles.metricBarBackground}>
          <Animated.View
            style={[
              styles.metricBarFill,
              {
                width: `${metric.score}%`,
                backgroundColor: metric.color,
              },
            ]}
          />
        </View>
      </View>
      <Text style={styles.metricFeedback}>{metric.feedback}</Text>
    </View>
  );

  const renderChandasAnalysis = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="music-note" size={22} color="#9333EA" />
        <Text style={styles.sectionTitle}>Chandas Analysis</Text>
      </View>

      <View style={styles.chandasInfoRow}>
        <View style={styles.chandasInfoItem}>
          <Text style={styles.chandasInfoLabel}>Meter</Text>
          <Text style={styles.chandasInfoValue}>
            {result.chandasAnalysis.chandasName}
          </Text>
        </View>
        <View style={styles.chandasInfoItem}>
          <Text style={styles.chandasInfoLabel}>Accuracy</Text>
          <Text style={[styles.chandasInfoValue, { color: '#4CAF50' }]}>
            {result.chandasAnalysis.overallAccuracy}%
          </Text>
        </View>
      </View>

      <Text style={styles.chandasDescription}>
        {result.chandasAnalysis.chandasDescription}
      </Text>

      <View style={styles.meterPatternContainer}>
        <Text style={styles.meterPatternLabel}>Laghu-Guru Pattern:</Text>
        <View style={styles.meterPatternBox}>
          <Text style={styles.meterPatternText}>
            {result.chandasAnalysis.laghuGuru.pattern}
          </Text>
        </View>
        <View style={styles.patternLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>L = Laghu (short)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>G = Guru (long)</Text>
          </View>
        </View>
      </View>

      <View style={styles.syllableCountContainer}>
        <View style={styles.syllableItem}>
          <Text style={styles.syllableLabel}>Expected Syllables</Text>
          <Text style={styles.syllableValue}>
            {result.chandasAnalysis.syllableCount.expected}
          </Text>
        </View>
        <View style={styles.syllableDivider} />
        <View style={styles.syllableItem}>
          <Text style={styles.syllableLabel}>Detected Syllables</Text>
          <Text style={styles.syllableValue}>
            {result.chandasAnalysis.syllableCount.detected}
          </Text>
        </View>
        <View style={styles.syllableDivider} />
        <View style={styles.syllableItem}>
          <Text style={styles.syllableLabel}>Match Accuracy</Text>
          <Text style={[styles.syllableValue, { color: '#4CAF50' }]}>
            {result.chandasAnalysis.syllableCount.accuracy}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPronunciationAnalysis = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="account-voice" size={22} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Pronunciation Analysis</Text>
      </View>

      <View style={styles.pronunciationScore}>
        <Text style={styles.pronunciationScoreLabel}>Overall Accuracy</Text>
        <View style={styles.pronunciationScoreBar}>
          <View
            style={[
              styles.pronunciationScoreFill,
              { width: `${result.pronunciationAnalysis.overallAccuracy}%` },
            ]}
          />
        </View>
        <Text style={styles.pronunciationScoreValue}>
          {result.pronunciationAnalysis.overallAccuracy}%
        </Text>
      </View>

      {/* Strengths */}
      <View style={styles.strengthsContainer}>
        <Text style={styles.strengthsTitle}>✨ Strengths</Text>
        {result.pronunciationAnalysis.strengths.map((strength, index) => (
          <View key={index} style={styles.strengthItem}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.strengthText}>{strength}</Text>
          </View>
        ))}
      </View>

      {/* Common Errors */}
      {result.pronunciationAnalysis.commonErrors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsTitle}>⚠️ Areas for Improvement</Text>
          {result.pronunciationAnalysis.commonErrors.map((error, index) => (
            <View key={index} style={styles.errorItem}>
              <View style={styles.errorHeader}>
                <View style={[styles.errorTypeBadge, { 
                  backgroundColor: error.type === 'vowel' ? '#FF9800' : 
                    error.type === 'consonant' ? '#F44336' : '#9C27B0' 
                }]}>
                  <Text style={styles.errorTypeText}>{error.type}</Text>
                </View>
              </View>
              <Text style={styles.errorDescription}>{error.description}</Text>
              <View style={styles.correctionContainer}>
                <MaterialCommunityIcons name="lightbulb-on" size={14} color="#FFD700" />
                <Text style={styles.correctionText}>{error.correction}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSuggestions = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="lightbulb-on" size={22} color="#FFD700" />
        <Text style={styles.sectionTitle}>Personalized Suggestions</Text>
      </View>

      {result.suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Complete</Text>
          <Text style={styles.subtitle}>{result.shlokaTitle}</Text>
        </View>

        {/* Score Circle */}
        {renderScoreCircle()}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF6B6B" />
            <Text style={styles.quickStatValue}>
              {Math.floor(result.audioDuration / 1000)}s
            </Text>
            <Text style={styles.quickStatLabel}>Duration</Text>
          </View>
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="music-note-eighth" size={20} color="#9333EA" />
            <Text style={styles.quickStatValue}>
              {result.chandasAnalysis.chandasName}
            </Text>
            <Text style={styles.quickStatLabel}>Chandas</Text>
          </View>
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#3B82F6" />
            <Text style={styles.quickStatValue}>
              {result.metrics.pronunciation.label}
            </Text>
            <Text style={styles.quickStatLabel}>Level</Text>
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-bar" size={22} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Detailed Metrics</Text>
          </View>
          
          {renderMetricBar(result.metrics.pronunciation, 'Pronunciation', 'microphone')}
          {renderMetricBar(result.metrics.rhythm, 'Rhythm & Tempo', 'metronome')}
          {renderMetricBar(result.metrics.clarity, 'Voice Clarity', 'volume-high')}
          {renderMetricBar(result.metrics.intonation, 'Intonation', 'sine-wave')}
          {renderMetricBar(result.metrics.breathControl, 'Breath Control', 'weather-windy')}
          {renderMetricBar(result.metrics.consistency, 'Consistency', 'chart-timeline-variant')}
          {renderMetricBar(result.metrics.emotionalExpression, 'Expression', 'heart')}
        </View>

        {/* Chandas Analysis */}
        {renderChandasAnalysis()}

        {/* Pronunciation Analysis */}
        {renderPronunciationAnalysis()}

        {/* Suggestions */}
        {renderSuggestions()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
          >
            <LinearGradient
              colors={['#FF6B6B', '#9333EA'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryButtonGradient}
            >
              <MaterialCommunityIcons name="microphone" size={20} color="white" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {}}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
};

// Suggestion Card Component
const SuggestionCard: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#888';
    }
  };

  const getCategoryGradient = (category: string): readonly [string, string] => {
    switch (category) {
      case 'pronunciation': return ['#3B82F6', '#60A5FA'] as const;
      case 'chandas': return ['#9333EA', '#A855F7'] as const;
      case 'rhythm': return ['#FF6B6B', '#F87171'] as const;
      case 'breathing': return ['#10B981', '#34D399'] as const;
      case 'expression': return ['#F59E0B', '#FBBF24'] as const;
      default: return ['#6B7280', '#9CA3AF'] as const;
    }
  };

  return (
    <View style={styles.suggestionCard}>
      <LinearGradient
        colors={getCategoryGradient(suggestion.category)}
        style={styles.suggestionIcon}
      >
        <MaterialCommunityIcons
          name={suggestion.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={20}
          color="white"
        />
      </LinearGradient>
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
            <Text style={styles.priorityText}>{suggestion.priority}</Text>
          </View>
        </View>
        <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
        <View style={styles.suggestionTipContainer}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color="#FFD700" />
          <Text style={styles.suggestionTip}>{suggestion.tip}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  scoreCircleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  scoreCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 10,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  metricScoreContainer: {
    alignItems: 'flex-end',
  },
  metricScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricScoreLabel: {
    fontSize: 10,
  },
  metricBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricFeedback: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  chandasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  chandasInfoItem: {
    alignItems: 'center',
  },
  chandasInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  chandasInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  chandasDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  meterPatternContainer: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  meterPatternLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  meterPatternBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  meterPatternText: {
    fontSize: 16,
    color: '#9333EA',
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  patternLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  syllableCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syllableItem: {
    flex: 1,
    alignItems: 'center',
  },
  syllableDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  syllableLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  syllableValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  pronunciationScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pronunciationScoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    width: 100,
  },
  pronunciationScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  pronunciationScoreFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  pronunciationScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    width: 40,
    textAlign: 'right',
  },
  strengthsContainer: {
    marginBottom: 16,
  },
  strengthsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  strengthText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
    flex: 1,
  },
  errorsContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  errorItem: {
    marginBottom: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  errorTypeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  errorDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  correctionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  correctionText: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 6,
    flex: 1,
  },
  suggestionCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 8,
  },
  suggestionTipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  suggestionTip: {
    fontSize: 11,
    color: '#FFD700',
    marginLeft: 6,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default AnalysisResults;
