import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LearningProgress {
  currentCourse: {
    id: string;
    title: string;
    subtitle: string;
    thumbnail: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    estimatedTimeLeft: string;
  };
  lastActivity: {
    type: 'lesson' | 'quiz' | 'practice';
    title: string;
    timestamp: string;
    score?: number;
    completionStatus: 'completed' | 'in-progress' | 'failed';
  };
  dailyGoal: {
    target: number; // minutes
    completed: number;
    streak: number;
    isCompleted: boolean;
  };
  weeklyStats: {
    lessonsCompleted: number;
    quizzesPassed: number;
    practiceTime: number; // minutes
    accuracy: number;
  };
}

// Mock data - would come from API/database
const mockLearningData: LearningProgress = {
  currentCourse: {
    id: 'chandas-mastery-101',
    title: 'Chandas Mastery: Intermediate',
    subtitle: 'Anushtubh & Shloka Patterns',
    thumbnail: '📚',
    progress: 68,
    totalLessons: 25,
    completedLessons: 17,
    estimatedTimeLeft: '2h 15m'
  },
  lastActivity: {
    type: 'quiz',
    title: 'Anushtubh Pattern Recognition',
    timestamp: '2 hours ago',
    score: 85,
    completionStatus: 'completed'
  },
  dailyGoal: {
    target: 20,
    completed: 14,
    streak: 12,
    isCompleted: false
  },
  weeklyStats: {
    lessonsCompleted: 5,
    quizzesPassed: 3,
    practiceTime: 87,
    accuracy: 82
  }
};

export default function ContinueLearning() {
  const progress = mockLearningData;
  
  // Calculate daily goal progress percentage
  const dailyGoalProgress = Math.min((progress.dailyGoal.completed / progress.dailyGoal.target) * 100, 100);
  
  // Get appropriate icon and color for last activity
  const getActivityIcon = (type: string, status: string) => {
    if (type === 'lesson') return { icon: 'book', color: '#f97316' };
    if (type === 'quiz') return { icon: 'help-circle', color: '#ea580c' };
    if (type === 'practice') return { icon: 'musical-notes', color: '#f97316' };
    return { icon: 'checkmark-circle', color: '#f97316' };
  };
  
  const activityStyle = getActivityIcon(progress.lastActivity.type, progress.lastActivity.completionStatus);

  return (
    <View className="px-6 mt-8 mb-8">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-ancient-800 text-xl font-bold">Continue Your Journey</Text>
          <Text className="text-ancient-600 text-sm mt-1">
            Pick up where you left off
          </Text>
        </View>
        <TouchableOpacity className="bg-saffron-100 px-3 py-2 rounded-full">
          <View className="flex-row items-center">
            <Ionicons name="flame" size={14} color="#f97316" />
            <Text className="text-saffron-700 font-bold text-sm ml-1">
              {progress.dailyGoal.streak} day streak
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Course Card */}
      <LinearGradient
        colors={['#f97316', '#ea580c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl overflow-hidden mb-4"
      >
        <View className="p-5">
          {/* Course Header */}
          <View className="flex-row items-start mb-4">
            <View className="bg-white/20 w-12 h-12 rounded-xl items-center justify-center mr-3">
              <Text className="text-3xl">{progress.currentCourse.thumbnail}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">
                {progress.currentCourse.title}
              </Text>
              <Text className="text-white/90 text-sm">
                {progress.currentCourse.subtitle}
              </Text>
            </View>
            <View className="bg-white/20 px-3 py-1.5 rounded-full">
              <Text className="text-white font-bold text-sm">
                {progress.currentCourse.progress}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/90 text-xs font-medium">
                {progress.currentCourse.completedLessons} of {progress.currentCourse.totalLessons} lessons completed
              </Text>
              <Text className="text-white/80 text-xs">
                {progress.currentCourse.estimatedTimeLeft} left
              </Text>
            </View>
            <View className="bg-white/20 h-2 rounded-full overflow-hidden">
              <View 
                className="bg-white h-full rounded-full"
                style={{ width: `${progress.currentCourse.progress}%` }}
              />
            </View>
          </View>

          {/* Resume Button */}
          <TouchableOpacity 
            className="bg-white rounded-xl"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center py-3 px-4">
              <Ionicons name="play-circle" size={24} color="#f97316" />
              <Text className="text-saffron-600 font-bold text-base ml-2">
                Resume Course
              </Text>
              <View className="flex-1" />
              <Ionicons name="arrow-forward" size={20} color="#f97316" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Last Activity Card */}
      <View className="bg-white rounded-2xl border border-ancient-200 p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Ionicons name="time-outline" size={18} color="#996f0a" />
          <Text className="text-ancient-700 font-semibold text-sm ml-2">
            Recent Activity
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${activityStyle.color}15` }}
          >
            <Ionicons name={activityStyle.icon as any} size={20} color={activityStyle.color} />
          </View>
          
          <View className="flex-1">
            <Text className="text-ancient-800 font-semibold text-base">
              {progress.lastActivity.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-ancient-600 text-xs">
                {progress.lastActivity.type.charAt(0).toUpperCase() + progress.lastActivity.type.slice(1)}
              </Text>
              <View className="w-1 h-1 bg-ancient-400 rounded-full mx-2" />
              <Text className="text-ancient-600 text-xs">
                {progress.lastActivity.timestamp}
              </Text>
            </View>
          </View>
          
          {progress.lastActivity.score && (
            <View className="bg-saffron-100 px-3 py-1.5 rounded-full">
              <Text className="text-saffron-700 font-bold text-sm">
                {progress.lastActivity.score}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Daily Goal Card (Duolingo-style) */}
      <View className="bg-ancient-50 rounded-2xl border border-ancient-200 p-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="bg-saffron-100 p-2 rounded-full mr-3">
              <Ionicons name="trophy" size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-ancient-800 font-bold text-base">
                Daily Study Goal
              </Text>
              <Text className="text-ancient-700 text-xs mt-0.5">
                {progress.dailyGoal.completed} of {progress.dailyGoal.target} minutes today
              </Text>
            </View>
          </View>
          
          {progress.dailyGoal.isCompleted ? (
            <View className="bg-saffron-500 p-2 rounded-full">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          ) : (
            <Text className="text-saffron-600 font-bold text-lg">
              {progress.dailyGoal.target - progress.dailyGoal.completed}m left
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View className="bg-ancient-200 h-3 rounded-full overflow-hidden mb-3">
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full rounded-full"
            style={{ width: `${dailyGoalProgress}%` }}
          />
        </View>

        {/* Goal Message */}
        {progress.dailyGoal.isCompleted ? (
          <View className="bg-saffron-100 p-3 rounded-xl flex-row items-center">
            <Ionicons name="star" size={16} color="#f97316" />
            <Text className="text-saffron-800 text-sm font-semibold ml-2">
              🎉 Goal completed! You&apos;re on fire!
            </Text>
          </View>
        ) : (
          <View className="bg-ancient-100 p-3 rounded-xl flex-row items-center">
            <Ionicons name="bulb" size={16} color="#f97316" />
            <Text className="text-ancient-800 text-sm ml-2">
              Just {progress.dailyGoal.target - progress.dailyGoal.completed} more minutes to reach your goal!
            </Text>
          </View>
        )}
      </View>

      {/* Weekly Stats Grid */}
      <View>
        <Text className="text-ancient-700 font-semibold text-sm mb-3">
          This Week&apos;s Progress
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Lessons Completed */}
          <View className="bg-white rounded-xl border border-ancient-200 p-3 w-[48%] mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="book-outline" size={20} color="#f97316" />
              <Text className="text-2xl font-bold text-saffron-600">
                {progress.weeklyStats.lessonsCompleted}
              </Text>
            </View>
            <Text className="text-ancient-600 text-xs">Lessons Completed</Text>
          </View>

          {/* Quizzes Passed */}
          <View className="bg-white rounded-xl border border-ancient-200 p-3 w-[48%] mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="checkbox-outline" size={20} color="#f97316" />
              <Text className="text-2xl font-bold text-saffron-600">
                {progress.weeklyStats.quizzesPassed}
              </Text>
            </View>
            <Text className="text-ancient-600 text-xs">Quizzes Passed</Text>
          </View>

          {/* Practice Time */}
          <View className="bg-white rounded-xl border border-ancient-200 p-3 w-[48%]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="time-outline" size={20} color="#ea580c" />
              <Text className="text-2xl font-bold text-saffron-600">
                {progress.weeklyStats.practiceTime}m
              </Text>
            </View>
            <Text className="text-ancient-600 text-xs">Practice Time</Text>
          </View>

          {/* Accuracy */}
          <View className="bg-white rounded-xl border border-ancient-200 p-3 w-[48%]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="analytics-outline" size={20} color="#f97316" />
              <Text className="text-2xl font-bold text-saffron-600">
                {progress.weeklyStats.accuracy}%
              </Text>
            </View>
            <Text className="text-ancient-600 text-xs">Average Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Motivational Footer */}
      <View className="mt-4 bg-ancient-50 rounded-xl border border-ancient-200 p-4">
        <View className="flex-row items-center">
          <View className="bg-saffron-100 p-2 rounded-full mr-3">
            <Ionicons name="ribbon" size={20} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-ancient-800 font-bold text-sm">
              Keep up the great work!
            </Text>
            <Text className="text-ancient-700 text-xs mt-0.5">
              You&apos;re learning faster than 78% of users this week
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
