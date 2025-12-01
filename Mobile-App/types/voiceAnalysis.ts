// Voice Analysis Types for Chandas Shastra Shloka Analysis

export interface VoiceAnalysisResult {
  id: string;
  shlokaId: string;
  shlokaTitle: string;
  timestamp: Date;
  overallScore: number; // 0-100
  confidence: number; // 0-100
  
  // Detailed Metrics
  metrics: AnalysisMetrics;
  
  // Chandas Analysis
  chandasAnalysis: ChandasAnalysis;
  
  // Pronunciation Analysis
  pronunciationAnalysis: PronunciationAnalysis;
  
  // Suggestions
  suggestions: Suggestion[];
  
  // Audio data
  audioDuration: number;
  audioUri?: string;
}

export interface AnalysisMetrics {
  // Core Metrics
  pronunciation: MetricScore;
  rhythm: MetricScore;
  tempo: MetricScore;
  clarity: MetricScore;
  intonation: MetricScore;
  
  // Advanced Metrics
  breathControl: MetricScore;
  consistency: MetricScore;
  emotionalExpression: MetricScore;
}

export interface MetricScore {
  score: number; // 0-100
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Practice';
  feedback: string;
  color: string;
}

export interface ChandasAnalysis {
  chandasName: string; // e.g., "Gayatri", "Anushtup", "Trishtup"
  chandasDescription: string;
  meterPattern: string; // e.g., "गा गा गा गा | गा गा गा गा"
  syllableCount: {
    expected: number;
    detected: number;
    accuracy: number;
  };
  laghuGuru: {
    pattern: string; // "U U - - U U - -" (U = laghu, - = guru)
    expectedPattern: string;
    accuracy: number;
  };
  padaAnalysis: PadaAnalysis[];
  overallAccuracy: number;
}

export interface PadaAnalysis {
  padaNumber: number;
  padaText: string;
  syllables: SyllableAnalysis[];
  timing: {
    expected: number; // in ms
    actual: number;
    deviation: number;
  };
}

export interface SyllableAnalysis {
  syllable: string;
  type: 'laghu' | 'guru'; // Short or Long
  expectedType: 'laghu' | 'guru';
  isCorrect: boolean;
  duration: number; // in ms
  expectedDuration: number;
}

export interface PronunciationAnalysis {
  overallAccuracy: number;
  wordAnalysis: WordPronunciationAnalysis[];
  commonErrors: PronunciationError[];
  strengths: string[];
}

export interface WordPronunciationAnalysis {
  word: string;
  transliteration: string;
  accuracy: number;
  phonemes: PhonemeAnalysis[];
  feedback: string;
}

export interface PhonemeAnalysis {
  phoneme: string;
  isCorrect: boolean;
  suggestion?: string;
}

export interface PronunciationError {
  type: 'vowel' | 'consonant' | 'aspiration' | 'nasalization' | 'timing';
  description: string;
  examples: string[];
  correction: string;
}

export interface Suggestion {
  id: string;
  category: 'pronunciation' | 'rhythm' | 'breathing' | 'expression' | 'chandas';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  tip: string;
}

// Recording State
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  amplitude: number[];
  currentAmplitude: number;
}

// Analysis State
export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number; // 0-100
  stage: 'idle' | 'recording' | 'processing' | 'analyzing' | 'complete' | 'error';
  message: string;
}

// Waveform Data
export interface WaveformData {
  samples: number[];
  duration: number;
  sampleRate: number;
}

// Reference Audio Comparison
export interface AudioComparison {
  userWaveform: WaveformData;
  referenceWaveform: WaveformData;
  alignmentScore: number;
  timingDifferences: TimingDifference[];
}

export interface TimingDifference {
  position: number; // in ms
  userTiming: number;
  referenceTiming: number;
  deviation: number;
}

// Shloka for Analysis
export interface ShlokaForAnalysis {
  id: string;
  title: string;
  subtitle: string;
  devanagariText: string;
  transliteration: string;
  chandas: string;
  expectedDuration: number;
  referenceAudioUrl?: string;
}

// Analysis History
export interface AnalysisHistoryItem {
  id: string;
  shlokaId: string;
  shlokaTitle: string;
  date: Date;
  score: number;
  duration: number;
}

// Gemini API Types
export interface GeminiAnalysisRequest {
  shlokaText: string;
  transliteration: string;
  chandas: string;
  audioDuration: number;
  // In real scenario, we'd send audio features
}

export interface GeminiAnalysisResponse {
  success: boolean;
  analysis?: VoiceAnalysisResult;
  error?: string;
}
