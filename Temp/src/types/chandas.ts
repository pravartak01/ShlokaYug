// Types specific to Chandas functionality

export interface Syllable {
  id: string;
  text: string;
  type: 'laghu' | 'guru'; // Short or long
  duration: number; // In milliseconds for rhythm
  position: number; // Position in the shloka
  isHighlighted?: boolean; // For karaoke mode
}

export interface Pada {
  id: string;
  text: string;
  syllables: Syllable[];
  pattern: string; // L for laghu, G for guru
  translation?: string;
  romanization?: string;
}

export interface Chandas {
  id: string;
  name: string;
  nameDevanagari: string;
  description: string;
  pattern: string; // Overall pattern (e.g., "LGGL LGGL")
  syllableCount: number;
  popularity: number; // 1-10 scale
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[]; // Example texts
  usedIn: string[]; // Where it's commonly used (e.g., "Bhagavad Gita")
  audioUrl?: string;
  rules: string[];
  variations: string[];
}

export interface Shloka {
  id: string;
  text: string;
  devanagari: string;
  romanization: string;
  translation: string;
  padas: Pada[];
  chandas: Chandas;
  source: string; // e.g., "Bhagavad Gita 2.47"
  context: string;
  audioUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  meaning: {
    literal: string;
    contextual: string;
    spiritual?: string;
  };
}

export interface AnalysisResult {
  id: string;
  inputText: string;
  detectedChandas: Chandas;
  confidence: number; // 0-1
  syllableBreakdown: Syllable[];
  suggestions: string[];
  corrections: {
    syllable: string;
    suggestion: string;
    reason: string;
  }[];
  timestamp: Date;
}

export interface KaraokeState {
  isPlaying: boolean;
  currentSyllableIndex: number;
  currentPadaIndex: number;
  tempo: number; // BPM
  volume: number; // 0-1
  showTranslation: boolean;
  showRomanization: boolean;
}

export interface GameState {
  level: number;
  score: number;
  streak: number;
  lives: number;
  currentQuestion: GameQuestion;
  timeRemaining: number;
  gameMode: 'identify' | 'compose' | 'rhythm' | 'quiz';
}

export interface GameQuestion {
  id: string;
  type: 'identify-chandas' | 'complete-shloka' | 'rhythm-match' | 'translation';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface UserProgress {
  userId: string;
  chandasMastered: string[]; // Chandas IDs
  shlokasPracticed: string[]; // Shloka IDs
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  gamesPlayed: number;
  averageAccuracy: number;
  timeSpent: number; // In minutes
  achievements: Achievement[];
  lastActivity: Date;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SpeechAnalysis {
  text: string;
  accuracy: number;
  timing: number;
  pronunciation: {
    correct: string[];
    incorrect: string[];
    suggestions: string[];
  };
  rhythm: {
    detected: string;
    expected: string;
    accuracy: number;
  };
}

export interface CommunityContribution {
  id: string;
  userId: string;
  shloka: Shloka;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  contributedAt: Date;
  verifiedBy?: string;
}

export interface Script {
  id: string;
  name: string;
  nativeName: string;
  code: string; // ISO code
  isSupported: boolean;
  transliterationRules?: Record<string, string>;
}

export interface RhythmVisualization {
  beats: {
    time: number;
    type: 'laghu' | 'guru';
    intensity: number;
  }[];
  duration: number;
  bpm: number;
}