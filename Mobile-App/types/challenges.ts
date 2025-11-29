// Challenge Types for Gamified Shloka Learning

export type ChallengeType = 
  | 'mcq'           // Multiple choice questions
  | 'fill-blanks'   // Fill in the blanks
  | 'matching'      // Match pairs
  | 'pronunciation' // Pronunciation check
  | 'sequence'      // Arrange in order
  | 'speed-round'   // Quick fire questions
  | 'memory'        // Memory/flip card game
  | 'translation'   // Translate challenge
  | 'chandas-quiz'  // Identify meter type

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type ChallengeCategory = 
  | 'vedic'
  | 'bhagavad-gita'
  | 'upanishads'
  | 'shlokas'
  | 'chandas'
  | 'mixed';

export interface Challenge {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: DifficultyLevel;
  questions: ChallengeQuestion[];
  timeLimit: number; // in seconds
  passingScore: number; // percentage
  xpReward: number;
  coinsReward: number;
  badge?: BadgeInfo;
  isLocked: boolean;
  requiredLevel: number;
  completedBy: number; // number of users who completed
  icon: string;
  gradient: readonly [string, string];
}

export interface ChallengeQuestion {
  id: string;
  questionType: 'text' | 'audio' | 'image';
  question: string;
  questionHindi?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  explanationHindi?: string;
  points: number;
  timeBonus?: number; // extra points for fast answer
  hint?: string;
  // For matching type
  pairs?: { left: string; right: string }[];
  // For sequence type
  correctSequence?: string[];
  // For fill-blanks
  blanks?: { index: number; answer: string }[];
}

export interface BadgeInfo {
  id: string;
  name: string;
  nameHindi: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

export interface UserChallengeProgress {
  challengeId: string;
  completed: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  attempts: number;
  bestTime: number;
  earnedXp: number;
  earnedCoins: number;
  earnedBadge?: BadgeInfo;
  completedAt?: Date;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    correct: boolean;
    timeTaken: number;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  totalXp: number;
  level: number;
  challengesCompleted: number;
  badges: BadgeInfo[];
  streak: number;
  isCurrentUser?: boolean;
}

export interface UserStats {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  totalCoins: number;
  challengesCompleted: number;
  totalChallenges: number;
  perfectScores: number;
  currentStreak: number;
  longestStreak: number;
  badges: BadgeInfo[];
  rank: number;
  totalUsers: number;
  favoriteCategory: ChallengeCategory;
  averageScore: number;
  totalTimeSpent: number; // in seconds
  joinedDate: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  username: string;
  challengeTitle: string;
  category: ChallengeCategory;
  score: number;
  percentage: number;
  completedAt: Date;
  badge?: BadgeInfo;
  certificateNumber: string;
  qrCode?: string;
}

export interface SocialShareCard {
  type: 'achievement' | 'certificate' | 'badge' | 'streak' | 'leaderboard';
  title: string;
  subtitle: string;
  stats: { label: string; value: string | number }[];
  badge?: BadgeInfo;
  gradient: readonly [string, string];
  platform: 'instagram' | 'linkedin' | 'twitter' | 'general';
}

export interface GameSession {
  challengeId: string;
  startTime: Date;
  currentQuestionIndex: number;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    timeTaken: number;
  }[];
  score: number;
  streak: number; // consecutive correct answers
  multiplier: number; // score multiplier from streak
  hintsUsed: number;
  isPaused: boolean;
  isCompleted: boolean;
}
