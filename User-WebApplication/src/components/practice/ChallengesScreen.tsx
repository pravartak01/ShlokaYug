import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Medal,
  Crown,
  Clock,
  Users,
  Lock,
  CheckCircle2,
  Zap,
  Gift,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'streak';
  progress: number;
  target: number;
  reward: number;
  icon: string;
  color: string;
  completed: boolean;
  locked?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

const TABS = [
  { id: 'challenges', label: 'Challenges', icon: Target },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
  { id: 'badges', label: 'Badges', icon: Award },
] as const;

const ChallengesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'badges'>('challenges');

  // Mock user stats
  const userStats = {
    totalPoints: 2450,
    currentStreak: 7,
    longestStreak: 15,
    rank: 23,
    shlokasMastered: 12,
    practiceTime: '24h 35m',
  };

  // Mock challenges
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Daily Practice',
      description: 'Practice any shloka for 10 minutes today',
      type: 'daily',
      progress: 7,
      target: 10,
      reward: 50,
      icon: '🎯',
      color: '#FF6B6B',
      completed: false,
    },
    {
      id: '2',
      title: 'Perfect Pronunciation',
      description: 'Get 90%+ score in voice analysis',
      type: 'daily',
      progress: 1,
      target: 1,
      reward: 100,
      icon: '🎤',
      color: '#4ECDC4',
      completed: true,
    },
    {
      id: '3',
      title: 'Weekly Warrior',
      description: 'Practice 5 different shlokas this week',
      type: 'weekly',
      progress: 3,
      target: 5,
      reward: 200,
      icon: '⚔️',
      color: '#FFE66D',
      completed: false,
    },
    {
      id: '4',
      title: '7-Day Streak',
      description: 'Practice every day for 7 days',
      type: 'streak',
      progress: 7,
      target: 7,
      reward: 300,
      icon: '🔥',
      color: '#FF9F43',
      completed: true,
    },
    {
      id: '5',
      title: 'Mantra Master',
      description: 'Complete all Gayatri Mantra variations',
      type: 'achievement',
      progress: 2,
      target: 5,
      reward: 500,
      icon: '📿',
      color: '#A55EEA',
      completed: false,
    },
    {
      id: '6',
      title: 'Sanskrit Scholar',
      description: 'Master 20 different shlokas',
      type: 'achievement',
      progress: 12,
      target: 20,
      reward: 1000,
      icon: '📚',
      color: '#26DE81',
      completed: false,
      locked: true,
    },
  ];

  // Mock leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Aditya S.', avatar: '👨‍🦰', points: 15420, streak: 45 },
    { rank: 2, name: 'Priya M.', avatar: '👩', points: 14890, streak: 38 },
    { rank: 3, name: 'Ravi K.', avatar: '👨', points: 13750, streak: 30 },
    { rank: 4, name: 'Meera R.', avatar: '👩‍🦱', points: 12340, streak: 28 },
    { rank: 5, name: 'Arjun P.', avatar: '👦', points: 11200, streak: 25 },
    { rank: 23, name: 'You', avatar: '😊', points: 2450, streak: 7, isCurrentUser: true },
  ];

  // Mock badges
  const badges: Badge[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first shloka practice',
      icon: '🌱',
      color: '#26DE81',
      earned: true,
      earnedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Early Bird',
      description: 'Practice before 6 AM',
      icon: '🌅',
      color: '#FFE66D',
      earned: true,
      earnedDate: '2024-01-20',
    },
    {
      id: '3',
      name: 'Night Owl',
      description: 'Practice after 10 PM',
      icon: '🦉',
      color: '#A55EEA',
      earned: true,
      earnedDate: '2024-01-22',
    },
    {
      id: '4',
      name: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      color: '#FF9F43',
      earned: true,
      earnedDate: '2024-01-25',
    },
    {
      id: '5',
      name: 'Perfectionist',
      description: 'Get 100% score in voice analysis',
      icon: '💯',
      color: '#4ECDC4',
      earned: false,
    },
    {
      id: '6',
      name: 'Sanskrit Pro',
      description: 'Master 50 shlokas',
      icon: '🏆',
      color: '#FF6B6B',
      earned: false,
    },
    {
      id: '7',
      name: 'Community Star',
      description: 'Help 10 other learners',
      icon: '⭐',
      color: '#FFE66D',
      earned: false,
    },
    {
      id: '8',
      name: 'Legendary',
      description: 'Reach the top 10 on leaderboard',
      icon: '👑',
      color: '#A55EEA',
      earned: false,
    },
  ];

  // Render challenge card
  const renderChallenge = (challenge: Challenge, index: number) => (
    <motion.div
      key={challenge.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-[#1a1a2e] rounded-2xl p-5 mb-3 border transition-all hover:border-white/10 group ${
        challenge.locked ? 'opacity-50 border-transparent' : challenge.completed ? 'border-green-500/30' : 'border-transparent hover:bg-[#252545]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ 
            background: `linear-gradient(135deg, ${challenge.color}30, ${challenge.color}10)`,
            border: `1px solid ${challenge.color}30`
          }}
        >
          {challenge.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">{challenge.title}</h3>
            {challenge.completed && (
              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
            {challenge.locked && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-lg">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">{challenge.description}</p>

          {/* Progress */}
          {!challenge.locked && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-xs font-medium">
                  Progress: {challenge.progress}/{challenge.target}
                </span>
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: challenge.color }}>
                  <Sparkles className="w-3 h-3" />
                  +{challenge.reward} pts
                </span>
              </div>
              <div className="h-2 bg-[#252545] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}99)`,
                    boxShadow: `0 0 10px ${challenge.color}40`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Type Badge */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wide ${
              challenge.type === 'daily'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : challenge.type === 'weekly'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : challenge.type === 'streak'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {challenge.type}
          </span>
          {!challenge.locked && !challenge.completed && (
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" />
          )}
        </div>
      </div>
    </motion.div>
  );

  // Render leaderboard entry
  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <motion.div
      key={entry.rank}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center p-4 rounded-2xl mb-3 transition-all ${
        entry.isCurrentUser
          ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 border-2 border-orange-500/30'
          : 'bg-[#1a1a2e] border border-transparent hover:border-white/10'
      }`}
    >
      {/* Rank */}
      <div className="w-12 text-center">
        {entry.rank <= 3 ? (
          <span className="text-3xl">
            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
          </span>
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${
            entry.isCurrentUser ? 'bg-orange-500/20' : 'bg-[#252545]'
          }`}>
            <span className={`text-lg font-bold ${entry.isCurrentUser ? 'text-orange-400' : 'text-gray-400'}`}>
              {entry.rank}
            </span>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ml-3 ${
        entry.isCurrentUser ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-[#252545]'
      }`}>
        {entry.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 ml-4">
        <p className={`font-semibold ${entry.isCurrentUser ? 'text-orange-400' : 'text-white'}`}>
          {entry.name}
          {entry.isCurrentUser && <span className="text-xs ml-2 text-orange-300">(You)</span>}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span className="flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-lg text-orange-400">
            <Flame className="w-3 h-3" />
            {entry.streak} days
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <p className={`text-xl font-bold ${entry.isCurrentUser ? 'text-orange-400' : 'text-white'}`}>
          {entry.points.toLocaleString()}
        </p>
        <p className="text-gray-500 text-xs">points</p>
      </div>
    </motion.div>
  );

  // Render badge
  const renderBadge = (badge: Badge, index: number) => (
    <motion.div
      key={badge.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: badge.earned ? 1.03 : 1 }}
      className={`bg-[#1a1a2e] rounded-3xl p-5 text-center transition-all border ${
        badge.earned 
          ? 'border-transparent hover:border-white/10' 
          : 'opacity-60 border-transparent'
      }`}
    >
      <div
        className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4 transition-transform ${
          badge.earned ? 'hover:scale-110' : 'grayscale'
        }`}
        style={{ 
          background: badge.earned 
            ? `linear-gradient(135deg, ${badge.color}30, ${badge.color}10)` 
            : 'linear-gradient(135deg, #252545, #1a1a2e)',
          border: badge.earned ? `2px solid ${badge.color}40` : '2px solid #252545'
        }}
      >
        {badge.icon}
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">{badge.name}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{badge.description}</p>
      {badge.earned && badge.earnedDate && (
        <div className="mt-3 flex items-center justify-center gap-1 text-green-400 text-xs bg-green-500/10 py-1 px-3 rounded-lg mx-auto w-fit">
          <CheckCircle2 className="w-3 h-3" />
          {new Date(badge.earnedDate).toLocaleDateString()}
        </div>
      )}
      {!badge.earned && (
        <div className="mt-3 flex items-center justify-center gap-1 text-gray-600 text-xs">
          <Lock className="w-3 h-3" />
          Locked
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
      {/* User Stats Header */}
      <div className="bg-gradient-to-br from-[#252545] via-[#1a1a2e] to-[#252545] p-6 md:px-8 rounded-b-[2rem] shadow-2xl border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          {/* Points and Rank Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Points</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-500/20 flex items-center justify-center border border-yellow-500/30">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-white text-4xl font-bold">
                  {userStats.totalPoints.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Global Rank</p>
              <div className="flex items-center gap-3 justify-end">
                <span className="text-white text-3xl font-bold">#{userStats.rank}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
                  <Trophy className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#252545] rounded-2xl p-4 text-center border border-white/5"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2 border border-orange-500/30">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white text-2xl font-bold">{userStats.currentStreak}</p>
              <p className="text-gray-500 text-xs mt-1">Day Streak</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#252545] rounded-2xl p-4 text-center border border-white/5"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-2 border border-purple-500/30">
                <Medal className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white text-2xl font-bold">{userStats.shlokasMastered}</p>
              <p className="text-gray-500 text-xs mt-1">Mastered</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#252545] rounded-2xl p-4 text-center border border-white/5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white text-xl font-bold">{userStats.practiceTime}</p>
              <p className="text-gray-500 text-xs mt-1">Total Time</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 px-4 md:px-6 py-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252545] border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 pb-8">
          <AnimatePresence mode="wait">
            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Daily Challenges */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Daily Challenges</h2>
                      <p className="text-gray-500 text-xs">Refresh in 12h 34m</p>
                    </div>
                  </div>
                  {challenges
                    .filter((c) => c.type === 'daily')
                    .map((c, i) => renderChallenge(c, i))}
                </div>

                {/* Weekly Challenges */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Weekly Challenges</h2>
                      <p className="text-gray-500 text-xs">3 days remaining</p>
                    </div>
                  </div>
                  {challenges
                    .filter((c) => c.type === 'weekly')
                    .map((c, i) => renderChallenge(c, i))}
                </div>

                {/* Streak & Achievement */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                      <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Streaks & Achievements</h2>
                      <p className="text-gray-500 text-xs">Long-term goals</p>
                    </div>
                  </div>
                  {challenges
                    .filter((c) => c.type === 'streak' || c.type === 'achievement')
                    .map((c, i) => renderChallenge(c, i))}
                </div>
              </motion.div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#252545] flex items-center justify-center border border-white/10">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Global Rankings</h2>
                    <p className="text-gray-500 text-xs">Updated every hour</p>
                  </div>
                </div>

                {/* Top 3 Podium */}
                <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 px-4">
                  {/* 2nd Place */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center flex-1 max-w-[120px]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-3xl mx-auto mb-2 border-2 border-gray-400 shadow-lg">
                      {leaderboard[1].avatar}
                    </div>
                    <p className="text-white text-sm font-semibold truncate">{leaderboard[1].name}</p>
                    <p className="text-gray-500 text-xs">{leaderboard[1].points.toLocaleString()} pts</p>
                    <div className="w-full h-20 bg-gradient-to-t from-gray-500/30 to-gray-500/10 rounded-t-2xl mt-3 flex items-center justify-center border-t border-x border-gray-500/30">
                      <span className="text-4xl">🥈</span>
                    </div>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="text-center flex-1 max-w-[140px]"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-4xl mx-auto mb-2 border-2 border-yellow-500 shadow-lg shadow-yellow-500/30">
                        {leaderboard[0].avatar}
                      </div>
                      <div className="absolute -top-3 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-white font-bold">{leaderboard[0].name}</p>
                    <p className="text-gray-500 text-xs">{leaderboard[0].points.toLocaleString()} pts</p>
                    <div className="w-full h-28 bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 rounded-t-2xl mt-3 flex items-center justify-center border-t border-x border-yellow-500/30">
                      <span className="text-5xl">🥇</span>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center flex-1 max-w-[120px]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-3xl mx-auto mb-2 border-2 border-amber-700 shadow-lg">
                      {leaderboard[2].avatar}
                    </div>
                    <p className="text-white text-sm font-semibold truncate">{leaderboard[2].name}</p>
                    <p className="text-gray-500 text-xs">{leaderboard[2].points.toLocaleString()} pts</p>
                    <div className="w-full h-14 bg-gradient-to-t from-amber-700/30 to-amber-700/10 rounded-t-2xl mt-3 flex items-center justify-center border-t border-x border-amber-700/30">
                      <span className="text-3xl">🥉</span>
                    </div>
                  </motion.div>
                </div>

                {/* Full List */}
                <div className="space-y-2">
                  {leaderboard.slice(3).map((entry, i) => renderLeaderboardEntry(entry, i))}
                </div>
              </motion.div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#252545] flex items-center justify-center border border-white/10">
                      <Gift className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Your Badges</h2>
                      <p className="text-gray-500 text-xs">Collect them all!</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                    <span className="text-green-400 font-bold">
                      {badges.filter((b) => b.earned).length}
                    </span>
                    <span className="text-gray-500">/{badges.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge, i) => renderBadge(badge, i))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChallengesScreen;
