/**
 * Course Learning Page
 * Interface for watching course videos and accessing materials
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import courseService, { type Course, type Enrollment } from '../services/courseService';
import VideoPlayer from '../components/learn/VideoPlayer';

interface Lecture {
  lectureId: string;
  title: string;
  description?: string;
  order: number;
  content?: {
    videoUrl?: string;
    audioUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    materials?: Array<{
      type: 'pdf' | 'audio' | 'image' | 'text' | 'link';
      title: string;
      url: string;
      downloadable: boolean;
    }>;
    shlokaIds?: string[];
    transcript?: string;
    keyPoints?: string[];
  };
  metadata?: {
    difficulty?: string;
    tags?: string[];
    isFree?: boolean;
  };
}

interface Lesson {
  lessonId: string;
  title: string;
  description?: string;
  order: number;
  estimatedDuration?: number;
  lectures?: Lecture[];
}

interface Unit {
  unitId: string;
  title: string;
  description?: string;
  order: number;
  estimatedDuration?: number;
  lessons?: Lesson[];
}

const CourseLearningPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details with full content
      const courseResponse = await courseService.getCourseById(id!);
      const courseData = courseResponse.data?.course || courseResponse.data;
      setCourse(courseData);
      
      console.log('📚 Full Course data:', courseData);

      // Fetch enrollment to check progress
      const enrollmentsResponse = await courseService.getEnrolledCourses();
      console.log('📚 Enrollments response:', enrollmentsResponse);
      const enrollments = enrollmentsResponse.data?.enrollments || [];
      console.log('📚 Total enrollments:', enrollments.length);
      
      const currentEnrollment = enrollments.find((e: Enrollment) => {
        const courseId = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id;
        return courseId === id;
      });
      
      console.log('📚 Current enrollment:', currentEnrollment);
      console.log('📊 Current progress:', currentEnrollment?.progress);
      console.log('📊 Lectures completed:', currentEnrollment?.progress?.lecturesCompleted?.length);
      console.log('📊 Completion percentage:', currentEnrollment?.progress?.completionPercentage);
      
      setEnrollment(currentEnrollment || null);

      // Set first lecture or last accessed lecture as current
      if (courseData?.structure?.units?.length > 0) {
        const firstUnit = courseData.structure.units[0];
        const firstLesson = firstUnit.lessons?.[0];
        const firstLecture = firstLesson?.lectures?.[0];

        if (currentEnrollment?.progress?.lastAccessedLecture && firstLecture) {
          // Find last accessed lecture
          const lastLecture = findLectureById(
            courseData.structure.units,
            currentEnrollment.progress.lastAccessedLecture
          );
          setCurrentLecture(lastLecture || firstLecture);
        } else if (firstLecture) {
          setCurrentLecture(firstLecture);
        }

        // Expand first unit and lesson by default
        if (firstUnit.unitId) {
          setExpandedUnits(new Set([firstUnit.unitId]));
        }
        if (firstLesson?.lessonId) {
          setExpandedLessons(new Set([firstLesson.lessonId]));
        }
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const findLectureById = (units: Course['structure']['units'], lectureId: string): Lecture | null => {
    if (!units) return null;
    for (const unit of units) {
      for (const lesson of unit.lessons || []) {
        const lecture = lesson.lectures?.find((l) => l.lectureId === lectureId);
        if (lecture) return lecture;
      }
    }
    return null;
  };

  const handleLectureComplete = async () => {
    if (!currentLecture || !id) return;

    try {
      console.log('📝 Marking lecture complete:', currentLecture.lectureId);
      
      // Make API call first
      const response = await courseService.markLectureComplete(id, currentLecture.lectureId);
      console.log('✅ API Response:', response);
      console.log('✅ Progress from API:', response.data?.progress);
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      // Refresh enrollment data from server to get accurate progress with updated percentages
      console.log('🔄 Refreshing enrollment data...');
      const enrollmentsResponse = await courseService.getEnrolledCourses();
      console.log('📚 Fresh enrollments response:', enrollmentsResponse);
      
      const enrollments = enrollmentsResponse.data?.enrollments || [];
      const updatedEnrollment = enrollments.find((e: Enrollment) => {
        const courseId = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id;
        return courseId === id;
      });
      
      console.log('📊 Updated enrollment:', updatedEnrollment);
      console.log('📊 Updated progress:', updatedEnrollment?.progress);
      console.log('📊 Completion %:', updatedEnrollment?.progress?.completionPercentage);
      
      if (updatedEnrollment) {
        setEnrollment(updatedEnrollment);
      } else {
        // Fallback to full refresh if enrollment not found
        await fetchCourseData();
      }
    } catch (error) {
      console.error('❌ Error marking lecture complete:', error);
      // Refresh data on error
      await fetchCourseData();
    }
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const isLectureCompleted = (lectureId: string): boolean => {
    return enrollment?.progress?.lecturesCompleted?.includes(lectureId) || false;
  };

  const isUnitCompleted = (unit: Unit): boolean => {
    if (!unit.lessons) return false;
    const totalLectures = unit.lessons.reduce((acc: number, lesson: Lesson) => acc + (lesson.lectures?.length || 0), 0);
    const completedLectures = unit.lessons.reduce((acc: number, lesson: Lesson) => {
      return acc + (lesson.lectures?.filter((l: Lecture) => isLectureCompleted(l.lectureId)).length || 0);
    }, 0);
    return totalLectures > 0 && totalLectures === completedLectures;
  };

  const isLessonCompleted = (lesson: Lesson): boolean => {
    if (!lesson.lectures || lesson.lectures.length === 0) return false;
    return lesson.lectures.every((l: Lecture) => isLectureCompleted(l.lectureId));
  };

  const getUnitProgress = (unit: Unit): number => {
    if (!unit.lessons) return 0;
    const totalLectures = unit.lessons.reduce((acc: number, lesson: Lesson) => acc + (lesson.lectures?.length || 0), 0);
    const completedLectures = unit.lessons.reduce((acc: number, lesson: Lesson) => {
      return acc + (lesson.lectures?.filter((l: Lecture) => isLectureCompleted(l.lectureId)).length || 0);
    }, 0);
    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  };

  const getLessonProgress = (lesson: Lesson): number => {
    if (!lesson.lectures || lesson.lectures.length === 0) return 0;
    const completed = lesson.lectures.filter((l: Lecture) => isLectureCompleted(l.lectureId)).length;
    return Math.round((completed / lesson.lectures.length) * 100);
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
  };

  const goToNextLecture = () => {
    if (!course?.structure?.units || !currentLecture) return;
    
    let foundCurrent = false;
    for (const unit of course.structure.units) {
      for (const lesson of unit.lessons || []) {
        for (const lecture of lesson.lectures || []) {
          if (foundCurrent) {
            setCurrentLecture(lecture);
            return;
          }
          if (lecture.lectureId === currentLecture.lectureId) {
            foundCurrent = true;
          }
        }
      }
    }
  };

  const goToPreviousLecture = () => {
    if (!course?.structure?.units || !currentLecture) return;
    
    let previousLecture: Lecture | null = null;
    for (const unit of course.structure.units) {
      for (const lesson of unit.lessons || []) {
        for (const lecture of lesson.lectures || []) {
          if (lecture.lectureId === currentLecture.lectureId && previousLecture) {
            setCurrentLecture(previousLecture);
            return;
          }
          previousLecture = lecture;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2416] mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000]"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Lecture Completed!</p>
              <p className="text-sm opacity-90">Progress updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b-2 border-[#D4C5A9] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate('/learn')}
            className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
            aria-label="Back to Learn"
          >
            <svg className="w-6 h-6 text-[#2C2416]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#2C2416] line-clamp-1">{course.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8B0000] to-[#B22222] transition-all duration-300"
                    style={{ width: `${enrollment?.progress?.completionPercentage || 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#8B0000]">
                  {enrollment?.progress?.completionPercentage || 0}%
                </span>
              </div>
              <span className="text-sm text-[#6B5D4F]">
                {enrollment?.progress?.lecturesCompleted?.length || 0} / {
                  course?.structure?.units?.reduce((acc, unit) => 
                    acc + (unit.lessons?.reduce((sum, lesson) => sum + (lesson.lectures?.length || 0), 0) || 0), 0
                  ) || 0
                } lectures completed
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showNotes ? 'bg-[#8B0000] text-white' : 'bg-[#F5F1E8] text-[#2C2416] hover:bg-[#E8DCC4]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium">Notes</span>
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-[#2C2416]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Section */}
        <main className={`flex-1 overflow-y-auto ${sidebarOpen ? 'lg:mr-96' : ''}`}>
          <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Video Player */}
            {currentLecture ? (
              <>
                {currentLecture.content?.videoUrl ? (
                  <div className="bg-black rounded-xl overflow-hidden shadow-2xl relative">
                    <VideoPlayer
                      src={currentLecture.content.videoUrl}
                      poster={currentLecture.content.thumbnailUrl}
                      onComplete={handleLectureComplete}
                      onProgress={handleVideoProgress}
                    />
                    
                    {/* Video Progress Indicator */}
                    {videoProgress > 0 && videoProgress < 100 && (
                      <div className="absolute top-4 right-4 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
                        {Math.round(videoProgress)}% watched
                      </div>
                    )}
                  </div>
                ) : currentLecture.content?.audioUrl ? (
                  /* Audio player fallback */
                  <div className="bg-white rounded-xl p-8 border-2 border-[#D4C5A9]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#8B0000] rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2C2416] mb-1">Audio Lecture</h3>
                        <p className="text-sm text-[#6B5D4F]">{currentLecture.title}</p>
                      </div>
                    </div>
                    <audio
                      controls
                      className="w-full"
                      src={currentLecture.content.audioUrl}
                      onEnded={handleLectureComplete}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="bg-[#2C2416] aspect-video rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <p className="text-lg">No video or audio available for this lecture</p>
                      <p className="text-sm opacity-75 mt-2">Check the materials section below for other resources</p>
                    </div>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={goToPreviousLecture}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#D4C5A9] rounded-lg hover:border-[#8B0000] transition-colors text-[#2C2416] font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <button
                    onClick={handleLectureComplete}
                    disabled={isLectureCompleted(currentLecture.lectureId)}
                    className={`flex-1 max-w-xs px-6 py-3 rounded-lg font-semibold transition-all ${
                      isLectureCompleted(currentLecture.lectureId)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-[#8B0000] text-white hover:bg-[#6B0000] hover:shadow-lg'
                    }`}
                  >
                    {isLectureCompleted(currentLecture.lectureId) ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                  
                  <button
                    onClick={goToNextLecture}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#D4C5A9] rounded-lg hover:border-[#8B0000] transition-colors text-[#2C2416] font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Lecture Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 border-2 border-[#D4C5A9] space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-[#2C2416]">{currentLecture.title}</h2>
                        {isLectureCompleted(currentLecture.lectureId) && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                      {currentLecture.description && (
                        <p className="text-[#6B5D4F]">{currentLecture.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Key Points */}
                  {currentLecture.content?.keyPoints && currentLecture.content.keyPoints.length > 0 && (
                    <div className="pt-4 border-t border-[#D4C5A9]">
                      <h3 className="font-semibold text-[#2C2416] mb-3">Key Points</h3>
                      <ul className="space-y-2">
                        {currentLecture.content.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-[#6B5D4F]">
                            <span className="text-[#8B0000] mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Materials */}
                  {currentLecture.content?.materials && currentLecture.content.materials.length > 0 && (
                    <div className="pt-4 border-t border-[#D4C5A9]">
                      <h3 className="font-semibold text-[#2C2416] mb-3">Course Materials</h3>
                      <div className="grid gap-3">
                        {currentLecture.content.materials.map((material, index) => (
                          <a
                            key={index}
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={material.downloadable}
                            className="flex items-center justify-between p-4 bg-[#F5F1E8] border border-[#D4C5A9] rounded-lg hover:border-[#8B0000] transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#D4C5A9]">
                                {material.type === 'pdf' && (
                                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {material.type === 'audio' && (
                                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                  </svg>
                                )}
                                {material.type === 'image' && (
                                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {material.type === 'link' && (
                                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {material.type === 'text' && (
                                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-[#2C2416]">{material.title}</p>
                                <p className="text-sm text-[#6B5D4F] uppercase">{material.type}</p>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-[#6B5D4F] group-hover:text-[#8B0000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transcript */}
                  {currentLecture.content?.transcript && (
                    <div className="pt-4 border-t border-[#D4C5A9]">
                      <h3 className="font-semibold text-[#2C2416] mb-3">Transcript</h3>
                      <p className="text-[#6B5D4F] whitespace-pre-wrap">{currentLecture.content.transcript}</p>
                    </div>
                  )}
                </motion.div>

                {/* Notes Section */}
                {showNotes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl p-6 border-2 border-[#D4C5A9]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#2C2416] flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8B0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        My Notes
                      </h3>
                      <span className="text-sm text-[#6B5D4F]">Auto-saved</span>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes while watching..."
                      className="w-full h-32 p-4 border-2 border-[#D4C5A9] rounded-lg resize-none focus:outline-none focus:border-[#8B0000] transition-colors"
                    />
                  </motion.div>
                )}
              </>
            ) : (
              /* No lecture selected message */
              <div className="bg-[#FFFEF7] border-2 border-[#D4C5A9] rounded-xl p-8 text-center">
                <svg className="w-20 h-20 mx-auto mb-4 text-[#8B0000] opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <h2 className="text-2xl font-bold text-[#2C2416] mb-2">Select a Lecture to Start Learning</h2>
                <p className="text-[#6B5D4F]">
                  Choose a lecture from the curriculum sidebar to begin watching videos and accessing materials.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Course Curriculum Sidebar */}
        <aside
          className={`fixed lg:fixed right-0 top-[73px] bottom-0 w-96 bg-white border-l-2 border-[#D4C5A9] overflow-y-auto transition-transform shadow-xl ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2C2416]">Course Content</h2>
              <button
                onClick={() => {
                  const allUnitIds = course?.structure?.units?.map(u => u.unitId) || [];
                  const allLessonIds = course?.structure?.units?.flatMap(u => 
                    u.lessons?.map(l => l.lessonId) || []
                  ) || [];
                  
                  if (expandedUnits.size === allUnitIds.length) {
                    setExpandedUnits(new Set());
                    setExpandedLessons(new Set());
                  } else {
                    setExpandedUnits(new Set(allUnitIds));
                    setExpandedLessons(new Set(allLessonIds));
                  }
                }}
                className="text-sm text-[#8B0000] hover:underline font-medium"
              >
                {expandedUnits.size > 0 ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            {course?.structure?.units && course.structure.units.length > 0 ? (
              <div className="space-y-3">
                {course.structure.units.map((unit, unitIndex) => {
                  const unitId = unit.unitId;
                  const unitProgress = getUnitProgress(unit);
                  const isCompleted = isUnitCompleted(unit);
                  
                  return (
                    <div key={unitId} className={`border-2 rounded-xl overflow-hidden transition-all ${
                      isCompleted ? 'border-green-500 bg-green-50' : 'border-[#D4C5A9] bg-white'
                    }`}>
                      {/* Unit Header */}
                      <button
                        onClick={() => toggleUnit(unitId)}
                        className="w-full px-4 py-4 hover:bg-[#F5F1E8] transition-colors flex items-start justify-between text-left gap-3"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                            isCompleted ? 'bg-green-500' : 'bg-[#8B0000]'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span>{unitIndex + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#2C2416] mb-1">Unit {unitIndex + 1}: {unit.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    isCompleted ? 'bg-green-500' : 'bg-[#8B0000]'
                                  }`}
                                  style={{ width: `${unitProgress}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold ${
                                isCompleted ? 'text-green-600' : 'text-[#8B0000]'
                              }`}>
                                {unitProgress}%
                              </span>
                            </div>
                            <p className="text-sm text-[#6B5D4F]">
                              {unit.lessons?.length || 0} lessons • {
                                unit.lessons?.reduce((acc, lesson) => acc + (lesson.lectures?.length || 0), 0) || 0
                              } lectures
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-[#2C2416] transition-transform flex-shrink-0 mt-2 ${
                            expandedUnits.has(unitId) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Lessons */}
                      {expandedUnits.has(unitId) && unit.lessons && (
                        <div className="bg-white">
                          {unit.lessons.map((lesson, lessonIndex) => {
                            const lessonId = lesson.lessonId;
                            const lessonProgress = getLessonProgress(lesson);
                            const lessonCompleted = isLessonCompleted(lesson);
                            
                            return (
                              <div key={lessonId} className="border-t-2 border-[#D4C5A9]">
                                {/* Lesson Header */}
                                <button
                                  onClick={() => toggleLesson(lessonId)}
                                  className="w-full px-4 py-3 hover:bg-[#FFFEF7] transition-colors flex items-center gap-3 text-left"
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    lessonCompleted ? 'bg-green-500 text-white' : 'bg-[#F5F1E8] text-[#8B0000]'
                                  }`}>
                                    {lessonCompleted ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <span>{lessonIndex + 1}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-[#2C2416]">
                                        Lesson {lessonIndex + 1}: {lesson.title}
                                      </span>
                                      {lessonCompleted && (
                                        <span className="text-xs text-green-600 font-medium">✓</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-300 ${
                                            lessonCompleted ? 'bg-green-500' : 'bg-[#8B0000]'
                                          }`}
                                          style={{ width: `${lessonProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-[#6B5D4F]">
                                        {lesson.lectures?.filter(l => isLectureCompleted(l.lectureId)).length || 0}/{lesson.lectures?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                  <svg
                                    className={`w-4 h-4 text-[#6B5D4F] transition-transform flex-shrink-0 ${
                                      expandedLessons.has(lessonId) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>

                                {/* Lectures */}
                                {expandedLessons.has(lessonId) && lesson.lectures && (
                                  <div className="bg-[#FFFEF7]">
                                    {lesson.lectures.map((lecture) => {
                                      const isActive = currentLecture?.lectureId === lecture.lectureId;
                                      const isCompleted = isLectureCompleted(lecture.lectureId);

                                      return (
                                        <button
                                          key={lecture.lectureId}
                                          onClick={() => setCurrentLecture(lecture)}
                                          className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-white transition-colors text-left ${
                                            isActive ? 'bg-[#8B0000]/10 border-l-4 border-[#8B0000]' : ''
                                          }`}
                                        >
                                          {/* Play/Check Icon */}
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                              isCompleted ? 'bg-green-500' : 'bg-[#D4C5A9]'
                                            }`}
                                          >
                                            {isCompleted ? (
                                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            ) : (
                                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                              </svg>
                                            )}
                                          </div>

                                          {/* Lecture Info */}
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isActive ? 'text-[#8B0000]' : 'text-[#2C2416]'}`}>
                                              {lecture.title}
                                            </p>
                                            {lecture.content?.duration && (
                                              <p className="text-xs text-[#6B5D4F]">
                                                {Math.floor(lecture.content.duration / 60)}:{String(lecture.content.duration % 60).padStart(2, '0')}
                                              </p>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#6B5D4F] text-center">No curriculum available</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseLearningPage;
