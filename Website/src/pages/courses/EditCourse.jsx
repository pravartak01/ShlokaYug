import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiService, { API_BASE_URL } from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Save,
  Eye,
  X,
  Loader2,
  GripVertical,
  Play,
  Clock,
  Settings,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowLeft,
  Sparkles,
  Layers,
  Target,
  Users,
  DollarSign,
  Globe,
  BarChart3,
  Award,
  PenLine,
  Info,
  Zap,
  GraduationCap,
  ExternalLink,
  MoreHorizontal,
  FolderPlus,
  FilePlus,
  PlayCircle,
} from 'lucide-react';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [activeTab, setActiveTab] = useState('structure');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Modals
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourseById(id, true);
      setCourse(response.data.course);
      if (response.data.course?.thumbnail) {
        // Handle both full URLs and relative paths
        const thumb = response.data.course.thumbnail;
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        setThumbnailPreview(thumb.startsWith('http') ? thumb : `${baseUrl}${thumb}`);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId) => setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  const toggleLesson = (lessonId) => setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);

      // Upload immediately
      const formData = new FormData();
      formData.append('thumbnail', file);
      try {
        await apiService.uploadCourseThumbnail(id, formData);
        setSuccess('Thumbnail updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to upload thumbnail');
      }
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);
      await apiService.publishCourse(id);
      setSuccess('Course published successfully!');
      fetchCourse();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = () => {
    if (!course) return false;
    return course.title && course.description && course.structure?.units?.length > 0 && course.structure.units.some((u) => u.lessons?.length > 0);
  };

  const getPublishRequirements = () => {
    const requirements = [
      { label: 'Course title', met: !!course?.title, icon: PenLine },
      { label: 'Course description', met: !!course?.description, icon: FileText },
      { label: 'At least one unit', met: course?.structure?.units?.length > 0, icon: Layers },
      { label: 'At least one lesson', met: course?.structure?.units?.some((u) => u.lessons?.length > 0), icon: Target },
    ];
    return requirements;
  };

  const stats = {
    units: course?.structure?.units?.length || 0,
    lessons: course?.structure?.units?.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || 0,
    lectures: course?.structure?.units?.reduce((acc, u) => acc + (u.lessons?.reduce((lacc, l) => lacc + (l.lectures?.length || 0), 0) || 0), 0) || 0,
    totalDuration: course?.structure?.units?.reduce((acc, u) => acc + (u.lessons?.reduce((lacc, l) => lacc + (l.lectures?.reduce((lecAcc, lec) => lecAcc + (lec.duration?.minutes || 0), 0) || 0), 0) || 0), 0) || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-sandalwood-900 mb-2">Course Not Found</h2>
          <p className="text-sandalwood-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="px-6 py-3 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* Header */}
      <header className="bg-white border-b border-sandalwood-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/courses" className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center hover:bg-sandalwood-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-sandalwood-700" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-sandalwood-900 line-clamp-1">{course.title}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {course.publishing?.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle2 className="w-3 h-3" />Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      <Edit3 className="w-3 h-3" />Draft
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-sandalwood-100 text-sandalwood-700 rounded-xl font-medium hover:bg-sandalwood-200 transition-colors">
                <Eye className="w-4 h-4" />Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={!canPublish() || publishing || course.publishing?.status === 'published'}
                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg shadow-sandalwood-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
                ) : course.publishing?.status === 'published' ? (
                  <><CheckCircle2 className="w-4 h-4" />Published</>
                ) : (
                  <><Upload className="w-4 h-4" />Publish</>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={() => setError(null)}><X className="w-5 h-5 text-red-400 hover:text-red-600" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Units', value: stats.units, icon: Layers, color: 'sandalwood' },
            { label: 'Lessons', value: stats.lessons, icon: Target, color: 'blue' },
            { label: 'Lectures', value: stats.lectures, icon: PlayCircle, color: 'purple' },
            { label: 'Duration', value: `${stats.totalDuration}m`, icon: Clock, color: 'green' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-sandalwood-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                stat.color === 'sandalwood' ? 'bg-sandalwood-100 text-sandalwood-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-green-100 text-green-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-sandalwood-900">{stat.value}</p>
              <p className="text-sm text-sandalwood-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-sandalwood-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-sandalwood-100">
                {[
                  { id: 'structure', label: 'Course Structure', icon: Layers },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-sandalwood-900 bg-sandalwood-50 border-b-2 border-sandalwood-500'
                        : 'text-sandalwood-500 hover:text-sandalwood-700 hover:bg-sandalwood-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'structure' ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-sandalwood-900">Course Structure</h2>
                      <button
                        onClick={() => setShowUnitModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-medium hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg shadow-sandalwood-200"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Add Unit
                      </button>
                    </div>

                    {course.structure?.units?.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-sandalwood-200 rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-sandalwood-100 flex items-center justify-center mx-auto mb-4">
                          <Layers className="w-8 h-8 text-sandalwood-400" />
                        </div>
                        <h3 className="font-semibold text-sandalwood-900 mb-2">No Units Yet</h3>
                        <p className="text-sandalwood-600 mb-4">Start building your course by adding the first unit</p>
                        <button
                          onClick={() => setShowUnitModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-xl font-medium hover:bg-sandalwood-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Unit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {course.structure.units.map((unit, unitIndex) => (
                          <UnitCard
                            key={unit._id || unitIndex}
                            unit={unit}
                            unitIndex={unitIndex}
                            expanded={expandedUnits[unit._id]}
                            onToggle={() => toggleUnit(unit._id)}
                            onAddLesson={() => { setSelectedUnit(unit); setShowLessonModal(true); }}
                            expandedLessons={expandedLessons}
                            onToggleLesson={toggleLesson}
                            onAddLecture={(lesson) => { setSelectedUnit(unit); setSelectedLesson(lesson); setShowLectureModal(true); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Thumbnail */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3">
                        <ImageIcon className="w-4 h-4 text-sandalwood-600" />
                        Course Thumbnail
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="w-48 h-28 rounded-xl bg-sandalwood-100 overflow-hidden border border-sandalwood-200">
                          {thumbnailPreview ? (
                            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-10 h-10 text-sandalwood-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                          <button
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-xl font-medium hover:bg-sandalwood-200 transition-colors flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {thumbnailPreview ? 'Change' : 'Upload'}
                          </button>
                          <p className="text-xs text-sandalwood-500 mt-2">Recommended: 1280x720px, max 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Category', value: course.metadata?.category?.[0]?.replace(/_/g, ' '), icon: Target },
                        { label: 'Level', value: course.metadata?.difficulty, icon: BarChart3 },
                        { label: 'Language', value: course.metadata?.language?.instruction, icon: Globe },
                        { label: 'Pricing', value: course.pricing?.type === 'free' ? 'Free' : `₹${course.pricing?.amount || course.pricing?.oneTime?.amount || 0}`, icon: DollarSign },
                      ].map((info, i) => (
                        <div key={i} className="bg-sandalwood-50 rounded-xl p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <info.icon className="w-5 h-5 text-sandalwood-600" />
                          </div>
                          <div>
                            <p className="text-xs text-sandalwood-500">{info.label}</p>
                            <p className="font-semibold text-sandalwood-900 capitalize">{info.value || 'Not set'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Requirements */}
            <div className="bg-white rounded-2xl border border-sandalwood-100 p-6 shadow-sm">
              <h3 className="font-bold text-sandalwood-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sandalwood-600" />
                Publish Requirements
              </h3>
              <div className="space-y-3">
                {getPublishRequirements().map((req, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-sandalwood-100'}`}>
                      {req.met ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 bg-sandalwood-300 rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${req.met ? 'text-sandalwood-900' : 'text-sandalwood-500'}`}>{req.label}</span>
                  </div>
                ))}
              </div>

              {course.publishing?.status !== 'published' && (
                <button
                  onClick={handlePublish}
                  disabled={!canPublish() || publishing}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {publishing ? 'Publishing...' : 'Publish Course'}
                </button>
              )}

              {course.publishing?.status === 'published' && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Course is Live!
                  </div>
                  <p className="text-sm text-green-600 mt-1">Students can now enroll in your course</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-sandalwood-100 p-6 shadow-sm">
              <h3 className="font-bold text-sandalwood-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setShowUnitModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-sandalwood-50 rounded-xl text-sandalwood-700 hover:bg-sandalwood-100 transition-colors">
                  <FolderPlus className="w-5 h-5" />
                  <span className="font-medium">Add New Unit</span>
                </button>
                <Link to={`/courses/${id}/analytics`} className="w-full flex items-center gap-3 px-4 py-3 bg-sandalwood-50 rounded-xl text-sandalwood-700 hover:bg-sandalwood-100 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">View Analytics</span>
                </Link>
                <Link to="/courses" className="w-full flex items-center gap-3 px-4 py-3 bg-sandalwood-50 rounded-xl text-sandalwood-700 hover:bg-sandalwood-100 transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Back to Courses</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUnitModal && (
          <UnitModal courseId={id} onClose={() => setShowUnitModal(false)} onSuccess={() => { fetchCourse(); setShowUnitModal(false); setSuccess('Unit added successfully!'); setTimeout(() => setSuccess(null), 3000); }} />
        )}
        {showLessonModal && selectedUnit && (
          <LessonModal courseId={id} unitId={selectedUnit._id} onClose={() => { setShowLessonModal(false); setSelectedUnit(null); }} onSuccess={() => { fetchCourse(); setShowLessonModal(false); setSelectedUnit(null); setSuccess('Lesson added successfully!'); setTimeout(() => setSuccess(null), 3000); }} />
        )}
        {showLectureModal && selectedUnit && selectedLesson && (
          <LectureModal courseId={id} unitId={selectedUnit._id} lessonId={selectedLesson._id} onClose={() => { setShowLectureModal(false); setSelectedUnit(null); setSelectedLesson(null); }} onSuccess={() => { fetchCourse(); setShowLectureModal(false); setSelectedUnit(null); setSelectedLesson(null); setSuccess('Lecture added successfully!'); setTimeout(() => setSuccess(null), 3000); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Unit Card Component
const UnitCard = ({ unit, unitIndex, expanded, onToggle, onAddLesson, expandedLessons, onToggleLesson, onAddLecture }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-sandalwood-200 rounded-2xl overflow-hidden bg-white">
    <div className="bg-linear-to-r from-sandalwood-50 to-sandalwood-100 p-4 flex items-center gap-4 cursor-pointer" onClick={onToggle}>
      <div className="w-10 h-10 rounded-xl bg-sandalwood-200 flex items-center justify-center text-sandalwood-700 font-bold">
        {unitIndex + 1}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sandalwood-900">{unit.title}</h3>
        {unit.description && <p className="text-sm text-sandalwood-600 line-clamp-1">{unit.description}</p>}
      </div>
      <span className="text-sm text-sandalwood-600 bg-white px-3 py-1 rounded-full">{unit.lessons?.length || 0} lessons</span>
      {expanded ? <ChevronDown className="w-5 h-5 text-sandalwood-600" /> : <ChevronRight className="w-5 h-5 text-sandalwood-600" />}
    </div>

    <AnimatePresence>
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-sandalwood-100">
          <div className="p-4 space-y-3">
            {unit.lessons?.map((lesson, lessonIndex) => (
              <LessonCard
                key={lesson._id || lessonIndex}
                lesson={lesson}
                lessonIndex={lessonIndex}
                expanded={expandedLessons[lesson._id]}
                onToggle={() => onToggleLesson(lesson._id)}
                onAddLecture={() => onAddLecture(lesson)}
              />
            ))}
            <button onClick={(e) => { e.stopPropagation(); onAddLesson(); }} className="w-full py-3 border-2 border-dashed border-sandalwood-200 rounded-xl text-sandalwood-600 font-medium hover:bg-sandalwood-50 transition-colors flex items-center justify-center gap-2">
              <FilePlus className="w-4 h-4" />Add Lesson
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// Lesson Card Component
const LessonCard = ({ lesson, lessonIndex, expanded, onToggle, onAddLecture }) => (
  <div className="border border-sandalwood-100 rounded-xl overflow-hidden">
    <div className="bg-white p-3 flex items-center gap-3 cursor-pointer hover:bg-sandalwood-50 transition-colors" onClick={onToggle}>
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold">
        {lessonIndex + 1}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sandalwood-900">{lesson.title}</h4>
        {lesson.description && <p className="text-xs text-sandalwood-500 line-clamp-1">{lesson.description}</p>}
      </div>
      <span className="text-xs text-sandalwood-500 bg-sandalwood-50 px-2 py-1 rounded-full">{lesson.lectures?.length || 0} lectures</span>
      {expanded ? <ChevronDown className="w-4 h-4 text-sandalwood-500" /> : <ChevronRight className="w-4 h-4 text-sandalwood-500" />}
    </div>

    <AnimatePresence>
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-sandalwood-50/50 border-t border-sandalwood-100 p-3 space-y-2">
          {lesson.lectures?.map((lecture, lectureIndex) => (
            <LectureCard key={lecture._id || lectureIndex} lecture={lecture} lectureIndex={lectureIndex} />
          ))}
          <button onClick={(e) => { e.stopPropagation(); onAddLecture(); }} className="w-full py-2 border border-dashed border-sandalwood-200 rounded-lg text-sandalwood-600 text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Add Lecture
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Lecture Card Component
const LectureCard = ({ lecture, lectureIndex }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sandalwood-100">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lecture.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
      {lecture.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <h5 className="text-sm font-medium text-sandalwood-900">{lecture.title}</h5>
      {lecture.description && <p className="text-xs text-sandalwood-500 line-clamp-1">{lecture.description}</p>}
    </div>
    <span className="text-xs text-sandalwood-500">{lecture.duration?.minutes || 0}m</span>
  </div>
);

// Unit Modal
const UnitModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Unit title is required'); return; }
    try {
      setLoading(true);
      await apiService.addUnit(courseId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-sandalwood-900 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-sandalwood-600" />Add New Unit</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center hover:bg-sandalwood-200 transition-colors"><X className="w-5 h-5 text-sandalwood-700" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Unit Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Introduction to Vedic Chanting" className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what students will learn..." rows={4} className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-sandalwood-200 rounded-xl font-medium text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{loading ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Lesson Modal
const LessonModal = ({ courseId, unitId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Lesson title is required'); return; }
    try {
      setLoading(true);
      await apiService.addLesson(courseId, unitId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-sandalwood-900 flex items-center gap-2"><FilePlus className="w-5 h-5 text-sandalwood-600" />Add New Lesson</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center hover:bg-sandalwood-200 transition-colors"><X className="w-5 h-5 text-sandalwood-700" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Lesson Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Basic Pronunciation" className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what students will learn..." rows={4} className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-sandalwood-200 rounded-xl font-medium text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{loading ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Lecture Modal
const LectureModal = ({ courseId, unitId, lessonId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: { minutes: 0 },
    content: { videoUrl: '', textContent: '' },
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { setError('Video must be less than 500MB'); return; }
      setVideoFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Lecture title is required'); return; }
    try {
      setLoading(true);
      let finalFormData = { ...formData };

      if (videoFile && formData.type === 'video') {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('video', videoFile);
        uploadFormData.append('type', 'lecture');
        uploadFormData.append('courseId', courseId);
        const uploadResponse = await apiService.uploadVideo(uploadFormData, {
          onUploadProgress: (progressEvent) => {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          },
        });
        finalFormData.content.videoUrl = uploadResponse.data.url || uploadResponse.data.videoUrl;
        setUploading(false);
      }

      await apiService.addLecture(courseId, unitId, lessonId, finalFormData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const lectureTypes = [
    { value: 'video', label: 'Video', icon: Video, color: 'purple' },
    { value: 'article', label: 'Article', icon: FileText, color: 'amber' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-sandalwood-900 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-sandalwood-600" />Add New Lecture</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center hover:bg-sandalwood-200 transition-colors"><X className="w-5 h-5 text-sandalwood-700" /></button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

        {uploading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Uploading video...</span>
              <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="bg-blue-600 h-full rounded-full" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-3">Lecture Type</label>
            <div className="flex gap-3">
              {lectureTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`flex-1 p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    formData.type === type.value
                      ? 'border-sandalwood-500 bg-sandalwood-50'
                      : 'border-sandalwood-100 hover:border-sandalwood-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
                    <type.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sandalwood-900">{type.label}</span>
                  {formData.type === type.value && <CheckCircle2 className="w-5 h-5 text-sandalwood-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Lecture Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Introduction Video" className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the lecture content..." rows={3} className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Duration (minutes)</label>
            <input type="number" value={formData.duration.minutes} onChange={(e) => setFormData({ ...formData, duration: { minutes: parseInt(e.target.value) || 0 } })} min="0" className="w-32 px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400" />
          </div>

          {formData.type === 'video' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Upload Video File</label>
                <div className="border-2 border-dashed border-sandalwood-200 rounded-xl p-6 text-center hover:bg-sandalwood-50 transition-colors">
                  <input type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" id="video-upload" />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-sandalwood-400 mx-auto mb-2" />
                    <p className="font-medium text-sandalwood-700">{videoFile ? videoFile.name : 'Click to upload video'}</p>
                    <p className="text-sm text-sandalwood-500 mt-1">Max 500MB</p>
                  </label>
                </div>
              </div>

              <div className="text-center text-sm text-sandalwood-500">OR</div>

              <div>
                <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Video URL (YouTube/Vimeo)</label>
                <input type="url" value={formData.content.videoUrl} onChange={(e) => setFormData({ ...formData, content: { ...formData.content, videoUrl: e.target.value } })} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400" />
              </div>
            </>
          )}

          {formData.type === 'article' && (
            <div>
              <label className="block text-sm font-semibold text-sandalwood-900 mb-2">Article Content</label>
              <textarea value={formData.content.textContent} onChange={(e) => setFormData({ ...formData, content: { ...formData.content, textContent: e.target.value } })} placeholder="Enter article content..." rows={8} className="w-full px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 resize-none" />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-sandalwood-200 rounded-xl font-medium text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || uploading} className="flex-1 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white rounded-xl font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : <><Plus className="w-4 h-4" />Add Lecture</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditCourse;
