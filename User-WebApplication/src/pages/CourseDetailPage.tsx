/**
 * CourseDetailPage Component
 * Displays detailed information about a course and allows enrollment
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Users, Star, PlayCircle, Award, Download } from 'lucide-react';
import courseService, { type Course } from '../services/courseService';
import { initiatePayment } from '../services/razorpay';
import VideoPlayer from '../components/learn/VideoPlayer';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
    }
  }, [id]);

  const fetchCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourseById(courseId);
      // Backend returns {success: true, data: {course: {...}, userAccess: {...}}}
      const courseData = response.data?.course || response.data;
      setCourse(courseData);
      console.log('📚 Course Data:', courseData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load course details');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    setEnrolling(true);
    try {
      const coursePrice = course.pricing?.oneTime?.amount || 0;
      
      if (coursePrice === 0) {
        // Free course - direct enrollment
        const response = await courseService.enrollInCourse(course._id);
        if (response.success) {
          alert('🎉 Successfully enrolled! Redirecting to your learning page...');
          navigate('/learn?tab=my-learning');
        }
      } else {
        // Paid course - initiate payment
        await initiatePayment(
          course._id,
          coursePrice,
          course.title,
          async (paymentId) => {
            console.log('✅ Payment successful, payment ID:', paymentId);
            console.log('⏳ Waiting for backend to process enrollment...');
            
            // Wait longer for backend to process enrollment (increased from 1.5s to 3s)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verify enrollment was created
            try {
              console.log('🔍 Checking enrollments after payment...');
              const enrollments = await courseService.getEnrolledCourses();
              console.log('📚 Full enrollments response:', JSON.stringify(enrollments, null, 2));
              console.log('📚 Enrollments array:', enrollments.data?.enrollments);
              console.log('📚 Number of enrollments:', enrollments.data?.enrollments?.length);
              
              const isEnrolled = enrollments.data?.enrollments?.some(
                (e: any) => {
                  const eCourseId = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id;
                  console.log('  Checking enrollment:', eCourseId, 'vs', course._id);
                  return eCourseId === course._id;
                }
              );
              
              console.log('✅ Is enrolled:', isEnrolled);
              
              if (isEnrolled) {
                alert('🎉 Payment successful! You are now enrolled. Redirecting to your learning page...');
                navigate('/learn?tab=my-learning');
              } else {
                console.warn('⚠️ Enrollment not found after 3s, retrying in 3s...');
                // Wait longer and try again (increased from 2s to 3s)
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Second attempt
                const enrollments2 = await courseService.getEnrolledCourses();
                console.log('📚 Second check - enrollments:', enrollments2.data?.enrollments?.length);
                
                const isEnrolled2 = enrollments2.data?.enrollments?.some(
                  (e: any) => {
                    const eCourseId = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id;
                    return eCourseId === course._id;
                  }
                );
                
                if (isEnrolled2) {
                  alert('🎉 Payment successful! You are now enrolled. Redirecting to your learning page...');
                } else {
                  alert('🎉 Payment successful! Your enrollment is being processed. Please click "Refresh" in My Learning tab.');
                }
                navigate('/learn?tab=my-learning');
              }
            } catch (err) {
              console.error('❌ Error checking enrollment:', err);
              alert('🎉 Payment successful! Please click "Refresh" in My Learning tab to see your enrollment.');
              navigate('/learn?tab=my-learning');
            }
          },
          (error) => {
            alert(`❌ Payment failed: ${error.message}`);
          }
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to enroll in course';
      alert(`❌ ${errorMessage}`);
      console.error('Enrollment error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handlePreviewLecture = (lecture: any) => {
    setSelectedLecture(lecture);
    setShowVideo(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#2C2416] mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const difficulty = course.metadata?.difficulty || 'beginner';
  const rating = course.stats?.ratings?.average || 0;
  const reviews = course.stats?.ratings?.count || 0;
  const enrollments = course.stats?.enrollment?.total || 0;
  const totalLessons = course.structure?.totalLessons || 0;
  const totalLectures = course.structure?.totalLectures || 0;
  const totalDuration = course.structure?.totalDuration || 0;
  const thumbnail = course.metadata?.thumbnail || course.thumbnail;
  const price = course.pricing?.oneTime?.amount || 0;
  const currency = course.pricing?.oneTime?.currency || 'INR';
  const isFree = price === 0;
  
  console.log('💰 Pricing:', { price, currency, isFree, fullPricing: course.pricing });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4C5A9]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-[#2C2416] hover:text-[#8B0000] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-[#D4C5A9] overflow-hidden mb-6"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-64 bg-gradient-to-br from-[#8B0000] to-[#D4A574]">
                {thumbnail ? (
                  <img src={thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen size={64} className="text-white/50" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Title & Difficulty */}
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-[#2C2416] flex-1">{course.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(difficulty)} ml-4`}>
                    {difficulty}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-[#5C5447] mb-4">
                  {rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="font-semibold text-[#2C2416]">{rating.toFixed(1)}</span>
                      <span>({reviews} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{enrollments.toLocaleString()} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{totalLessons} lessons • {totalLectures} lectures</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatDuration(totalDuration)} total</span>
                  </div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="flex items-center gap-3 pt-4 border-t border-[#D4C5A9]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B0000] to-[#D4A574] flex items-center justify-center text-white font-semibold">
                      {course.instructor.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <p className="text-sm text-[#5C5447]">Instructor</p>
                      <p className="font-semibold text-[#2C2416]">{course.instructor.name || 'Guru'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-[#D4C5A9] p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-[#2C2416] mb-4">About This Course</h2>
              <p className="text-[#5C5447] leading-relaxed whitespace-pre-line">
                {course.description || 'No description available.'}
              </p>
            </motion.div>

            {/* Curriculum */}
            {course.structure?.units && course.structure.units.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-[#D4C5A9] p-6"
              >
                <h2 className="text-xl font-bold text-[#2C2416] mb-4">Course Curriculum</h2>
                <div className="mb-4 text-sm text-[#5C5447]">
                  {course.structure.totalUnits} Units • {totalLessons} Lessons • {totalLectures} Lectures
                </div>
                <div className="space-y-4">
                  {course.structure.units.map((unit, idx) => (
                    <div key={unit.unitId || idx} className="border border-[#D4C5A9] rounded-lg overflow-hidden">
                      {/* Unit Header */}
                      <div className="bg-[#F5F1E8] px-4 py-3 border-b border-[#D4C5A9]">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-[#2C2416] text-lg">Unit {unit.order}: {unit.title}</h3>
                            {unit.description && (
                              <p className="text-sm text-[#5C5447] mt-1">{unit.description}</p>
                            )}
                          </div>
                          <div className="text-sm text-[#5C5447] whitespace-nowrap ml-4">
                            {unit.lessons?.length || 0} lessons • {unit.estimatedDuration || 0}m
                          </div>
                        </div>
                      </div>
                      
                      {/* Lessons */}
                      {unit.lessons && unit.lessons.length > 0 && (
                        <div className="divide-y divide-[#D4C5A9]">
                          {unit.lessons.map((lesson, lIdx) => (
                            <div key={lesson.lessonId || lIdx} className="bg-white">
                              {/* Lesson Header */}
                              <div className="px-4 py-3 hover:bg-[#F9F5ED] transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <BookOpen size={18} className="text-[#8B0000] mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-[#2C2416]">Lesson {lesson.order}: {lesson.title}</h4>
                                      {lesson.description && (
                                        <p className="text-sm text-[#5C5447] mt-1">{lesson.description}</p>
                                      )}
                                      {/* Lectures Preview */}
                                      {lesson.lectures && lesson.lectures.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {lesson.lectures.slice(0, 3).map((lecture, lectIdx) => (
                                            <div key={lecture.lectureId || lectIdx} className="flex items-center gap-2 text-sm text-[#5C5447] pl-4">
                                              <PlayCircle size={14} className="text-[#8B0000]" />
                                              <span>{lecture.title}</span>
                                              {lecture.content?.duration && (
                                                <span className="ml-auto">• {lecture.content.duration}m</span>
                                              )}
                                            </div>
                                          ))}
                                          {lesson.lectures.length > 3 && (
                                            <div className="text-sm text-[#8B0000] pl-4">+ {lesson.lectures.length - 3} more lectures</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm text-[#5C5447] whitespace-nowrap ml-4">
                                    {lesson.lectures?.length || 0} lectures
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-[#D4C5A9] p-6 sticky top-6"
            >
              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-[#8B0000] mb-2">
                  {isFree ? 'Free Course' : `₹${price.toLocaleString('en-IN')}`}
                </div>
                {!isFree && (
                  <p className="text-sm text-[#5C5447]">One-time payment • {currency}</p>
                )}
                {isFree && (
                  <p className="text-sm text-green-600 font-medium">Enroll for free and start learning</p>
                )}
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-[#8B0000] text-white py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg"
              >
                {enrolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  isFree ? 'Enroll for Free' : 'Enroll Now'
                )}
              </button>

              {/* What's Included */}
              <div className="space-y-3 border-t border-[#D4C5A9] pt-6">
                <h3 className="font-semibold text-[#2C2416] mb-4">This course includes:</h3>
                <div className="flex items-center gap-3 text-[#5C5447]">
                  <Clock size={20} className="text-[#8B0000] flex-shrink-0" />
                  <span>{formatDuration(totalDuration)} of on-demand video content</span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5447]">
                  <BookOpen size={20} className="text-[#8B0000] flex-shrink-0" />
                  <span>{totalLessons} lessons with {totalLectures} lectures</span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5447]">
                  <Download size={20} className="text-[#8B0000] flex-shrink-0" />
                  <span>Downloadable resources and materials</span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5447]">
                  <Award size={20} className="text-[#8B0000] flex-shrink-0" />
                  <span>Certificate upon completion</span>
                </div>
                <div className="flex items-center gap-3 text-[#5C5447]">
                  <PlayCircle size={20} className="text-[#8B0000] flex-shrink-0" />
                  <span>Full lifetime access</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && selectedLecture && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden">
            <div className="p-4 border-b border-[#D4C5A9] flex items-center justify-between">
              <h3 className="font-semibold text-[#2C2416]">{selectedLecture.title}</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="text-[#5C5447] hover:text-[#2C2416]"
              >
                Close
              </button>
            </div>
            <VideoPlayer
              videoUrl={selectedLecture.videoUrl}
              onComplete={() => setShowVideo(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
