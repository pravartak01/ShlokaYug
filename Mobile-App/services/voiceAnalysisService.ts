/**
 * Voice Analysis Service
 * Handles voice recording analysis using the AI backend API
 */

import { AI_BACKEND_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceAnalysisResponse {
  accuracy_metrics: {
    meter_accuracy: number;
    overall_accuracy: number;
    pronunciation_clarity: number;
    syllable_accuracy: number;
    word_accuracy: number;
  };
  errors: {
    actual: string;
    error_type: string;
    expected: string;
    note: string;
    position: number;
    severity: 'minor' | 'moderate' | 'major';
  }[];
  identified_shloka?: {
    confidence: number;
    meaning: string;
    meter: string;
    source: string;
    text: string;
  };
  overall_feedback: string;
  suggestions: string;
  transcribed_text: string;
}

export interface AnalyzeVoiceParams {
  audioUri: string;
  referenceShloka?: string;
}

/**
 * Analyze Sanskrit pronunciation from audio recording
 * @param audioUri - Local URI of the audio file
 * @param referenceShloka - Optional reference shloka text (will auto-detect if not provided)
 * @returns Voice analysis results with accuracy metrics and suggestions
 */
export const analyzeVoice = async (
  audioUri: string,
  referenceShloka?: string
): Promise<VoiceAnalysisResponse> => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = audioUri.split('/').pop() || 'recording.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/m4a';
    
    // Append audio file
    formData.append('audio', {
      uri: audioUri,
      type: type,
      name: filename,
    } as any);
    
    // Append reference shloka if provided
    if (referenceShloka) {
      formData.append('reference_shloka', referenceShloka);
    }
    
    // Get auth token
    const token = await AsyncStorage.getItem('authToken');
    
    console.log('🎤 Voice Analysis Request:', {
      url: `${AI_BACKEND_URL}/voice/analyze`,
      hasAudio: !!audioUri,
      hasReference: !!referenceShloka,
      audioUri: audioUri,
    });
    
    // Make API request to AI Backend (port 8000)
    const response = await fetch(`${AI_BACKEND_URL}/voice/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Note: Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData,
    });
    
    console.log('✅ Voice Analysis Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Voice Analysis Error:', errorData);
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    const data: VoiceAnalysisResponse = await response.json();
    return data;
    
  } catch (error) {
    console.error('Voice analysis error:', error);
    throw error;
  }
};

/**
 * Convert backend response to internal format used by the app
 */
export const transformAnalysisResponse = (
  response: VoiceAnalysisResponse
) => {
  const { accuracy_metrics, errors, overall_feedback, suggestions, identified_shloka } = response;
  
  return {
    id: Date.now().toString(),
    shlokaId: identified_shloka?.source || 'unknown',
    shlokaTitle: identified_shloka?.source || 'Unknown Shloka',
    timestamp: new Date(),
    overallScore: Math.round(accuracy_metrics.overall_accuracy * 100),
    confidence: identified_shloka?.confidence 
      ? Math.round(identified_shloka.confidence * 100) 
      : 100,
    audioDuration: 0,
    
    // Detailed Metrics
    metrics: {
      pronunciation: {
        score: Math.round(accuracy_metrics.pronunciation_clarity * 100),
        label: getMetricLabel(accuracy_metrics.pronunciation_clarity * 100),
        feedback: suggestions,
        color: getMetricColor(accuracy_metrics.pronunciation_clarity * 100),
      },
      rhythm: {
        score: Math.round(accuracy_metrics.meter_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.meter_accuracy * 100),
        feedback: 'Rhythm and meter analysis',
        color: getMetricColor(accuracy_metrics.meter_accuracy * 100),
      },
      tempo: {
        score: Math.round(accuracy_metrics.syllable_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.syllable_accuracy * 100),
        feedback: 'Tempo consistency',
        color: getMetricColor(accuracy_metrics.syllable_accuracy * 100),
      },
      clarity: {
        score: Math.round(accuracy_metrics.word_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.word_accuracy * 100),
        feedback: 'Word clarity and enunciation',
        color: getMetricColor(accuracy_metrics.word_accuracy * 100),
      },
      intonation: {
        score: Math.round(accuracy_metrics.overall_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.overall_accuracy * 100),
        feedback: overall_feedback,
        color: getMetricColor(accuracy_metrics.overall_accuracy * 100),
      },
      breathControl: {
        score: Math.round(accuracy_metrics.overall_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.overall_accuracy * 100),
        feedback: 'Breath control assessment',
        color: getMetricColor(accuracy_metrics.overall_accuracy * 100),
      },
      consistency: {
        score: Math.round(accuracy_metrics.overall_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.overall_accuracy * 100),
        feedback: 'Consistency throughout',
        color: getMetricColor(accuracy_metrics.overall_accuracy * 100),
      },
      emotionalExpression: {
        score: Math.round(accuracy_metrics.overall_accuracy * 100),
        label: getMetricLabel(accuracy_metrics.overall_accuracy * 100),
        feedback: 'Emotional expression',
        color: getMetricColor(accuracy_metrics.overall_accuracy * 100),
      },
    },
    
    // Chandas Analysis
    chandasAnalysis: {
      chandasName: identified_shloka?.meter || 'Unknown',
      chandasDescription: identified_shloka?.meaning || 'Meter analysis',
      meterPattern: identified_shloka?.meter || '',
      syllableCount: {
        expected: 32,
        detected: Math.round(accuracy_metrics.syllable_accuracy * 32),
        accuracy: Math.round(accuracy_metrics.syllable_accuracy * 100),
      },
      laghuGuru: {
        pattern: '',
        expectedPattern: '',
        accuracy: Math.round(accuracy_metrics.meter_accuracy * 100),
      },
      padaAnalysis: [],
      overallAccuracy: Math.round(accuracy_metrics.meter_accuracy * 100),
    },
    
    // Pronunciation Analysis
    pronunciationAnalysis: {
      overallAccuracy: Math.round(accuracy_metrics.pronunciation_clarity * 100),
      wordAnalysis: [],
      commonErrors: errors.map(err => ({
        type: err.error_type,
        word: err.actual,
        expectedPronunciation: err.expected,
        actualPronunciation: err.actual,
        severity: err.severity,
        feedback: err.note,
        position: err.position,
      })),
      strengths: suggestions.split('.').filter(s => s.trim().length > 0),
    },
    
    // Suggestions
    suggestions: [
      {
        id: '1',
        category: 'pronunciation' as const,
        priority: 'high' as const,
        icon: 'microphone',
        title: 'Pronunciation Improvement',
        description: overall_feedback,
        tip: suggestions,
      },
      ...errors.slice(0, 3).map((err, index) => ({
        id: `${index + 2}`,
        category: 'pronunciation' as const,
        priority: err.severity === 'major' ? 'high' as const : 'medium' as const,
        icon: 'alert-circle',
        title: `Fix ${err.error_type}`,
        description: err.note,
        tip: `Practice: ${err.expected}`,
      })),
    ],
  };
};

/**
 * Get metric label based on score
 */
const getMetricLabel = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Practice' => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Practice';
};

/**
 * Get color for metric based on score
 */
const getMetricColor = (score: number): string => {
  if (score >= 85) return '#4CAF50';
  if (score >= 70) return '#8BC34A';
  if (score >= 50) return '#FF9800';
  return '#F44336';
};

/**
 * Format error severity for display
 */
export const formatErrorSeverity = (severity: string): string => {
  switch (severity) {
    case 'minor':
      return 'Minor';
    case 'moderate':
      return 'Moderate';
    case 'major':
      return 'Major';
    default:
      return severity;
  }
};

/**
 * Get error severity color
 */
export const getErrorSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'minor':
      return '#FFC107';
    case 'moderate':
      return '#FF9800';
    case 'major':
      return '#F44336';
    default:
      return '#999';
  }
};
