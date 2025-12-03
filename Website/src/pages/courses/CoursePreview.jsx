import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService, { API_BASE_URL } from '../../services/api';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Play,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Globe,
  Award,
  Target,
  Layers,
  Video,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  IndianRupee,
  Calendar,
  GraduationCap,
  Edit3,
  Settings,
} from 'lucide-react';

const CoursePreview = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});

  // Helper to get full thumbnail URL
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${thumbnail}`;
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourseById(courseId, true);
      setCourse(response.data?.course || response.data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  // Calculate course stats
  const getStats = () => {
    const units = course?.structure?.units || [];
    let totalLessons = 0;
    let totalLectures = 0;
    let totalDuration = 0;

    units.forEach(unit => {
      totalLessons += unit.lessons?.length || 0;
      unit.lessons?.forEach(lesson => {
        totalLectures += lesson.lectures?.length || 0;
        lesson.lectures?.forEach(lecture => {
          totalDuration += lecture.content?.duration || 0;
        });
      });
    });

    return {
      totalUnits: units.length,
      totalLessons,
      totalLectures,
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sandalwood-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-sandalwood-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-sandalwood-900 mb-2">Error Loading Course</h2>
          <p className="text-sandalwood-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const pricing = course.pricing;
  const isFree = course.pricingType === 'free' || (!pricing?.oneTime?.amount && !pricing?.subscription?.monthly?.amount);

  return (
    <div className="min-h-screen bg-sandalwood-50">
      {/* Header */}
      <header className="bg-white border-b border-sandalwood-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-sandalwood-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-sandalwood-700" />
              </button>
              <div>
                <p className="text-sm text-sandalwood-500 font-medium">Course Preview</p>
                <h1 className="text-lg font-bold text-sandalwood-900 line-clamp-1">{course.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                course.publishing?.status === 'published' || course.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {course.publishing?.status === 'published' || course.isPublished ? 'Published' : 'Draft'}
              </span>
              <Link
                to={`/courses/${courseId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-xl hover:bg-sandalwood-200 transition-colors font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Link>
              <Link
                to={`/courses/${courseId}/manage`}
                className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-xl hover:bg-sandalwood-700 transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                Manage
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sandalwood-600 to-sandalwood-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.metadata?.category?.map((cat, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                  {course.metadata?.difficulty || 'Beginner'}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-sandalwood-100 mb-6 line-clamp-3">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sandalwood-200" />
                  <span>{course.stats?.enrollment?.total || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span>{course.stats?.ratings?.average?.toFixed(1) || 'N/A'} ({course.stats?.ratings?.count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sandalwood-200" />
                  <span>{formatDuration(stats.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sandalwood-200" />
                  <span className="capitalize">{course.metadata?.language?.instruction || 'English'}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {course.instructor?.name?.[0] || 'G'}
                </div>
                <div>
                  <p className="font-semibold">{course.instructor?.name || 'Instructor'}</p>
                  <p className="text-sm text-sandalwood-200">{course.instructor?.credentials || 'Course Instructor'}</p>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                {/* Thumbnail */}
                <div className="relative h-48 bg-sandalwood-200">
                  {course.thumbnail ? (
                    <img 
                      src={getThumbnailUrl(course.thumbnail)} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-sandalwood-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-sandalwood-700 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6">
                  <div className="mb-4">
                    {isFree ? (
                      <p className="text-3xl font-bold text-green-600">Free</p>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-sandalwood-900">
                          {formatCurrency(pricing?.oneTime?.amount || pricing?.subscription?.monthly?.amount || 0)}
                        </p>
                        {pricing?.subscription?.monthly?.amount && (
                          <p className="text-sm text-sandalwood-500">per month</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Course includes */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sandalwood-700">
                      <Layers className="w-5 h-5 text-sandalwood-500" />
                      <span>{stats.totalUnits} units</span>
                    </div>
                    <div className="flex items-center gap-3 text-sandalwood-700">
                      <BookOpen className="w-5 h-5 text-sandalwood-500" />
                      <span>{stats.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-3 text-sandalwood-700">
                      <Video className="w-5 h-5 text-sandalwood-500" />
                      <span>{stats.totalLectures} lectures</span>
                    </div>
                    <div className="flex items-center gap-3 text-sandalwood-700">
                      <Clock className="w-5 h-5 text-sandalwood-500" />
                      <span>{formatDuration(stats.totalDuration)} total</span>
                    </div>
                    <div className="flex items-center gap-3 text-sandalwood-700">
                      <Award className="w-5 h-5 text-sandalwood-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>

                  <p className="text-xs text-sandalwood-500 text-center">
                    This is how students will see your course
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.whatYoullLearn?.length > 0 && (
              <div className="bg-white rounded-2xl border border-sandalwood-100 p-6">
                <h2 className="text-xl font-bold text-sandalwood-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-sandalwood-600" />
                  What You'll Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.whatYoullLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sandalwood-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white rounded-2xl border border-sandalwood-100 overflow-hidden">
              <div className="p-6 border-b border-sandalwood-100">
                <h2 className="text-xl font-bold text-sandalwood-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sandalwood-600" />
                  Course Curriculum
                </h2>
                <p className="text-sandalwood-500 mt-1">
                  {stats.totalUnits} units • {stats.totalLessons} lessons • {stats.totalLectures} lectures • {formatDuration(stats.totalDuration)}
                </p>
              </div>

              <div className="divide-y divide-sandalwood-100">
                {course.structure?.units?.map((unit, unitIndex) => (
                  <div key={unit.unitId || unitIndex}>
                    <button
                      onClick={() => toggleUnit(unit.unitId || unitIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-sandalwood-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sandalwood-100 flex items-center justify-center text-sandalwood-700 font-semibold text-sm">
                          {unitIndex + 1}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sandalwood-900">{unit.title}</p>
                          <p className="text-sm text-sandalwood-500">
                            {unit.lessons?.length || 0} lessons
                          </p>
                        </div>
                      </div>
                      {expandedUnits[unit.unitId || unitIndex] ? (
                        <ChevronDown className="w-5 h-5 text-sandalwood-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-sandalwood-500" />
                      )}
                    </button>

                    {expandedUnits[unit.unitId || unitIndex] && unit.lessons?.length > 0 && (
                      <div className="bg-sandalwood-50/50 px-6 py-2">
                        {unit.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.lessonId || lessonIndex} className="py-3 border-b border-sandalwood-100 last:border-0">
                            <p className="font-medium text-sandalwood-800 mb-2">{lesson.title}</p>
                            {lesson.lectures?.map((lecture, lectureIndex) => (
                              <div key={lecture.lectureId || lectureIndex} className="flex items-center gap-3 py-2 pl-4">
                                {lecture.content?.type === 'video' ? (
                                  <Video className="w-4 h-4 text-sandalwood-400" />
                                ) : (
                                  <FileText className="w-4 h-4 text-sandalwood-400" />
                                )}
                                <span className="text-sm text-sandalwood-600 flex-1">{lecture.title}</span>
                                {lecture.content?.duration && (
                                  <span className="text-xs text-sandalwood-400">
                                    {formatDuration(Math.round(lecture.content.duration / 60))}
                                  </span>
                                )}
                                {lecture.isPreview && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {(!course.structure?.units || course.structure.units.length === 0) && (
                  <div className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-sandalwood-200 mx-auto mb-3" />
                    <p className="text-sandalwood-500">No content added yet</p>
                    <Link
                      to={`/courses/${courseId}/edit`}
                      className="inline-flex items-center gap-2 mt-4 text-sandalwood-600 hover:text-sandalwood-800 font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Add course content
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl border border-sandalwood-100 p-6">
                <h2 className="text-xl font-bold text-sandalwood-900 mb-4">About This Course</h2>
                <p className="text-sandalwood-700 whitespace-pre-line">{course.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl border border-sandalwood-100 p-6">
                <h3 className="font-bold text-sandalwood-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sandalwood-700">
                      <ChevronRight className="w-4 h-4 text-sandalwood-400 flex-shrink-0 mt-1" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {course.targetAudience?.length > 0 && (
              <div className="bg-white rounded-2xl border border-sandalwood-100 p-6">
                <h3 className="font-bold text-sandalwood-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-sandalwood-600" />
                  Who This Course Is For
                </h3>
                <ul className="space-y-2">
                  {course.targetAudience.map((audience, i) => (
                    <li key={i} className="flex items-start gap-2 text-sandalwood-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Info */}
            <div className="bg-white rounded-2xl border border-sandalwood-100 p-6">
              <h3 className="font-bold text-sandalwood-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-bold text-xl">
                  {course.instructor?.name?.[0] || 'G'}
                </div>
                <div>
                  <p className="font-semibold text-sandalwood-900">{course.instructor?.name}</p>
                  <p className="text-sm text-sandalwood-500">{course.instructor?.credentials}</p>
                </div>
              </div>
              {course.instructor?.bio && (
                <p className="text-sm text-sandalwood-600">{course.instructor.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
