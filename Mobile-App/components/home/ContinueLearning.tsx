import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    target: number;
    completed: number;
    streak: number;
    isCompleted: boolean;
  };
  weeklyStats: {
    lessonsCompleted: number;
    quizzesPassed: number;
    practiceTime: number;
    accuracy: number;
  };
}

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
  const dailyGoalProgress = Math.min((progress.dailyGoal.completed / progress.dailyGoal.target) * 100, 100);
  
  const getActivityIcon = (type: string) => {
    if (type === 'lesson') return { icon: 'book', color: '#3b82f6', bg: 'bg-blue-50' };
    if (type === 'quiz') return { icon: 'help-circle', color: '#22c55e', bg: 'bg-green-50' };
    if (type === 'practice') return { icon: 'musical-notes', color: '#a0704a', bg: 'bg-sandalwood-50' };
    return { icon: 'checkmark-circle', color: '#6b7280', bg: 'bg-gray-50' };
  };
  
  const activityStyle = getActivityIcon(progress.lastActivity.type);

  return (
    <View className="px-5 py-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-gray-900 text-lg font-bold">Continue Learning</Text>
          <Text className="text-gray-500 text-sm">Pick up where you left off</Text>
        </View>
        <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full">
          <Ionicons name="flame" size={14} color="#ef4444" />
          <Text className="text-red-600 font-bold text-sm ml-1">{progress.dailyGoal.streak} days</Text>
        </View>
      </View>

      {/* Main Course Card */}
      <View 
        className="bg-white rounded-2xl mb-4 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Course Header */}
        <View className="bg-[#4A2E1C] p-4">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-3xl">{progress.currentCourse.thumbnail}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{progress.currentCourse.title}</Text>
              <Text className="text-white/80 text-sm">{progress.currentCourse.subtitle}</Text>
            </View>
            <View className="bg-white px-3 py-1.5 rounded-full">
              <Text className="text-[#4A2E1C] font-bold text-sm">{progress.currentCourse.progress}%</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500 text-xs">
              {progress.currentCourse.completedLessons} of {progress.currentCourse.totalLessons} lessons
            </Text>
            <Text className="text-gray-400 text-xs">{progress.currentCourse.estimatedTimeLeft} left</Text>
          </View>
          <View className="bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
            <View className="bg-[#4A2E1C] h-full rounded-full" style={{ width: `${progress.currentCourse.progress}%` }} />
          </View>

          <TouchableOpacity className="bg-[#4A2E1C] rounded-xl py-3.5 flex-row items-center justify-center" activeOpacity={0.8}>
            <Ionicons name="play-circle" size={22} color="white" />
            <Text className="text-white font-bold text-base ml-2">Resume Course</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Activity & Daily Goal Row */}
      <View className="flex-row mb-4">
        {/* Last Activity */}
        <View className="flex-1 mr-2 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-500 text-xs font-medium ml-1">Recent</Text>
          </View>
          <View className="flex-row items-center">
            <View className={`w-9 h-9 ${activityStyle.bg} rounded-lg items-center justify-center mr-2.5`}>
              <Ionicons name={activityStyle.icon as any} size={18} color={activityStyle.color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>{progress.lastActivity.title}</Text>
              <Text className="text-gray-400 text-xs">{progress.lastActivity.timestamp}</Text>
            </View>
          </View>
        </View>

        {/* Daily Goal */}
        <View className="flex-1 ml-2 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={14} color="#f59e0b" />
              <Text className="text-gray-500 text-xs font-medium ml-1">Daily Goal</Text>
            </View>
            {progress.dailyGoal.isCompleted && (
              <View className="bg-green-500 w-5 h-5 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
          <Text className="text-gray-800 font-bold text-lg mb-1">
            {progress.dailyGoal.completed}/{progress.dailyGoal.target}m
          </Text>
          <View className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <View className="bg-[#4A2E1C] h-full rounded-full" style={{ width: `${dailyGoalProgress}%` }} />
          </View>
        </View>
      </View>

      {/* Weekly Stats Grid */}
      <View className="bg-white rounded-xl p-4 border border-gray-100">
        <Text className="text-gray-900 font-semibold text-sm mb-3">This Week</Text>
        <View className="flex-row">
          {[
            { icon: 'book-outline', value: progress.weeklyStats.lessonsCompleted, label: 'Lessons', color: '#3b82f6' },
            { icon: 'checkbox-outline', value: progress.weeklyStats.quizzesPassed, label: 'Quizzes', color: '#22c55e' },
            { icon: 'time-outline', value: `${progress.weeklyStats.practiceTime}m`, label: 'Practice', color: '#a0704a' },
            { icon: 'analytics-outline', value: `${progress.weeklyStats.accuracy}%`, label: 'Accuracy', color: '#f59e0b' },
          ].map((stat, idx) => (
            <View key={idx} className="flex-1 items-center">
              <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              <Text className="text-gray-900 font-bold text-lg mt-1">{stat.value}</Text>
              <Text className="text-gray-400 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
