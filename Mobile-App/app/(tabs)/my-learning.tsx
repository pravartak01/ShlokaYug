/**
 * My Learning Tab
 * Displays enrolled courses with progress tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import courseService from '../../services/courseService';

export default function MyLearningScreen() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getEnrolledCourses();
      const enrollments = response.data?.enrollments || [];
      
      // Filter out enrollments with missing courses
      const validEnrollments = enrollments.filter((enrollment: any) => {
        const course = enrollment.courseId || enrollment.course;
        if (!course || !course._id) {
          console.warn('Skipping enrollment with missing course:', enrollment);
          return false;
        }
        return true;
      });
      
      console.log('Valid enrollments:', validEnrollments.length);
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

  const filteredCourses = enrolledCourses.filter((enrollment) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return enrollment.progress?.completionPercentage === 100;
    if (filter === 'in-progress')
      return enrollment.progress?.completionPercentage > 0 && enrollment.progress?.completionPercentage < 100;
    return true;
  });

  const renderCourseCard = ({ item }: { item: any }) => {
    // Handle both enrollment structure (courseId) and direct course object
    const course = item.courseId || item.course || item;
    const progress = item.progress?.completionPercentage || 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/courses/${course._id}/learn`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden"
      >
        {/* Thumbnail */}
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} className="w-full h-40" resizeMode="cover" />
        ) : (
          <View className="w-full h-40 bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center">
            <Ionicons name="book" size={48} color="white" />
          </View>
        )}

        {/* Progress Badge */}
        {progress === 100 ? (
          <View className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text className="text-white text-xs font-bold ml-1">Completed</Text>
          </View>
        ) : (
          <View className="absolute top-3 right-3 bg-orange-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Content */}
        <View className="p-4">
          <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
            {course.title}
          </Text>

          {/* Instructor */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-circle" size={16} color="#f97316" />
            <Text className="text-gray-600 text-sm ml-1">{course.instructor?.name}</Text>
          </View>

          {/* Progress Bar */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-600 text-xs">Progress</Text>
              <Text className="text-orange-600 text-xs font-bold">{Math.round(progress)}%</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity className="bg-orange-500 py-3 rounded-lg flex-row items-center justify-center">
            <Ionicons
              name={progress === 100 ? 'trophy' : 'play-circle'}
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold ml-2">
              {progress === 100 ? 'View Certificate' : 'Continue Learning'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2">
      <Text className="text-gray-900 text-2xl font-bold mb-4">My Learning</Text>

      {/* Filter Tabs */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'all' ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        >
          <Text className={`font-semibold ${filter === 'all' ? 'text-white' : 'text-gray-700'}`}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'in-progress' ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-semibold ${filter === 'in-progress' ? 'text-white' : 'text-gray-700'}`}
          >
            In Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'completed' ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-semibold ${filter === 'completed' ? 'text-white' : 'text-gray-700'}`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <Ionicons name="school-outline" size={64} color="#d1d5db" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        No enrolled courses yet
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Start learning by enrolling in courses
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/learn')}
        className="bg-orange-500 px-6 py-3 rounded-lg mt-4"
      >
        <Text className="text-white font-semibold">Browse Courses</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-4">Loading your courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filteredCourses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id || item.course?._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
