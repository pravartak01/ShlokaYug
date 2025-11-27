import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Save,
  Eye,
} from 'lucide-react';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  
  // Modals state
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
      setError(null);
    } catch (err) {
      setError('Failed to load course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);
      await apiService.publishCourse(id);
      setSuccess('Course published successfully!');
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish course');
      console.error('Publish error:', err.response?.data);
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = () => {
    if (!course) return false;
    return (
      course.title &&
      course.description &&
      course.structure?.units?.length > 0 &&
      course.structure.units.some(u => u.lessons?.length > 0)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen vintage-paper flex items-center justify-center">
        <div className="text-center">
          <div className="vintage-om text-5xl mb-4">ॐ</div>
          <p className="vintage-text">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen vintage-paper flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <p className="vintage-text">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen vintage-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="vintage-om text-5xl mb-4 text-center">ॐ</div>
          <h1 className="vintage-heading vintage-heading-lg mb-2">{course.title}</h1>
          <p className="vintage-text text-center">Build your course structure</p>
        </div>

        {/* Status Banner */}
        {error && (
          <div className="vintage-alert vintage-alert-error mb-6">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="vintage-alert vintage-alert-success mb-6">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="vintage-card p-4 text-center">
            <div className="vintage-text-sm text-vintage-ink/60">Status</div>
            <div className="vintage-heading text-lg capitalize">{course.publishing?.status || 'draft'}</div>
          </div>
          <div className="vintage-card p-4 text-center">
            <div className="vintage-text-sm text-vintage-ink/60">Units</div>
            <div className="vintage-heading text-lg">{course.structure?.units?.length || 0}</div>
          </div>
          <div className="vintage-card p-4 text-center">
            <div className="vintage-text-sm text-vintage-ink/60">Lessons</div>
            <div className="vintage-heading text-lg">
              {course.structure?.units?.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || 0}
            </div>
          </div>
          <div className="vintage-card p-4 text-center">
            <div className="vintage-text-sm text-vintage-ink/60">Lectures</div>
            <div className="vintage-heading text-lg">
              {course.structure?.units?.reduce((acc, u) => 
                acc + (u.lessons?.reduce((lacc, l) => lacc + (l.lectures?.length || 0), 0) || 0), 0
              ) || 0}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Structure */}
          <div className="lg:col-span-2">
            <div className="vintage-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="vintage-heading text-xl">Course Structure</h2>
                <button
                  onClick={() => setShowUnitModal(true)}
                  className="vintage-btn text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Unit
                </button>
              </div>

              {/* Units List */}
              {course.structure?.units?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-vintage-aged rounded">
                  <BookOpen size={48} className="text-vintage-ink/30 mx-auto mb-4" />
                  <p className="vintage-text text-vintage-ink/60">No units yet. Add your first unit to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.structure.units.map((unit, unitIndex) => (
                    <UnitItem
                      key={unit._id || unitIndex}
                      unit={unit}
                      unitIndex={unitIndex}
                      expanded={expandedUnits[unit._id]}
                      onToggle={() => toggleUnit(unit._id)}
                      onAddLesson={() => {
                        setSelectedUnit(unit);
                        setShowLessonModal(true);
                      }}
                      expandedLessons={expandedLessons}
                      onToggleLesson={toggleLesson}
                      onAddLecture={(lesson) => {
                        setSelectedUnit(unit);
                        setSelectedLesson(lesson);
                        setShowLectureModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Section */}
            <div className="vintage-card p-6">
              <h3 className="vintage-heading text-lg mb-4">Publish Course</h3>
              
              {/* Requirements Checklist */}
              <div className="space-y-3 mb-6">
                <CheckItem checked={!!course.title} label="Course title" />
                <CheckItem checked={!!course.description} label="Course description" />
                <CheckItem checked={course.structure?.units?.length > 0} label="At least one unit" />
                <CheckItem 
                  checked={course.structure?.units?.some(u => u.lessons?.length > 0)} 
                  label="At least one lesson" 
                />
              </div>

              <button
                onClick={handlePublish}
                disabled={!canPublish() || publishing || course.publishing?.status === 'published'}
                className="vintage-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  'Publishing...'
                ) : course.publishing?.status === 'published' ? (
                  <>
                    <CheckCircle size={20} />
                    Published
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Publish Course
                  </>
                )}
              </button>

              {course.publishing?.status === 'published' && (
                <button
                  onClick={() => navigate('/courses')}
                  className="vintage-btn-secondary w-full mt-3 flex items-center justify-center gap-2"
                >
                  <BookOpen size={20} />
                  Back to Courses
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="vintage-card p-6">
              <h3 className="vintage-heading text-lg mb-4">Course Info</h3>
              <div className="space-y-3 vintage-text-sm">
                <div>
                  <span className="text-vintage-ink/60">Category:</span>
                  <span className="ml-2 font-medium capitalize">
                    {course.metadata?.category?.[0]?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-vintage-ink/60">Level:</span>
                  <span className="ml-2 font-medium capitalize">{course.metadata?.difficulty}</span>
                </div>
                <div>
                  <span className="text-vintage-ink/60">Language:</span>
                  <span className="ml-2 font-medium capitalize">{course.metadata?.language?.instruction}</span>
                </div>
                <div>
                  <span className="text-vintage-ink/60">Pricing:</span>
                  <span className="ml-2 font-medium">
                    {course.pricing?.type === 'free' ? 'Free' : `₹${course.pricing?.amount}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUnitModal && (
        <UnitModal
          courseId={id}
          onClose={() => setShowUnitModal(false)}
          onSuccess={() => {
            fetchCourse();
            setShowUnitModal(false);
            setSuccess('Unit added successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}

      {showLessonModal && selectedUnit && (
        <LessonModal
          courseId={id}
          unitId={selectedUnit._id}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedUnit(null);
          }}
          onSuccess={() => {
            fetchCourse();
            setShowLessonModal(false);
            setSelectedUnit(null);
            setSuccess('Lesson added successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}

      {showLectureModal && selectedUnit && selectedLesson && (
        <LectureModal
          courseId={id}
          unitId={selectedUnit._id}
          lessonId={selectedLesson._id}
          onClose={() => {
            setShowLectureModal(false);
            setSelectedUnit(null);
            setSelectedLesson(null);
          }}
          onSuccess={() => {
            fetchCourse();
            setShowLectureModal(false);
            setSelectedUnit(null);
            setSelectedLesson(null);
            setSuccess('Lecture added successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}
    </div>
  );
};

// Helper Components
const CheckItem = ({ checked, label }) => (
  <div className="flex items-center gap-2">
    {checked ? (
      <CheckCircle size={16} className="text-green-600" />
    ) : (
      <div className="w-4 h-4 border-2 border-vintage-aged rounded-full" />
    )}
    <span className={`vintage-text-sm ${checked ? 'text-vintage-ink' : 'text-vintage-ink/60'}`}>
      {label}
    </span>
  </div>
);

const UnitItem = ({ 
  unit, 
  unitIndex, 
  expanded, 
  onToggle, 
  onAddLesson,
  expandedLessons,
  onToggleLesson,
  onAddLecture
}) => (
  <div className="border-2 border-vintage-aged rounded-lg overflow-hidden">
    <div className="bg-vintage-aged/30 p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
      <div className="flex items-center gap-3 flex-1">
        {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        <div>
          <div className="vintage-heading">Unit {unitIndex + 1}: {unit.title}</div>
          {unit.description && (
            <div className="vintage-text-sm text-vintage-ink/60 mt-1">{unit.description}</div>
          )}
        </div>
      </div>
      <div className="vintage-text-sm text-vintage-ink/60">
        {unit.lessons?.length || 0} lessons
      </div>
    </div>

    {expanded && (
      <div className="p-4 space-y-3">
        {unit.lessons?.map((lesson, lessonIndex) => (
          <LessonItem
            key={lesson._id || lessonIndex}
            lesson={lesson}
            lessonIndex={lessonIndex}
            expanded={expandedLessons[lesson._id]}
            onToggle={() => onToggleLesson(lesson._id)}
            onAddLecture={() => onAddLecture(lesson)}
          />
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddLesson();
          }}
          className="vintage-btn-secondary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Lesson
        </button>
      </div>
    )}
  </div>
);

const LessonItem = ({ lesson, lessonIndex, expanded, onToggle, onAddLecture }) => (
  <div className="border border-vintage-aged rounded">
    <div className="p-3 flex items-center justify-between cursor-pointer bg-white" onClick={onToggle}>
      <div className="flex items-center gap-3 flex-1">
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div>
          <div className="vintage-text font-medium">Lesson {lessonIndex + 1}: {lesson.title}</div>
          {lesson.description && (
            <div className="vintage-text-sm text-vintage-ink/60">{lesson.description}</div>
          )}
        </div>
      </div>
      <div className="vintage-text-sm text-vintage-ink/60">
        {lesson.lectures?.length || 0} lectures
      </div>
    </div>

    {expanded && (
      <div className="p-3 bg-vintage-aged/10 space-y-2">
        {lesson.lectures?.map((lecture, lectureIndex) => (
          <LectureItem key={lecture._id || lectureIndex} lecture={lecture} lectureIndex={lectureIndex} />
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddLecture();
          }}
          className="vintage-btn-secondary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Lecture
        </button>
      </div>
    )}
  </div>
);

const LectureItem = ({ lecture, lectureIndex }) => (
  <div className="flex items-center gap-3 p-2 bg-white rounded border border-vintage-aged/50">
    {lecture.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
    <div className="flex-1">
      <div className="vintage-text-sm font-medium">Lecture {lectureIndex + 1}: {lecture.title}</div>
      {lecture.description && (
        <div className="vintage-text-sm text-vintage-ink/60">{lecture.description}</div>
      )}
    </div>
    <div className="vintage-text-sm text-vintage-ink/60">
      {lecture.duration?.minutes || 0}min
    </div>
  </div>
);

// Unit Modal Component
const UnitModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiService.addUnit(courseId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="vintage-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="vintage-heading text-xl mb-4">Add New Unit</h2>

        {error && (
          <div className="vintage-alert vintage-alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="vintage-label">Unit Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Vedic Chanting"
              className="vintage-input w-full"
              required
            />
          </div>

          <div>
            <label className="vintage-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this unit..."
              rows={4}
              className="vintage-input w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="vintage-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="vintage-btn"
            >
              {loading ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lesson Modal Component
const LessonModal = ({ courseId, unitId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiService.addLesson(courseId, unitId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="vintage-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="vintage-heading text-xl mb-4">Add New Lesson</h2>

        {error && (
          <div className="vintage-alert vintage-alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="vintage-label">Lesson Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Basic Pronunciation Techniques"
              className="vintage-input w-full"
              required
            />
          </div>

          <div>
            <label className="vintage-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this lesson..."
              rows={4}
              className="vintage-input w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="vintage-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="vintage-btn"
            >
              {loading ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lecture Modal Component
const LectureModal = ({ courseId, unitId, lessonId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: { minutes: 0 },
    order: 1,
    content: {
      videoUrl: '',
      textContent: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiService.addLecture(courseId, unitId, lessonId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="vintage-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="vintage-heading text-xl mb-4">Add New Lecture</h2>

        {error && (
          <div className="vintage-alert vintage-alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="vintage-label">Lecture Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Pronunciation Practice Session"
              className="vintage-input w-full"
              required
            />
          </div>

          <div>
            <label className="vintage-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the lecture content..."
              rows={3}
              className="vintage-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="vintage-label">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="vintage-input w-full"
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="vintage-label">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration.minutes}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  duration: { minutes: parseInt(e.target.value) || 0 }
                })}
                min="0"
                className="vintage-input w-full"
                required
              />
            </div>
          </div>

          {formData.type === 'video' && (
            <div>
              <label className="vintage-label">Video URL</label>
              <input
                type="url"
                value={formData.content.videoUrl}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  content: { ...formData.content, videoUrl: e.target.value }
                })}
                placeholder="https://youtube.com/watch?v=..."
                className="vintage-input w-full"
              />
            </div>
          )}

          {formData.type === 'article' && (
            <div>
              <label className="vintage-label">Article Content</label>
              <textarea
                value={formData.content.textContent}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  content: { ...formData.content, textContent: e.target.value }
                })}
                placeholder="Enter article content..."
                rows={6}
                className="vintage-input w-full"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="vintage-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="vintage-btn"
            >
              {loading ? 'Adding...' : 'Add Lecture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
