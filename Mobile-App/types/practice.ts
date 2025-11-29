// Practice Module Types
// Comprehensive type definitions for Karaoke, Voice Analysis, and Challenges

// ============================================
// COMMON TYPES
// ============================================

export type PracticeType = 'karaoke' | 'voice-analysis' | 'challenges';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type Language = 'sanskrit' | 'hindi' | 'english';

export interface PracticeSession {
  id: string;
  type: PracticeType;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  score?: number;
  completed: boolean;
}

export interface AudioRecording {
  uri: string;
  duration: number;
  mimeType: string;
  fileSize?: number;
  createdAt: Date;
}

export interface PracticeProgress {
  totalSessions: number;
  totalPracticeTime: number; // in minutes
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
}

// ============================================
// KARAOKE TYPES
// ============================================

export interface Shloka {
  id: string;
  title: string;
  originalText: string;
  transliteration: string;
  translation: string;
  meaning: string;
  audioUrl: string;
  duration: number;
  difficulty: DifficultyLevel;
  language: Language;
  category: string;
  source?: string;
  verses: ShlokaVerse[];
  tags: string[];
  practiceCount: number;
  averageRating: number;
}

export interface ShlokaVerse {
  id: string;
  text: string;
  transliteration: string;
  startTime: number; // in milliseconds
  endTime: number;
  words: ShlokaWord[];
}

export interface ShlokaWord {
  id: string;
  text: string;
  transliteration: string;
  meaning: string;
  startTime: number;
  endTime: number;
  phonemes?: string[];
}

export interface KaraokeSession {
  id: string;
  shlokaId: string;
  shloka: Shloka;
  status: 'preparing' | 'playing' | 'recording' | 'paused' | 'completed' | 'analyzing';
  currentVerseIndex: number;
  currentWordIndex: number;
  startTime?: Date;
  recordingUri?: string;
  score?: KaraokeScore;
}

export interface KaraokeScore {
  overall: number;
  pronunciation: number;
  timing: number;
  fluency: number;
  accuracy: number;
  breakdown: ScoreBreakdown[];
  feedback: string[];
  improvements: string[];
}

export interface ScoreBreakdown {
  verseIndex: number;
  verseScore: number;
  wordScores: WordScore[];
}

export interface WordScore {
  wordIndex: number;
  word: string;
  score: number;
  timingAccuracy: number;
  pronunciationAccuracy: number;
  issues?: string[];
}

export interface KaraokeSettings {
  showTransliteration: boolean;
  showTranslation: boolean;
  playbackSpeed: number; // 0.5 to 2.0
  highlightMode: 'word' | 'line' | 'verse';
  autoScroll: boolean;
  countdownDuration: number; // in seconds
  enableMicrophone: boolean;
  showGuideVocal: boolean;
}

// ============================================
// VOICE ANALYSIS TYPES
// ============================================

export interface VoiceAnalysisSession {
  id: string;
  referenceText: string;
  referenceAudioUrl?: string;
  userRecordingUri: string;
  status: 'recording' | 'analyzing' | 'completed' | 'error';
  result?: VoiceAnalysisResult;
  createdAt: Date;
}

export interface VoiceAnalysisResult {
  id: string;
  overallScore: number;
  pronunciation: PronunciationAnalysis;
  rhythm: RhythmAnalysis;
  pitch: PitchAnalysis;
  fluency: FluencyAnalysis;
  recommendations: string[];
  detailedFeedback: DetailedFeedback[];
}

export interface PronunciationAnalysis {
  score: number;
  accuracy: number;
  clarity: number;
  problematicSounds: ProblematicSound[];
  phoneticBreakdown: PhoneticBreakdown[];
}

export interface ProblematicSound {
  sound: string;
  expected: string;
  actual: string;
  position: number;
  tip: string;
}

export interface PhoneticBreakdown {
  phoneme: string;
  score: number;
  position: number;
  duration: number;
}

export interface RhythmAnalysis {
  score: number;
  tempo: number;
  consistency: number;
  pauseAccuracy: number;
  stressPatterns: StressPattern[];
}

export interface StressPattern {
  position: number;
  expected: 'stressed' | 'unstressed';
  actual: 'stressed' | 'unstressed';
  correct: boolean;
}

export interface PitchAnalysis {
  score: number;
  averagePitch: number;
  pitchRange: { min: number; max: number };
  intonation: number;
  pitchContour: PitchPoint[];
}

export interface PitchPoint {
  time: number;
  frequency: number;
  expected?: number;
}

export interface FluencyAnalysis {
  score: number;
  wordsPerMinute: number;
  hesitations: Hesitation[];
  fillerWords: FillerWord[];
  pauseDuration: number;
}

export interface Hesitation {
  position: number;
  duration: number;
  type: 'pause' | 'repetition' | 'self-correction';
}

export interface FillerWord {
  word: string;
  count: number;
  positions: number[];
}

export interface DetailedFeedback {
  category: 'pronunciation' | 'rhythm' | 'pitch' | 'fluency';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
  timestamp?: number;
}

export interface VoiceAnalysisSettings {
  sensitivity: 'low' | 'medium' | 'high';
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  compareWithReference: boolean;
  showPhoneticBreakdown: boolean;
  realTimeFeedback: boolean;
}

// ============================================
// CHALLENGE TYPES
// ============================================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: DifficultyLevel;
  category: string;
  content: ChallengeContent;
  rules: ChallengeRule[];
  rewards: ChallengeReward[];
  startDate: Date;
  endDate: Date;
  participantCount: number;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: ChallengeCreator;
  thumbnailUrl?: string;
  tags: string[];
}

export type ChallengeType = 
  | 'daily-practice'
  | 'weekly-challenge'
  | 'speed-round'
  | 'accuracy-challenge'
  | 'streak-challenge'
  | 'community-event'
  | 'tournament';

export interface ChallengeContent {
  shlokas?: Shloka[];
  targetScore?: number;
  targetTime?: number; // in seconds
  targetStreak?: number;
  customPrompt?: string;
  audioUrl?: string;
  instructions: string[];
}

export interface ChallengeRule {
  id: string;
  description: string;
  type: 'required' | 'bonus' | 'penalty';
  value?: number;
}

export interface ChallengeReward {
  id: string;
  type: 'points' | 'badge' | 'title' | 'unlock' | 'certificate';
  name: string;
  description: string;
  icon?: string;
  value: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ChallengeCreator {
  id: string;
  name: string;
  avatar?: string;
  isOfficial: boolean;
}

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  score: number;
  rank?: number;
  recordings: AudioRecording[];
  feedback?: string;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  userRank?: number;
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  completedAt: Date;
  badges?: string[];
  isCurrentUser?: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  progress: number; // 0-100
  currentStage: number;
  totalStages: number;
  timeRemaining?: number;
  score: number;
  bonusEarned: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface PracticeUIState {
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  totalDuration: number;
  volume: number;
  isMuted: boolean;
  error?: string;
}

export interface AudioWaveformData {
  samples: number[];
  peakLevel: number;
  duration: number;
  sampleRate: number;
}

export interface TimerState {
  elapsed: number;
  remaining?: number;
  isRunning: boolean;
  isPaused: boolean;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface PracticeStats {
  karaoke: KaraokeStats;
  voiceAnalysis: VoiceAnalysisStats;
  challenges: ChallengeStats;
  overall: OverallStats;
}

export interface KaraokeStats {
  totalSessions: number;
  totalDuration: number; // in minutes
  averageScore: number;
  bestScore: number;
  shlokasPracticed: number;
  uniqueShlokas: number;
  favoriteCategory?: string;
  recentProgress: ProgressPoint[];
}

export interface VoiceAnalysisStats {
  totalAnalyses: number;
  averagePronunciation: number;
  averageRhythm: number;
  averagePitch: number;
  averageFluency: number;
  improvement: number; // percentage
  weakAreas: string[];
  strongAreas: string[];
}

export interface ChallengeStats {
  totalAttempted: number;
  totalCompleted: number;
  totalWins: number;
  currentRank?: number;
  totalPoints: number;
  badges: string[];
  achievements: Achievement[];
}

export interface OverallStats {
  totalPracticeTime: number; // in hours
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: string;
  achievements: Achievement[];
}

export interface ProgressPoint {
  date: string;
  score: number;
  sessions: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'karaoke' | 'voice' | 'challenge' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ============================================
// NAVIGATION TYPES
// ============================================

export interface PracticeTabParams {
  karaoke?: KaraokeNavigationParams;
  voiceAnalysis?: VoiceAnalysisNavigationParams;
  challenges?: ChallengeNavigationParams;
}

export interface KaraokeNavigationParams {
  shlokaId?: string;
  sessionId?: string;
  category?: string;
}

export interface VoiceAnalysisNavigationParams {
  sessionId?: string;
  referenceText?: string;
}

export interface ChallengeNavigationParams {
  challengeId?: string;
  tab?: 'active' | 'upcoming' | 'completed';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PracticeAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PracticeBatchResponse<T> {
  items: T[];
  total: number;
  page: number;
  hasNextPage: boolean;
}
