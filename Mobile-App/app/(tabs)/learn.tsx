import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CourseCard from '../../components/courses/CourseCard';
import SearchBar from '../../components/courses/SearchBar';
import FilterModal from '../../components/courses/FilterModal';
import courseService, { Course, CourseFilters } from '../../services/courseService';

type TabType = 'browse' | 'my-learning';

export default function LearnScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [learningFilter, setLearningFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [activeFilters, setActiveFilters] = useState<CourseFilters>({
    priceType: 'all',
    sort: 'popular',
  });

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      applyFiltersAndSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilters, courses, activeTab]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(activeFilters);
      console.log('API Response:', response);
      const coursesData = response.data?.courses || response.courses || [];
      console.log('Courses loaded:', coursesData.length);
      setCourses(coursesData);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'browse') {
      await loadCourses();
    } else {
      await loadEnrolledCourses();
    }
    setRefreshing(false);
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...courses];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilters.category?.length) {
      filtered = filtered.filter((course) =>
        activeFilters.category!.some((cat) => course.metadata.category.includes(cat))
      );
    }

    // Apply difficulty filter
    if (activeFilters.difficulty?.length) {
      filtered = filtered.filter((course) =>
        activeFilters.difficulty!.includes(course.metadata.difficulty)
      );
    }

    // Apply price filter
    if (activeFilters.priceType && activeFilters.priceType !== 'all') {
      filtered = filtered.filter(
        (course) => course.pricing.type === activeFilters.priceType
      );
    }

    // Apply language filter
    if (activeFilters.language) {
      filtered = filtered.filter(
        (course) => course.metadata.language.instruction === activeFilters.language
      );
    }

    // Apply sorting
    switch (activeFilters.sort) {
      case 'popular':
        filtered.sort((a, b) => (b.stats?.enrollments || 0) - (a.stats?.enrollments || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
        break;
      case 'recent':
        // Assuming courses are already sorted by creation date
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.pricing?.amount || 0) - (b.pricing?.amount || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.pricing?.amount || 0) - (a.pricing?.amount || 0));
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleCoursePress = (course: Course) => {
    router.push(`/courses/${course._id}`);
  };

  const handleApplyFilters = (filters: CourseFilters) => {
    setActiveFilters(filters);
    setShowFilters(false);
    loadCourses();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.category?.length) count += activeFilters.category.length;
    if (activeFilters.difficulty?.length) count += activeFilters.difficulty.length;
    if (activeFilters.language) count++;
    if (activeFilters.priceType && activeFilters.priceType !== 'all') count++;
    return count;
  };

  const calculateProgress = (enrollment: any) => {
    if (!enrollment.progress || !enrollment.progress.sectionsProgress) {
      return 0;
    }

    const completedLectures = enrollment.progress.sectionsProgress.reduce(
      (total: number, section: any) => {
        return total + (section.completedLectures?.length || 0);
      },
      0
    );

    const totalLectures = enrollment.progress.sectionsProgress.reduce(
      (total: number, section: any) => {
        return total + (section.totalLectures || 0);
      },
      0
    );

    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  };

  const getEnrollmentStatus = (enrollment: any) => {
    const progress = calculateProgress(enrollment);
    if (progress === 0) return 'not-started';
    if (progress === 100) return 'completed';
    return 'in-progress';
  };

  const filteredEnrolledCourses = enrolledCourses.filter((enrollment) => {
    if (learningFilter === 'all') return true;
    const status = getEnrollmentStatus(enrollment);
    if (learningFilter === 'in-progress') return status === 'in-progress' || status === 'not-started';
    if (learningFilter === 'completed') return status === 'completed';
    return true;
  });

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <Ionicons name="search-outline" size={64} color="#d1d5db" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        No courses found
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Try adjusting your search or filters
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="bg-white px-4 pt-4 pb-2">
      {/* Tab Switcher */}
      <View className="flex-row mb-4 bg-gray-100 p-1 rounded-lg">
        <TouchableOpacity
          onPress={() => setActiveTab('browse')}
          className={`flex-1 py-3 rounded-lg ${
            activeTab === 'browse' ? 'bg-orange-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'browse' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Browse Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('my-learning')}
          className={`flex-1 py-3 rounded-lg ${
            activeTab === 'my-learning' ? 'bg-orange-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'my-learning' ? 'text-white' : 'text-gray-600'
            }`}
          >
            My Learning
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' ? (
        <>
          {/* Title */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-900 text-2xl font-bold">Explore Courses</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search courses..."
          />

          {/* Filter Button */}
          <View className="flex-row items-center justify-between mt-3 mb-2">
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="flex-row items-center bg-orange-50 px-4 py-2 rounded-lg border border-orange-200"
            >
              <Ionicons name="options-outline" size={20} color="#ea580c" />
              <Text className="text-orange-600 font-semibold ml-2">Filters</Text>
              {getActiveFilterCount() > 0 && (
                <View className="bg-orange-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">
                    {getActiveFilterCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sort Indicator */}
            <View className="flex-row items-center">
              <Ionicons name="swap-vertical" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1 capitalize">
                {activeFilters.sort?.replace('-', ' ')}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* My Learning Header */}
          <View className="mb-4">
            <Text className="text-gray-900 text-2xl font-bold">My Learning</Text>
            <Text className="text-gray-500 text-sm mt-1">
              {filteredEnrolledCourses.length} course{filteredEnrolledCourses.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row mb-2 gap-2">
            <TouchableOpacity
              onPress={() => setLearningFilter('all')}
              className={`px-4 py-2 rounded-full ${
                learningFilter === 'all' ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <Text className={learningFilter === 'all' ? 'text-white font-semibold' : 'text-gray-700'}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLearningFilter('in-progress')}
              className={`px-4 py-2 rounded-full ${
                learningFilter === 'in-progress' ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <Text className={learningFilter === 'in-progress' ? 'text-white font-semibold' : 'text-gray-700'}>
                In Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLearningFilter('completed')}
              className={`px-4 py-2 rounded-full ${
                learningFilter === 'completed' ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <Text className={learningFilter === 'completed' ? 'text-white font-semibold' : 'text-gray-700'}>
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderEnrolledCourseCard = ({ item }: { item: any }) => {
    const course = item.courseId || item.course;
    
    if (!course || !course._id) {
      console.warn('Invalid course in enrollment:', item);
      return null;
    }

    const progress = calculateProgress(item);
    const status = getEnrollmentStatus(item);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/courses/${course._id}`)}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 mx-4"
      >
        {/* Course Image */}
        {course.metadata?.thumbnail ? (
          <Image
            source={{ uri: course.metadata.thumbnail }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
            <Ionicons name="book" size={48} color="white" />
          </View>
        )}

        {/* Status Badge */}
        <View className="absolute top-3 right-3">
          <View
            className={`px-3 py-1 rounded-full ${
              status === 'completed'
                ? 'bg-green-500'
                : status === 'in-progress'
                ? 'bg-blue-500'
                : 'bg-gray-500'
            }`}
          >
            <Text className="text-white text-xs font-semibold">
              {status === 'completed'
                ? 'Completed'
                : status === 'in-progress'
                ? 'In Progress'
                : 'Not Started'}
            </Text>
          </View>
        </View>

        <View className="p-4">
          {/* Course Title */}
          <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
            {course.basic?.title || 'Untitled Course'}
          </Text>

          {/* Instructor */}
          {course.basic?.instructor && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {course.basic.instructor}
              </Text>
            </View>
          )}

          {/* Progress Bar */}
          <View className="mt-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-600 text-xs">Progress</Text>
              <Text className="text-orange-600 text-xs font-semibold">{progress}%</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Continue Learning Button */}
          <View className="mt-4">
            <View className="bg-orange-500 py-2 rounded-lg items-center">
              <Text className="text-white font-semibold">
                {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue Learning'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-gray-600 mt-4">Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        ListHeaderComponent={renderHeader}
        data={activeTab === 'browse' ? filteredCourses : filteredEnrolledCourses}
        renderItem={activeTab === 'browse' ? 
          ({ item }) => (
            <View className="px-4">
              <CourseCard course={item} onPress={handleCoursePress} />
            </View>
          ) :
          renderEnrolledCourseCard
        }
        keyExtractor={(item) => 
          activeTab === 'browse' ? item._id : (item.courseId?._id || item.course?._id || item._id)
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          activeTab === 'browse' ? renderEmptyState : (
            <View className="flex-1 items-center justify-center py-12 px-6">
              <Ionicons name="book-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
                No enrolled courses
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Browse courses to start learning
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ea580c"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </SafeAreaView>
  );
}