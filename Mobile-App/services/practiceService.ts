/**
 * Practice Service - API for Karaoke, Voice Analysis, and Challenges
 * Handles all practice-related functionality for Sanskrit learning
 */

import api, { handleApiError } from './api';

// =====================================
// TYPES & INTERFACES
// =====================================

export interface Shloka {
  _id: string;
  title: string;
  originalText: string;
  transliteration: string;
  meaning: string;
  audioUrl?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  source?: string;
  lyrics?: ShlokaLine[];
}

export interface ShlokaLine {
  id: string;
  text: string;
  transliteration: string;
  startTime: number; // milliseconds
  endTime: number;
  meaning?: string;
}

export interface KaraokeSession {
  _id: string;
  userId: string;
  shlokaId: string;
  shloka?: Shloka;
  recordingUrl?: string;
  score: number;
  accuracy: number;
  timing: number;
  pronunciation: number;
  completedAt: string;
  duration: number;
  lineScores?: LineScore[];
}

export interface LineScore {
  lineId: string;
  score: number;
  accuracy: number;
  timing: number;
  feedback?: string;
}

export interface VoiceAnalysisResult {
  _id: string;
  userId: string;
  recordingUrl: string;
  duration: number;
  overallScore: number;
  metrics: {
    pitch: PitchAnalysis;
    pronunciation: PronunciationAnalysis;
    rhythm: RhythmAnalysis;
    clarity: number;
    fluency: number;
  };
  feedback: string[];
  suggestions: string[];
  analyzedAt: string;
}

export interface PitchAnalysis {
  score: number;
  averagePitch: number;
  pitchRange: { min: number; max: number };
  stability: number;
  deviations: PitchDeviation[];
}

export interface PitchDeviation {
  timestamp: number;
  expected: number;
  actual: number;
  severity: 'minor' | 'moderate' | 'major';
}

export interface PronunciationAnalysis {
  score: number;
  correctSounds: number;
  totalSounds: number;
  problematicSounds: ProblematicSound[];
}

export interface ProblematicSound {
  sound: string;
  expectedSound: string;
  timestamp: number;
  suggestion: string;
}

export interface RhythmAnalysis {
  score: number;
  tempo: number;
  consistency: number;
  chandas?: string; // Sanskrit meter
  metricalAccuracy?: number;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'tournament';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  shlokas: Shloka[];
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  startDate: string;
  endDate: string;
  participants: number;
  completions: number;
  isActive: boolean;
  userProgress?: UserChallengeProgress;
}

export interface ChallengeRequirement {
  type: 'min_score' | 'complete_all' | 'streak' | 'time_limit';
  value: number;
  description: string;
}

export interface ChallengeReward {
  type: 'xp' | 'badge' | 'certificate' | 'streak_bonus';
  value: number;
  name: string;
  icon?: string;
}

export interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  completedShlokas: string[];
  totalScore: number;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  earnedRewards?: ChallengeReward[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  completedChallenges: number;
  streakDays: number;
  badges: string[];
}

export interface PracticeStats {
  totalSessions: number;
  totalDuration: number;
  averageScore: number;
  bestScore: number;
  completedShlokas: number;
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  rank: number;
  xp: number;
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// =====================================
// PRACTICE SERVICE CLASS
// =====================================

class PracticeService {
  // =====================================
  // KARAOKE
  // =====================================

  /**
   * Get available shlokas for karaoke practice
   */
  async getKaraokeShlokas(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    category?: string;
    search?: string;
  } = {}): Promise<{ shlokas: Shloka[]; total: number }> {
    try {
      const response = await api.get('/practice/karaoke/shlokas', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a specific shloka with lyrics/timing data
   */
  async getShlokaForKaraoke(shlokaId: string): Promise<Shloka> {
    try {
      const response = await api.get(`/practice/karaoke/shlokas/${shlokaId}`);
      return response.data.data.shloka;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit karaoke session recording
   */
  async submitKaraokeSession(data: {
    shlokaId: string;
    recordingUri: string;
    duration: number;
  }): Promise<KaraokeSession> {
    try {
      const formData = new FormData();
      formData.append('shlokaId', data.shlokaId);
      formData.append('duration', data.duration.toString());
      formData.append('recording', {
        uri: data.recordingUri,
        type: 'audio/m4a',
        name: 'karaoke_recording.m4a',
      } as any);

      const response = await api.post('/practice/karaoke/sessions', formData, {
        timeout: 120000, // 2 minutes for audio upload + processing
      });
      return response.data.data.session;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's karaoke history
   */
  async getKaraokeHistory(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ sessions: KaraokeSession[]; total: number }> {
    try {
      const response = await api.get('/practice/karaoke/history', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // =====================================
  // VOICE ANALYSIS
  // =====================================

  /**
   * Submit recording for voice analysis
   */
  async analyzeVoice(data: {
    recordingUri: string;
    shlokaId?: string;
    analysisType: 'full' | 'pitch' | 'pronunciation' | 'rhythm';
  }): Promise<VoiceAnalysisResult> {
    try {
      const formData = new FormData();
      if (data.shlokaId) formData.append('shlokaId', data.shlokaId);
      formData.append('analysisType', data.analysisType);
      formData.append('recording', {
        uri: data.recordingUri,
        type: 'audio/m4a',
        name: 'voice_recording.m4a',
      } as any);

      const response = await api.post('/practice/voice-analysis', formData, {
        timeout: 180000, // 3 minutes for analysis
      });
      return response.data.data.analysis;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get voice analysis history
   */
  async getVoiceAnalysisHistory(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ analyses: VoiceAnalysisResult[]; total: number }> {
    try {
      const response = await api.get('/practice/voice-analysis/history', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get personalized practice recommendations based on voice analysis
   */
  async getVoiceRecommendations(): Promise<{
    focusAreas: string[];
    recommendedShlokas: Shloka[];
    exercises: PronunciationExercise[];
  }> {
    try {
      const response = await api.get('/practice/voice-analysis/recommendations');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // =====================================
  // CHALLENGES
  // =====================================

  /**
   * Get available challenges
   */
  async getChallenges(params: {
    type?: 'daily' | 'weekly' | 'special' | 'tournament';
    status?: 'active' | 'upcoming' | 'completed';
  } = {}): Promise<{ challenges: Challenge[] }> {
    try {
      const response = await api.get('/practice/challenges', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get challenge details
   */
  async getChallengeDetails(challengeId: string): Promise<Challenge> {
    try {
      const response = await api.get(`/practice/challenges/${challengeId}`);
      return response.data.data.challenge;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string): Promise<UserChallengeProgress> {
    try {
      const response = await api.post(`/practice/challenges/${challengeId}/join`);
      return response.data.data.progress;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit challenge attempt
   */
  async submitChallengeAttempt(data: {
    challengeId: string;
    shlokaId: string;
    recordingUri: string;
    duration: number;
  }): Promise<{
    lineScores: LineScore[];
    totalScore: number;
    passed: boolean;
    progress: UserChallengeProgress;
  }> {
    try {
      const formData = new FormData();
      formData.append('shlokaId', data.shlokaId);
      formData.append('duration', data.duration.toString());
      formData.append('recording', {
        uri: data.recordingUri,
        type: 'audio/m4a',
        name: 'challenge_recording.m4a',
      } as any);

      const response = await api.post(
        `/practice/challenges/${data.challengeId}/attempt`,
        formData,
        { timeout: 120000 }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(
    challengeId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ leaderboard: LeaderboardEntry[]; userRank?: number }> {
    try {
      const response = await api.get(`/practice/challenges/${challengeId}/leaderboard`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // =====================================
  // STATISTICS & PROGRESS
  // =====================================

  /**
   * Get user's practice statistics
   */
  async getPracticeStats(): Promise<PracticeStats> {
    try {
      const response = await api.get('/practice/stats');
      return response.data.data.stats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(params: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    page?: number;
    limit?: number;
  } = {}): Promise<{ leaderboard: LeaderboardEntry[]; userRank?: number }> {
    try {
      const response = await api.get('/practice/leaderboard', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's badges
   */
  async getBadges(): Promise<{ badges: Badge[]; available: Badge[] }> {
    try {
      const response = await api.get('/practice/badges');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// =====================================
// ADDITIONAL TYPES
// =====================================

export interface PronunciationExercise {
  id: string;
  title: string;
  description: string;
  targetSound: string;
  examples: string[];
  audioUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Export singleton instance
export default new PracticeService();
