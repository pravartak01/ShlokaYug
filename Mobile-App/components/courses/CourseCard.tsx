/**
 * CourseCard Component - Modern Indigo Theme
 * Reusable card component for displaying course information with animations
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../services/courseService';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': 
        return { color: '#10b981', bg: '#d1fae5', label: 'Beginner', icon: 'leaf' };
      case 'intermediate': 
        return { color: '#f59e0b', bg: '#fef3c7', label: 'Intermediate', icon: 'trending-up' };
      case 'advanced': 
        return { color: '#ef4444', bg: '#fee2e2', label: 'Advanced', icon: 'flash' };
      default: 
        return { color: '#6b7280', bg: '#f3f4f6', label: 'All Levels', icon: 'school' };
    }
  };

  const formatPrice = () => {
    const oneTimeAmount = (course.pricing as any)?.oneTime?.amount;
    const subscriptionAmount = (course.pricing as any)?.subscription?.monthly?.amount;
    const oldAmount = course.pricing?.amount;
    const oldType = course.pricing?.type;
    
    if (oldType === 'free') return { text: 'Free', isFree: true };
    if (oneTimeAmount && oneTimeAmount > 0) return { text: `₹${oneTimeAmount}`, isFree: false };
    if (subscriptionAmount && subscriptionAmount > 0) return { text: `₹${subscriptionAmount}/mo`, isFree: false };
    if (oldAmount && oldAmount > 0) return { text: `₹${oldAmount}`, isFree: false };
    
    return { text: 'Free', isFree: true };
  };

  const difficulty = course.metadata?.difficulty || 'beginner';
  const difficultyConfig = getDifficultyConfig(difficulty);
  const rating = course.stats?.rating || 0;
  const reviews = course.stats?.reviews || 0;
  const enrollments = course.stats?.enrollments || 0;
  const totalLessons = course.structure?.totalLessons || 0;
  const priceInfo = formatPrice();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress(course)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="bg-white rounded-3xl mb-4 overflow-hidden"
        style={{
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Thumbnail */}
        <View className="relative">
          {course.thumbnail ? (
            <Image
              source={{ uri: course.thumbnail }}
              className="w-full h-44"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-44 bg-indigo-100 items-center justify-center">
              <View className="w-16 h-16 bg-indigo-200 rounded-full items-center justify-center">
                <Ionicons name="book" size={32} color="#6366f1" />
              </View>
            </View>
          )}

          {/* Gradient overlay */}
          <View 
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          />

          {/* Enrolled Badge */}
          {course.isEnrolled && (
            <View className="absolute top-3 left-3 bg-emerald-500 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
              <Text className="text-white text-xs font-bold ml-1">Enrolled</Text>
            </View>
          )}

          {/* Price Badge */}
          <View 
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${
              priceInfo.isFree ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
          >
            <Text className="text-white text-sm font-bold">
              {priceInfo.text}
            </Text>
          </View>

          {/* Rating on thumbnail */}
          <View className="absolute bottom-3 left-3 flex-row items-center bg-black/50 px-2.5 py-1 rounded-full">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-white text-sm font-bold ml-1">
              {rating.toFixed(1)}
            </Text>
            <Text className="text-white/70 text-xs ml-1">
              ({reviews})
            </Text>
          </View>

          {/* Duration/Lessons badge */}
          <View className="absolute bottom-3 right-3 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Ionicons name="videocam" size={14} color="#ffffff" />
            <Text className="text-white text-sm font-medium ml-1">
              {totalLessons} Lessons
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Title */}
          <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
            {course.title}
          </Text>

          {/* Instructor */}
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 bg-indigo-100 rounded-full items-center justify-center">
              <Ionicons name="person" size={14} color="#6366f1" />
            </View>
            <Text className="text-gray-600 text-sm ml-2 font-medium" numberOfLines={1}>
              {course.instructor.name}
            </Text>
          </View>

          {/* Meta Info Row */}
          <View className="flex-row items-center justify-between">
            {/* Difficulty Badge */}
            <View 
              className="px-3 py-1.5 rounded-xl flex-row items-center"
              style={{ backgroundColor: difficultyConfig.bg }}
            >
              <Ionicons 
                name={difficultyConfig.icon as any} 
                size={14} 
                color={difficultyConfig.color} 
              />
              <Text 
                className="text-xs font-bold ml-1"
                style={{ color: difficultyConfig.color }}
              >
                {difficultyConfig.label}
              </Text>
            </View>

            {/* Enrollments */}
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-amber-100 rounded-full items-center justify-center">
                <Ionicons name="people" size={12} color="#f59e0b" />
              </View>
              <Text className="text-gray-600 text-sm ml-1.5 font-medium">
                {enrollments > 1000 ? `${(enrollments/1000).toFixed(1)}K` : enrollments}+ learners
              </Text>
            </View>
          </View>

          {/* Enroll Button */}
          <TouchableOpacity
            onPress={() => onPress(course)}
            className="mt-4 py-3.5 rounded-2xl items-center flex-row justify-center bg-indigo-500"
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={18} color="#ffffff" />
            <Text className="text-white font-bold ml-2">
              {course.isEnrolled ? 'Continue Learning' : 'View Course'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
