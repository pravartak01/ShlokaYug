import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CourseCard from '../../components/courses/CourseCard';
import SearchBar from '../../components/courses/SearchBar';
import FilterModal from '../../components/courses/FilterModal';
import courseService, { Course, CourseFilters } from '../../services/courseService';

export default function LearnScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CourseFilters>({
    priceType: 'all',
    sort: 'popular',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, activeFilters, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(activeFilters);
      console.log('API Response:', response);
      const coursesData = response.data?.courses || response.courses || [];
      console.log('Courses loaded:', coursesData.length);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
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
    </View>
  );

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
        data={filteredCourses}
        renderItem={({ item }) => (
          <View className="px-4">
            <CourseCard course={item} onPress={handleCoursePress} />
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyState}
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