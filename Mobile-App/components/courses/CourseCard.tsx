/**
 * CourseCard Component
 * Reusable card component for displaying course information
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../services/courseService';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = () => {
    // Handle new pricing structure: pricing.oneTime.amount or pricing.subscription
    const oneTimeAmount = (course.pricing as any)?.oneTime?.amount;
    const subscriptionAmount = (course.pricing as any)?.subscription?.monthly?.amount;
    
    // Check old structure for backward compatibility
    const oldAmount = course.pricing?.amount;
    const oldType = course.pricing?.type;
    
    // Determine the price to display
    if (oldType === 'free') return 'Free';
    if (oneTimeAmount && oneTimeAmount > 0) return `₹${oneTimeAmount}`;
    if (subscriptionAmount && subscriptionAmount > 0) return `₹${subscriptionAmount}/mo`;
    if (oldAmount && oldAmount > 0) return `₹${oldAmount}`;
    
    return 'Free';
  };

  const difficulty = course.metadata?.difficulty || 'beginner';
  const category = course.metadata?.category?.[0] || 'general';
  const rating = course.stats?.rating || 0;
  const reviews = course.stats?.reviews || 0;
  const enrollments = course.stats?.enrollments || 0;
  const totalLessons = course.structure?.totalLessons || 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(course)}
      className="bg-white rounded-2xl shadow-sm border border-ancient-200 mb-4 overflow-hidden"
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      {course.thumbnail ? (
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-gradient-to-br from-ancient-400 to-ancient-600 items-center justify-center">
          <Ionicons name="book" size={48} color="white" />
        </View>
      )}

      {/* Enrolled Badge */}
      {course.isEnrolled && (
        <View className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">Enrolled</Text>
        </View>
      )}

      {/* Price Badge */}
      <View className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full">
        <Text className="text-ancient-800 text-sm font-bold">
          {formatPrice()}
        </Text>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Title */}
        <Text className="text-ancient-800 text-lg font-bold mb-2" numberOfLines={2}>
          {course.title}
        </Text>

        {/* Instructor */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="person-circle" size={16} color="#996f0a" />
          <Text className="text-ancient-600 text-sm ml-1" numberOfLines={1}>
            {course.instructor.name}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text className="text-ancient-700 text-sm ml-1 font-medium">
              {rating.toFixed(1)}
            </Text>
            <Text className="text-ancient-500 text-xs ml-1">
              ({reviews})
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text className="text-ancient-600 text-sm ml-1">
              {enrollments}+ enrolled
            </Text>
          </View>
        </View>

        {/* Meta Info */}
        <View className="flex-row items-center justify-between">
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: getDifficultyColor(difficulty) + '20' }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ color: getDifficultyColor(difficulty) }}
            >
              {difficulty.toUpperCase()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="book-outline" size={14} color="#996f0a" />
            <Text className="text-ancient-600 text-sm ml-1">
              {totalLessons} lessons
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
