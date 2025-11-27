import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGuruAuth } from '../../context/GuruAuthContext';
import apiService from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Clock,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';

const MyCourses = () => {
  const { user } = useGuruAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      
      // Debug: Check if token exists
      const token = localStorage.getItem('guru_access_token');
      console.log('Token exists:', !!token);
      console.log('User:', user);
      
      if (!token) {
        setError('You are not logged in. Please log in to view your courses.');
        setLoading(false);
        return;
      }
      
      const response = await apiService.getMyCourses();
      setCourses(response.data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      
      // If 401, user needs to login again
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('guru_access_token');
        localStorage.removeItem('guru_refresh_token');
        localStorage.removeItem('guru_user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await apiService.publishCourse(courseId);
      await fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish course');
    }
  };

  const handleUnpublish = async (courseId) => {
    try {
      await apiService.unpublishCourse(courseId);
      await fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unpublish course');
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      try {
        await apiService.deleteCourse(courseId);
        await fetchMyCourses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'draft' && !course.isPublished);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen vintage-paper flex items-center justify-center">
        <div className="text-center">
          <div className="vintage-om text-6xl mb-4">ॐ</div>
          <p className="vintage-text">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen vintage-paper">
      {/* Header */}
      <div className="bg-vintage-paper-light border-b-2 border-vintage-aged sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="vintage-heading vintage-heading-lg">My Courses</h1>
              <p className="vintage-text mt-1">Manage your Sanskrit learning courses</p>
            </div>
            <Link to="/courses/create" className="vintage-btn flex items-center gap-2">
              <Plus size={20} />
              Create New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="vintage-alert vintage-alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Filters & Search */}
        <div className="vintage-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-sepia"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="vintage-input pl-10 w-full"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-vintage-sepia" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="vintage-input"
              >
                <option value="all">All Courses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="vintage-card p-12 text-center">
            <BookOpen size={64} className="mx-auto text-vintage-sepia mb-4" />
            <h3 className="vintage-heading vintage-heading-sm mb-2">No Courses Found</h3>
            <p className="vintage-text mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start sharing your knowledge by creating your first course'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link to="/courses/create" className="vintage-btn inline-flex items-center gap-2">
                <Plus size={20} />
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="vintage-card overflow-hidden group">
                {/* Course Image */}
                <div className="h-48 bg-vintage-sepia bg-opacity-10 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen size={64} className="text-vintage-sepia" />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {course.isPublished ? (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-vintage-amber text-white text-xs font-semibold rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="vintage-heading vintage-heading-sm mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="vintage-text-sm mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 vintage-text-sm">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.totalDuration || 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={16} />
                      <span>₹{course.pricing?.oneTime?.amount || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${course._id}/edit`}
                      className="flex-1 vintage-btn-secondary text-center py-2 text-sm"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </Link>

                    {/* More Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === course._id ? null : course._id)}
                        className="p-2 hover:bg-vintage-aged rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {showMenu === course._id && (
                        <div className="absolute right-0 mt-2 w-48 vintage-card py-2 shadow-xl z-10">
                          <Link
                            to={`/courses/${course._id}/edit`}
                            className="block px-4 py-2 hover:bg-vintage-aged vintage-text-sm"
                          >
                            <Eye size={16} className="inline mr-2" />
                            Manage Course
                          </Link>

                          {course.isPublished ? (
                            <button
                              onClick={() => handleUnpublish(course._id)}
                              className="w-full text-left px-4 py-2 hover:bg-vintage-aged vintage-text-sm"
                            >
                              <EyeOff size={16} className="inline mr-2" />
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublish(course._id)}
                              className="w-full text-left px-4 py-2 hover:bg-vintage-aged vintage-text-sm"
                            >
                              <Eye size={16} className="inline mr-2" />
                              Publish
                            </button>
                          )}

                          <Link
                            to={`/courses/${course._id}/analytics`}
                            className="block px-4 py-2 hover:bg-vintage-aged vintage-text-sm"
                          >
                            <TrendingUp size={16} className="inline mr-2" />
                            Analytics
                          </Link>

                          <hr className="my-2 border-vintage-aged" />

                          <button
                            onClick={() => handleDelete(course._id, course.title)}
                            className="w-full text-left px-4 py-2 hover:bg-vintage-aged vintage-text-sm text-red-600"
                          >
                            <Trash2 size={16} className="inline mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
