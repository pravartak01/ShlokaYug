import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CourseCard from '../../components/courses/CourseCard';
import SearchBar from '../../components/courses/SearchBar';
import FilterModal from '../../components/courses/FilterModal';
import courseService, { Course, CourseFilters } from '../../services/courseService';
import { getFullImageUrl } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors - Vintage Brown with Gold/Saffron/Copper highlights
const PRIMARY_BROWN = '#4A2E1C';    // Vintage brown for theme
const COPPER = '#B87333';           // Copper for warmth
const GOLD = '#D4A017';             // Gold for highlights
const SAFFRON = '#DD7A1F';          // Saffron for actions
const SAND = '#F3E4C8';             // Sand/Beige for backgrounds

type TabType = 'browse' | 'my-learning';

// Animated Tab Button Component
const AnimatedTabButton = ({ 
  active, 
  onPress, 
  icon, 
  label 
}: { 
  active: boolean; 
  onPress: () => void; 
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-1">
      <View
        className={`py-3 px-4 rounded-xl flex-row items-center justify-center`}
        style={{ backgroundColor: active ? SAFFRON : '#f3f4f6' }}
      >
        <Ionicons 
          name={active ? icon : `${icon}-outline` as any} 
          size={18} 
          color={active ? '#ffffff' : '#6b7280'} 
        />
        <Text
          className={`ml-2 font-semibold ${active ? 'text-white' : 'text-gray-600'}`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Animated Filter Chip Component
const FilterChip = ({ 
  active, 
  onPress, 
  label,
  icon 
}: { 
  active: boolean; 
  onPress: () => void; 
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
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
        className={`px-4 py-2 rounded-full flex-row items-center mr-2 ${!active && 'bg-gray-100 border border-gray-200'}`}
        style={{ 
          transform: [{ scale: scaleAnim }],
          backgroundColor: active ? COPPER : undefined
        }}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={14} 
            color={active ? '#ffffff' : '#6b7280'} 
            style={{ marginRight: 4 }}
          />
        )}
        <Text className={`font-medium text-sm ${active ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Course Card for Enrolled Courses
const EnrolledCourseCard = ({ 
  item, 
  index, 
  onPress 
}: { 
  item: any; 
  index: number; 
  onPress: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

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

  const course = item.courseId || item.course;
  if (!course || !course._id) return null;

  // Get thumbnail URL - check both course.thumbnail and course.metadata.thumbnail
  const thumbnailUrl = getFullImageUrl(course.thumbnail || course.metadata?.thumbnail);

  const calculateProgress = () => {
    if (!item.progress || !item.progress.sectionsProgress) return 0;
    const completedLectures = item.progress.sectionsProgress.reduce(
      (total: number, section: any) => total + (section.completedLectures?.length || 0),
      0
    );
    const totalLectures = item.progress.sectionsProgress.reduce(
      (total: number, section: any) => total + (section.totalLectures || 0),
      0
    );
    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  };

  const progress = calculateProgress();
  const status = progress === 0 ? 'not-started' : progress === 100 ? 'completed' : 'in-progress';

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-emerald-500', icon: 'checkmark-circle', label: 'Completed', color: '#10b981' };
      case 'in-progress':
        return { bg: 'bg-[#DD7A1F]', icon: 'play-circle', label: 'Continue', color: SAFFRON };
      default:
        return { bg: 'bg-[#D4A017]', icon: 'rocket', label: 'Start Now', color: GOLD };
    }
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
        className="bg-white rounded-3xl overflow-hidden mb-4 mx-4"
        style={{
          shadowColor: PRIMARY_BROWN,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Course Thumbnail */}
        <View className="relative">
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              className="w-full h-56"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-56 bg-[#F3E4C8] items-center justify-center">
              <View className="w-20 h-20 bg-[#E5D1AF] rounded-full items-center justify-center">
                <Ionicons name="book" size={40} color={PRIMARY_BROWN} />
              </View>
            </View>
          )}

          {/* Overlay gradient */}
          <View 
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />

          {/* Status Badge */}
          <View className={`absolute top-3 right-3 ${statusConfig.bg} px-3 py-1.5 rounded-full flex-row items-center`}>
            <Ionicons name={statusConfig.icon as any} size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-1">{statusConfig.label}</Text>
          </View>

          {/* Progress on image */}
          <View className="absolute bottom-3 left-3 right-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white text-xs font-medium">Your Progress</Text>
              <Text className="text-white text-xs font-bold">{progress}%</Text>
            </View>
            <View className="h-1.5 bg-white/30 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: statusConfig.color }}
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Title */}
          <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
            {course.basic?.title || course.title || 'Untitled Course'}
          </Text>

          {/* Meta info */}
          <View className="flex-row items-center flex-wrap mb-3">
            {/* Instructor */}
            <View className="flex-row items-center mr-4 mb-1">
              <View className="w-6 h-6 bg-[#F9F0E6] rounded-full items-center justify-center">
                <Ionicons name="person" size={12} color={COPPER} />
              </View>
              <Text className="text-gray-600 text-sm ml-1.5">
                {course.basic?.instructor || course.instructor?.name || 'Instructor'}
              </Text>
            </View>

            {/* Duration */}
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 bg-[#FDF8E8] rounded-full items-center justify-center">
                <Ionicons name="time" size={12} color={GOLD} />
              </View>
              <Text className="text-gray-600 text-sm ml-1.5">
                {course.metadata?.duration || '10+ Hours'}
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
            <Ionicons 
              name={status === 'completed' ? 'trophy' : status === 'in-progress' ? 'play' : 'rocket'} 
              size={18} 
              color="#ffffff" 
            />
            <Text className="text-white font-bold ml-2">
              {status === 'completed' ? 'Review Course' : status === 'in-progress' ? 'Continue Learning' : 'Start Your Journey'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  // Animation refs
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Header entrance animation
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
    ]).start();

    loadCourses();
    loadEnrolledCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload enrolled courses when screen comes into focus (e.g., after payment)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused - reloading enrolled courses...');
      loadEnrolledCourses();
    }, [])
  );

  // Also reload when switching to My Learning tab
  useEffect(() => {
    if (activeTab === 'my-learning') {
      console.log('🔄 Switched to My Learning tab - reloading...');
      loadEnrolledCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'browse') {
      applyFiltersAndSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilters, courses, enrolledCourses, activeTab]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(activeFilters);
      const coursesData = response.data?.courses || response.courses || [];
      setCourses(coursesData);
    } catch (error: any) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      console.log('🎓 Loading enrolled courses...');
      const response = await courseService.getEnrolledCourses();
      console.log('🎓 Enrolled courses raw response:', JSON.stringify(response, null, 2));
      
      // Response structure: { success: true, data: { enrollments: [...] } }
      // courseService returns response.data, so we get: { success, data: { enrollments } }
      const enrollments = response?.data?.enrollments || response?.enrollments || [];
      console.log('🎓 Enrollments extracted:', enrollments.length, 'enrollments');
      
      if (enrollments.length === 0) {
        console.log('🎓 No enrollments found in response. Response keys:', Object.keys(response || {}));
      }
      
      const validEnrollments = enrollments.filter((enrollment: any) => {
        const course = enrollment.courseId || enrollment.course;
        const isValid = course && course._id;
        console.log('🎓 Enrollment validation:', { 
          enrollmentId: enrollment._id,
          courseId: course?._id,
          courseTitle: course?.title,
          isValid 
        });
        return isValid;
      });
      
      console.log('🎓 Valid enrollments count:', validEnrollments.length);
      setEnrolledCourses(validEnrollments);
    } catch (error) {
      console.error('❌ Error loading enrolled courses:', error);
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
    // Create a set of enrolled course IDs for quick lookup
    const enrolledCourseIds = new Set(
      enrolledCourses.map((enrollment: any) => {
        const course = enrollment.courseId || enrollment.course;
        return course?._id || course;
      }).filter(Boolean)
    );

    // Map courses with enrollment status
    let filtered = courses.map(course => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course._id)
    }));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.name.toLowerCase().includes(query)
      );
    }

    if (activeFilters.category?.length) {
      filtered = filtered.filter((course) =>
        activeFilters.category!.some((cat) => course.metadata.category.includes(cat))
      );
    }

    if (activeFilters.difficulty?.length) {
      filtered = filtered.filter((course) =>
        activeFilters.difficulty!.includes(course.metadata.difficulty)
      );
    }

    if (activeFilters.priceType && activeFilters.priceType !== 'all') {
      filtered = filtered.filter(
        (course) => course.pricing.type === activeFilters.priceType
      );
    }

    switch (activeFilters.sort) {
      case 'popular':
        filtered.sort((a, b) => (b.stats?.enrollments || 0) - (a.stats?.enrollments || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
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

  const filteredEnrolledCourses = enrolledCourses.filter((enrollment) => {
    if (learningFilter === 'all') return true;
    const progress = enrollment.progress?.completionPercentage || 0;
    if (learningFilter === 'in-progress') return progress > 0 && progress < 100;
    if (learningFilter === 'completed') return progress === 100;
    return true;
  });

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View className="w-24 h-24 bg-[#F3E4C8] rounded-full items-center justify-center mb-4">
        <Ionicons name="search" size={40} color={PRIMARY_BROWN} />
      </View>
      <Text className="text-gray-800 text-xl font-bold text-center mb-2">
        No Courses Found
      </Text>
      <Text className="text-gray-500 text-sm text-center leading-5">
        Try adjusting your search or filters to discover amazing courses
      </Text>
    </View>
  );

  const renderMyLearningEmpty = () => (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View className="w-24 h-24 bg-[#F3E4C8] rounded-full items-center justify-center mb-4">
        <Ionicons name="school" size={40} color={PRIMARY_BROWN} />
      </View>
      <Text className="text-gray-800 text-xl font-bold text-center mb-2">
        Start Your Learning Journey
      </Text>
      <Text className="text-gray-500 text-sm text-center leading-5 mb-6">
        Explore our courses and begin mastering Sanskrit wisdom today
      </Text>
      <TouchableOpacity
        onPress={() => setActiveTab('browse')}
        style={{ backgroundColor: SAFFRON }}
        className="px-6 py-3 rounded-xl flex-row items-center"
        activeOpacity={0.8}
      >
        <Ionicons name="compass" size={18} color="#ffffff" />
        <Text className="text-white font-bold ml-2">Explore Courses</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <Animated.View 
      className="bg-white px-4 pt-4 pb-2"
      style={{
        opacity: headerFade,
        transform: [{ translateY: headerSlide }],
      }}
    >
      {/* Page Title */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-gray-400 text-sm font-medium">Discover & Learn</Text>
          <Text className="text-gray-900 text-2xl font-bold">Sanskrit Courses</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-11 h-11 bg-[#FDF8E8] rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark" size={20} color={GOLD} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row mb-4 bg-gray-100 p-1.5 rounded-2xl gap-2">
        <AnimatedTabButton
          active={activeTab === 'browse'}
          onPress={() => setActiveTab('browse')}
          icon="compass"
          label="Explore"
        />
        <AnimatedTabButton
          active={activeTab === 'my-learning'}
          onPress={() => setActiveTab('my-learning')}
          icon="book"
          label="My Learning"
        />
      </View>

      {activeTab === 'browse' ? (
        <>
          {/* Stats Row */}
          <View className="flex-row items-center justify-between bg-[#F3E4C8] rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: SAFFRON }}>
                <Ionicons name="library" size={20} color="#ffffff" />
              </View>
              <View className="ml-3">
                <Text className="text-[#4A2E1C] text-lg font-bold">{filteredCourses.length}</Text>
                <Text className="text-[#8A5E44] text-xs">Courses Available</Text>
              </View>
            </View>
            <View className="h-10 w-px bg-[#E5D1AF]" />
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center">
                <Ionicons name="people" size={20} color="#ffffff" />
              </View>
              <View className="ml-3">
                <Text className="text-[#4A2E1C] text-lg font-bold">1.2K+</Text>
                <Text className="text-[#8A5E44] text-xs">Active Learners</Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-3">
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <Ionicons name="search" size={20} color="#9ca3af" />
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search courses, topics, instructors..."
              />
            </View>
          </View>

          {/* Filter Row */}
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="flex-row items-center bg-[#F9F0E6] px-4 py-2.5 rounded-xl border border-[#E8D5C4]"
              activeOpacity={0.7}
            >
              <Ionicons name="options" size={18} color={COPPER} />
              <Text className="text-[#8A5626] font-semibold ml-2">Filters</Text>
              {getActiveFilterCount() > 0 && (
                <View className="rounded-full w-5 h-5 items-center justify-center ml-2" style={{ backgroundColor: COPPER }}>
                  <Text className="text-white text-xs font-bold">{getActiveFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl">
              <Ionicons name="funnel" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm font-medium ml-1.5 capitalize">
                {activeFilters.sort?.replace('-', ' ')}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* My Learning Header */}
          <View className="bg-[#F3E4C8] rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: GOLD }}>
                <Ionicons name="trophy" size={24} color="#ffffff" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[#4A2E1C] text-lg font-bold">
                  {filteredEnrolledCourses.length} Course{filteredEnrolledCourses.length !== 1 ? 's' : ''} Enrolled
                </Text>
                <Text className="text-[#8A5E44] text-sm">Keep up the great work!</Text>
              </View>
            </View>
          </View>

          {/* Filter Chips */}
          <View className="flex-row mb-2">
            <FilterChip
              active={learningFilter === 'all'}
              onPress={() => setLearningFilter('all')}
              label="All Courses"
              icon="grid"
            />
            <FilterChip
              active={learningFilter === 'in-progress'}
              onPress={() => setLearningFilter('in-progress')}
              label="In Progress"
              icon="play-circle"
            />
            <FilterChip
              active={learningFilter === 'completed'}
              onPress={() => setLearningFilter('completed')}
              label="Completed"
              icon="checkmark-circle"
            />
          </View>
        </>
      )}
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 bg-[#F3E4C8] rounded-full items-center justify-center mb-4">
            <ActivityIndicator size="large" color={PRIMARY_BROWN} />
          </View>
          <Text className="text-gray-600 font-medium">Loading courses...</Text>
          <Text className="text-gray-400 text-sm mt-1">Preparing your learning experience</Text>
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
          ({ item, index }) => (
            <Animated.View 
              className="px-4"
              style={{
                opacity: headerFade,
              }}
            >
              <CourseCard course={item} onPress={handleCoursePress} />
            </Animated.View>
          ) :
          ({ item, index }) => (
            <EnrolledCourseCard
              item={item}
              index={index}
              onPress={() => {
                const courseId = (item.courseId || item.course)?._id;
                console.log('🎓 Navigating to course learn:', courseId);
                router.push(`/courses/${courseId}/learn`);
              }}
            />
          )
        }
        keyExtractor={(item) => 
          activeTab === 'browse' ? item._id : (item.courseId?._id || item.course?._id || item._id)
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={activeTab === 'browse' ? renderEmptyState : renderMyLearningEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_BROWN}
            colors={[PRIMARY_BROWN]}
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