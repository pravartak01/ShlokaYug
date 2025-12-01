/**
 * LearnPage Component
 * Main learning management page with course browsing and enrolled courses
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '../components/learn/CourseCard';
import FilterModal from '../components/learn/FilterModal';
import SearchBar from '../components/learn/SearchBar';
import EnrolledCourseCard from '../components/learn/EnrolledCourseCard';
import courseService from '../services/courseService';
import type { Course, CourseFilters, Enrollment } from '../services/courseService';

type TabType = 'browse' | 'my-learning';
type StatusFilter = 'all' | 'in-progress' | 'completed';

const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CourseFilters>({
    category: [],
    difficulty: [],
    priceType: 'all',
    sort: 'popular',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses for browse tab
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourses({ ...filters, search: searchQuery });
      // API returns {success: true, data: {courses: [...], pagination: {...}}}
      const coursesData = response.data?.courses || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getEnrolledCourses();
      console.log('📚 Enrolled Courses API Response:', response);
      console.log('📚 Response.data:', response.data);
      
      // API returns {success: true, data: {enrollments: [...]}}
      const enrolledData = response.data?.enrollments || [];
      console.log('📚 Extracted enrollments:', enrolledData);
      console.log('📚 Number of enrollments:', enrolledData.length);
      
      setEnrolledCourses(Array.isArray(enrolledData) ? enrolledData : []);
    } catch (err) {
      setError('Failed to load enrolled courses. Please try again.');
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'browse') {
      fetchCourses();
    } else {
      fetchEnrolledCourses();
    }
  }, [activeTab, fetchCourses, fetchEnrolledCourses]);

  // Check URL params on mount to handle navigation from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam === 'my-learning') {
      setActiveTab('my-learning');
      // Force refresh enrollments after a short delay to allow backend to process
      setTimeout(() => {
        fetchEnrolledCourses();
      }, 1000);
    }
  }, [fetchEnrolledCourses]);

  // Apply filters
  const handleApplyFilters = (newFilters: CourseFilters) => {
    setFilters(newFilters);
  };

  // Filter enrolled courses by status
  const getFilteredEnrolledCourses = () => {
    if (statusFilter === 'all') return enrolledCourses;

    return enrolledCourses.filter((enrollment) => {
      if (!enrollment.course || !enrollment.progress) return false;
      
      // Calculate total completed lectures across all sections
      const totalCompleted = enrollment.progress.sectionsProgress?.reduce(
        (sum, section) => sum + section.completedLectures.length,
        0
      ) || 0;
      
      // Calculate total lectures from course structure
      const totalLectures = enrollment.course.structure?.totalLectures || 0;
      const progressPercentage = totalLectures > 0 ? (totalCompleted / totalLectures) * 100 : 0;

      if (statusFilter === 'in-progress') {
        return progressPercentage > 0 && progressPercentage < 100;
      }
      if (statusFilter === 'completed') {
        return progressPercentage === 100;
      }
      return true;
    });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category.length > 0) count += filters.category.length;
    if (filters.difficulty && filters.difficulty.length > 0) count += filters.difficulty.length;
    if (filters.priceType && filters.priceType !== 'all') count += 1;
    if (filters.sort && filters.sort !== 'popular') count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const filteredEnrolled = getFilteredEnrolledCourses();

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-[#FFFEF7] border-b-2 border-[#D4C5A9] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-[#2C2416] text-4xl font-bold mb-6">Learn</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'browse'
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-white text-[#2C2416] border-2 border-[#D4C5A9] hover:border-[#8B0000]'
              }`}
            >
              Browse Courses
            </button>
            <button
              onClick={() => setActiveTab('my-learning')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'my-learning'
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-white text-[#2C2416] border-2 border-[#D4C5A9] hover:border-[#8B0000]'
              }`}
            >
              My Learning
            </button>
          </div>

          {/* Search and Filters - Browse Tab */}
          {activeTab === 'browse' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search courses..." />
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className="relative px-6 py-4 bg-white border-2 border-[#D4C5A9] text-[#2C2416] rounded-xl font-semibold hover:border-[#8B0000] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B0000] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Status Filters - My Learning Tab */}
          {activeTab === 'my-learning' && (
            <div className="flex gap-3 items-center">
              <div className="flex gap-3">
                {(['all', 'in-progress', 'completed'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                      statusFilter === status
                        ? 'bg-[#8B0000] text-white'
                        : 'bg-white text-[#2C2416] border-2 border-[#D4C5A9] hover:border-[#8B0000]'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : 'Completed'}
                  </button>
                ))}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  console.log('🔄 Manually refreshing enrolled courses...');
                  fetchEnrolledCourses();
                }}
                disabled={loading}
                className="px-4 py-2 bg-white border-2 border-[#D4C5A9] text-[#2C2416] rounded-lg font-semibold hover:border-[#8B0000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh enrolled courses"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#D4C5A9] border-t-[#8B0000] rounded-full animate-spin mx-auto" />
                <p className="text-[#6B5D4F] text-lg">Loading courses...</p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center"
            >
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-bold text-xl mb-2">Oops!</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => (activeTab === 'browse' ? fetchCourses() : fetchEnrolledCourses())}
                className="bg-[#8B0000] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Browse Courses Content */}
          {!loading && !error && activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {courses.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-24 h-24 text-[#D4C5A9] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-[#2C2416] font-bold text-2xl mb-2">No courses found</h3>
                  <p className="text-[#6B5D4F] mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ category: [], difficulty: [], priceType: 'all', sort: 'popular' });
                    }}
                    className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-[#6B5D4F]">
                    Found <span className="font-bold text-[#2C2416]">{courses.length}</span> courses
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        onClick={() => navigate(`/course/${course._id}`)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* My Learning Content */}
          {!loading && !error && activeTab === 'my-learning' && (
            <motion.div
              key="my-learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredEnrolled.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-24 h-24 text-[#D4C5A9] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-[#2C2416] font-bold text-2xl mb-2">
                    {statusFilter === 'all' ? 'No enrolled courses yet' : `No ${statusFilter.replace('-', ' ')} courses`}
                  </h3>
                  <p className="text-[#6B5D4F] mb-6">
                    {statusFilter === 'all'
                      ? 'Start your learning journey by browsing our courses'
                      : 'Try selecting a different status filter'}
                  </p>
                  {statusFilter === 'all' && (
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors"
                    >
                      Browse Courses
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-6 text-[#6B5D4F]">
                    {filteredEnrolled.length} {statusFilter === 'all' ? 'enrolled' : statusFilter.replace('-', ' ')} course
                    {filteredEnrolled.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnrolled.map((enrollment) => {
                      // Use courseId as fallback key if course is a string
                      const courseData = enrollment.course || enrollment.courseId;
                      const key = typeof courseData === 'string' 
                        ? courseData
                        : courseData?._id || enrollment._id;
                      
                      console.log('🔑 Enrollment Key:', key, 'Course:', courseData);
                      
                      return (
                        <EnrolledCourseCard
                          key={key}
                          enrollment={enrollment}
                          onClick={() => {
                            const courseId = typeof courseData === 'string' 
                              ? courseData
                              : courseData?._id;
                            if (courseId) {
                              navigate(`/course/${courseId}/learn`);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default LearnPage;