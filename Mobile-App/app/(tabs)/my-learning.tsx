/**
 * My Learning Tab - Modern Indigo Theme
 * Displays enrolled courses with progress tracking and smooth animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import courseService from '../../services/courseService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Filter Chip Component
const FilterChip = ({ 
  active, 
  onPress, 
  label,
  icon,
  count 
}: { 
  active: boolean; 
  onPress: () => void; 
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        className={`px-4 py-2.5 rounded-xl flex-row items-center mr-2 ${
          active ? 'bg-indigo-500' : 'bg-white border border-gray-200'
        }`}
        style={{ 
          transform: [{ scale: scaleAnim }],
          shadowColor: active ? '#6366f1' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: active ? 0.2 : 0.05,
          shadowRadius: 4,
          elevation: active ? 4 : 2,
        }}
      >
        <Ionicons 
          name={icon} 
          size={16} 
          color={active ? '#ffffff' : '#6b7280'} 
        />
        <Text className={`font-semibold text-sm ml-1.5 ${active ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View className={`ml-1.5 px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-indigo-100'}`}>
            <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-indigo-600'}`}>{count}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Course Card Component
const AnimatedCourseCard = ({ 
  item, 
  index, 
  onPress 
}: { 
  item: any; 
  index: number; 
  onPress: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const course = item.courseId || item.course || item;
  const progress = item.progress?.completionPercentage || 0;

  const getStatusConfig = () => {
    if (progress === 100) {
      return { 
        bg: 'bg-emerald-500', 
        icon: 'trophy', 
        label: 'Completed', 
        color: '#10b981',
        buttonText: 'View Certificate',
        buttonIcon: 'ribbon'
      };
    }
    if (progress > 0) {
      return { 
        bg: 'bg-indigo-500', 
        icon: 'play-circle', 
        label: `${Math.round(progress)}%`, 
        color: '#6366f1',
        buttonText: 'Continue Learning',
        buttonIcon: 'play'
      };
    }
    return { 
      bg: 'bg-amber-500', 
      icon: 'rocket', 
      label: 'New', 
      color: '#f59e0b',
      buttonText: 'Start Your Journey',
      buttonIcon: 'arrow-forward'
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="bg-white rounded-3xl overflow-hidden mb-4"
        style={{
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        {/* Course Thumbnail */}
        <View className="relative">
          {course.thumbnail || course.metadata?.thumbnail ? (
            <Image 
              source={{ uri: course.thumbnail || course.metadata?.thumbnail }} 
              className="w-full h-48" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-48 bg-indigo-100 items-center justify-center">
              <View className="w-20 h-20 bg-indigo-200 rounded-full items-center justify-center">
                <Ionicons name="book" size={40} color="#6366f1" />
              </View>
            </View>
          )}

          {/* Gradient overlay */}
          <View 
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          />

          {/* Status Badge */}
          <View className={`absolute top-3 right-3 ${statusConfig.bg} px-3 py-1.5 rounded-full flex-row items-center`}>
            <Ionicons name={statusConfig.icon as any} size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-1">{statusConfig.label}</Text>
          </View>

          {/* Progress on thumbnail */}
          <View className="absolute bottom-3 left-3 right-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-white/90 text-xs font-medium">Your Progress</Text>
              <Text className="text-white text-sm font-bold">{Math.round(progress)}%</Text>
            </View>
            <View className="h-2 bg-white/30 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: statusConfig.color }}
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
            {course.title || course.basic?.title || 'Untitled Course'}
          </Text>

          {/* Meta Row */}
          <View className="flex-row items-center flex-wrap mb-4">
            {/* Instructor */}
            <View className="flex-row items-center mr-4 mb-1">
              <View className="w-6 h-6 bg-indigo-100 rounded-full items-center justify-center">
                <Ionicons name="person" size={12} color="#6366f1" />
              </View>
              <Text className="text-gray-600 text-sm ml-1.5">
                {course.instructor?.name || course.basic?.instructor || 'Instructor'}
              </Text>
            </View>

            {/* Lessons */}
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 bg-amber-100 rounded-full items-center justify-center">
                <Ionicons name="videocam" size={12} color="#f59e0b" />
              </View>
              <Text className="text-gray-600 text-sm ml-1.5">
                {course.lessonsCount || course.stats?.lessonsCount || '12'} Lessons
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={onPress}
            className="py-3.5 rounded-2xl items-center flex-row justify-center"
            style={{ backgroundColor: statusConfig.color }}
            activeOpacity={0.8}
          >
            <Ionicons name={statusConfig.buttonIcon as any} size={18} color="#ffffff" />
            <Text className="text-white font-bold ml-2">{statusConfig.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stats Card Component
const StatsCard = ({ 
  icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) => (
  <View 
    className="flex-1 rounded-2xl p-4 mr-2"
    style={{ backgroundColor: bgColor }}
  >
    <View 
      className="w-10 h-10 rounded-xl items-center justify-center mb-2"
      style={{ backgroundColor: color }}
    >
      <Ionicons name={icon} size={20} color="#ffffff" />
    </View>
    <Text className="text-2xl font-bold" style={{ color }}>{value}</Text>
    <Text className="text-gray-600 text-xs font-medium">{label}</Text>
  </View>
);

export default function MyLearningScreen() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  // Animation refs
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const statsFade = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(statsFade, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(statsSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    loadEnrolledCourses();
  }, [headerFade, headerSlide, statsFade, statsSlide]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getEnrolledCourses();
      const enrollments = response.data?.enrollments || [];
      
      const validEnrollments = enrollments.filter((enrollment: any) => {
        const course = enrollment.courseId || enrollment.course;
        return course && course._id;
      });
      
      setEnrolledCourses(validEnrollments);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnrolledCourses();
    setRefreshing(false);
  };

  // Calculate stats
  const completedCount = enrolledCourses.filter(e => (e.progress?.completionPercentage || 0) === 100).length;
  const inProgressCount = enrolledCourses.filter(e => {
    const p = e.progress?.completionPercentage || 0;
    return p > 0 && p < 100;
  }).length;

  const filteredCourses = enrolledCourses.filter((enrollment) => {
    const progress = enrollment.progress?.completionPercentage || 0;
    if (filter === 'all') return true;
    if (filter === 'completed') return progress === 100;
    if (filter === 'in-progress') return progress > 0 && progress < 100;
    return true;
  });

  const renderHeader = () => (
    <View className="px-4 pt-4">
      {/* Page Title */}
      <Animated.View 
        style={{ 
          opacity: headerFade, 
          transform: [{ translateY: headerSlide }] 
        }}
      >
        <Text className="text-gray-400 text-sm font-medium">Your Progress</Text>
        <Text className="text-gray-900 text-2xl font-bold mb-4">My Learning Journey</Text>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View 
        className="flex-row mb-4"
        style={{ 
          opacity: statsFade, 
          transform: [{ translateY: statsSlide }] 
        }}
      >
        <StatsCard 
          icon="book" 
          label="Total Courses" 
          value={enrolledCourses.length}
          color="#6366f1"
          bgColor="#eef2ff"
        />
        <StatsCard 
          icon="play-circle" 
          label="In Progress" 
          value={inProgressCount}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <StatsCard 
          icon="trophy" 
          label="Completed" 
          value={completedCount}
          color="#10b981"
          bgColor="#d1fae5"
        />
      </Animated.View>

      {/* Motivation Banner */}
      {enrolledCourses.length > 0 && (
        <View 
          className="bg-indigo-500 rounded-2xl p-4 mb-4 flex-row items-center"
          style={{
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Ionicons name="flame" size={24} color="#ffffff" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-base">
              {completedCount > 0 ? 'Great Progress!' : 'Keep Learning!'}
            </Text>
            <Text className="text-white/80 text-sm">
              {completedCount > 0 
                ? `You&apos;ve completed ${completedCount} course${completedCount > 1 ? 's' : ''}. Amazing work!`
                : 'Continue your journey to Sanskrit mastery'
              }
            </Text>
          </View>
        </View>
      )}

      {/* Filter Chips */}
      <View className="flex-row mb-4 overflow-visible">
        <FilterChip
          active={filter === 'all'}
          onPress={() => setFilter('all')}
          label="All"
          icon="grid"
          count={enrolledCourses.length}
        />
        <FilterChip
          active={filter === 'in-progress'}
          onPress={() => setFilter('in-progress')}
          label="In Progress"
          icon="play-circle"
          count={inProgressCount}
        />
        <FilterChip
          active={filter === 'completed'}
          onPress={() => setFilter('completed')}
          label="Completed"
          icon="checkmark-circle"
          count={completedCount}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="school" size={40} color="#6366f1" />
      </View>
      <Text className="text-gray-800 text-xl font-bold text-center mb-2">
        Start Your Learning Adventure
      </Text>
      <Text className="text-gray-500 text-sm text-center leading-5 mb-6">
        Explore our curated Sanskrit courses and begin your journey to wisdom
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/learn')}
        className="bg-indigo-500 px-6 py-3.5 rounded-xl flex-row items-center"
        style={{
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="compass" size={20} color="#ffffff" />
        <Text className="text-white font-bold ml-2">Explore Courses</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text className="text-gray-700 font-medium">Loading your courses...</Text>
          <Text className="text-gray-400 text-sm mt-1">Preparing your learning dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filteredCourses}
        renderItem={({ item, index }) => (
          <View className="px-4">
            <AnimatedCourseCard
              item={item}
              index={index}
              onPress={() => router.push(`/courses/${(item.courseId || item.course)?._id}/learn`)}
            />
          </View>
        )}
        keyExtractor={(item) => item._id || item.course?._id || item.courseId?._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
