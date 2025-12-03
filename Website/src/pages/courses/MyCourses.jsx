import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuruAuth } from '../../context/GuruAuthContext';
import apiService, { API_BASE_URL } from '../../services/api';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Clock,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  Star,
  BarChart3,
  Play,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  DollarSign,
  Calendar,
  ArrowUpRight,
  GraduationCap,
  Target,
  Layers,
  RefreshCw,
} from 'lucide-react';

const MyCourses = () => {
  const { user } = useGuruAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showMenu, setShowMenu] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Helper to get full thumbnail URL
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${thumbnail}`;
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null);
      setShowFilterDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('guru_access_token');
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
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('guru_access_token');
        localStorage.removeItem('guru_refresh_token');
        localStorage.removeItem('guru_user');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      setActionLoading(courseId);
      await apiService.publishCourse(courseId);
      await fetchMyCourses();
      setSuccess('Course published successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish course');
    } finally {
      setActionLoading(null);
      setShowMenu(null);
    }
  };

  const handleUnpublish = async (courseId) => {
    try {
      setActionLoading(courseId);
      await apiService.unpublishCourse(courseId);
      await fetchMyCourses();
      setSuccess('Course unpublished successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unpublish course');
    } finally {
      setActionLoading(null);
      setShowMenu(null);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      try {
        setActionLoading(courseId);
        await apiService.deleteCourse(courseId);
        await fetchMyCourses();
        setSuccess('Course deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete course');
      } finally {
        setActionLoading(null);
        setShowMenu(null);
      }
    }
  };

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || (filterStatus === 'published' && course.isPublished) || (filterStatus === 'draft' && !course.isPublished);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title': return a.title.localeCompare(b.title);
        case 'students': return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        default: return 0;
      }
    });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.isPublished).length,
    draft: courses.filter((c) => !c.isPublished).length,
    totalStudents: courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* Header */}
      <header className="bg-white border-b border-sandalwood-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-sandalwood-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sandalwood-500 to-sandalwood-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                My Courses
              </h1>
              <p className="text-sandalwood-600 mt-1">Manage and create your Sanskrit learning courses</p>
            </div>
            <Link
              to="/courses/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white font-semibold rounded-xl hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg shadow-sandalwood-200"
            >
              <Plus className="w-5 h-5" />
              Create New Course
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
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
            { label: 'Total Courses', value: stats.total, icon: Layers, color: 'sandalwood' },
            { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'green' },
            { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'amber' },
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-sandalwood-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'sandalwood' ? 'bg-sandalwood-100 text-sandalwood-600' :
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-sandalwood-900">{stat.value}</p>
              <p className="text-sm text-sandalwood-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-sandalwood-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-sandalwood-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(!showFilterDropdown); }}
                  className="flex items-center gap-2 px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-700 hover:bg-sandalwood-100 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="capitalize">{filterStatus === 'all' ? 'All Status' : filterStatus}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showFilterDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-xl border border-sandalwood-100 shadow-xl z-20 py-2 min-w-[150px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {['all', 'published', 'draft'].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-sandalwood-50 transition-colors capitalize ${filterStatus === status ? 'text-sandalwood-900 font-medium bg-sandalwood-50' : 'text-sandalwood-600'}`}
                        >
                          {status === 'all' ? 'All Status' : status}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
                <option value="students">By Students</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-sandalwood-50 rounded-xl p-1 border border-sandalwood-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-sandalwood-900' : 'text-sandalwood-500 hover:text-sandalwood-700'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-sandalwood-900' : 'text-sandalwood-500 hover:text-sandalwood-700'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchMyCourses}
                className="p-3 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sandalwood-600 hover:bg-sandalwood-100 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-sandalwood-100 p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 rounded-2xl bg-sandalwood-100 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-sandalwood-400" />
            </div>
            <h3 className="text-xl font-bold text-sandalwood-900 mb-2">No Courses Found</h3>
            <p className="text-sandalwood-600 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Start sharing your knowledge by creating your first course.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white font-semibold rounded-xl hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Your First Course
              </Link>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-sandalwood-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-sandalwood-200 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-linear-to-br from-sandalwood-100 to-sandalwood-200 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={getThumbnailUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-sandalwood-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {course.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Edit3 className="w-3.5 h-3.5" />
                        Draft
                      </span>
                    )}
                  </div>
                  {/* Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === course._id ? null : course._id); }}
                      className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-sandalwood-700" />
                    </button>
                    <AnimatePresence>
                      {showMenu === course._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-sandalwood-100 shadow-xl py-2 min-w-[180px] z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/courses/${course._id}/manage`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">
                            <BarChart3 className="w-4 h-4" />Manage Course
                          </Link>
                          <Link to={`/courses/${course._id}/edit`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">
                            <Edit3 className="w-4 h-4" />Edit Course
                          </Link>
                          {course.isPublished ? (
                            <button onClick={() => handleUnpublish(course._id)} disabled={actionLoading === course._id} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sandalwood-700 hover:bg-sandalwood-50 transition-colors disabled:opacity-50">
                              <EyeOff className="w-4 h-4" />Unpublish
                            </button>
                          ) : (
                            <button onClick={() => handlePublish(course._id)} disabled={actionLoading === course._id} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sandalwood-700 hover:bg-sandalwood-50 transition-colors disabled:opacity-50">
                              <Eye className="w-4 h-4" />Publish
                            </button>
                          )}
                          <Link to={`/courses/${course._id}/analytics`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sandalwood-700 hover:bg-sandalwood-50 transition-colors">
                            <BarChart3 className="w-4 h-4" />Analytics
                          </Link>
                          <hr className="my-2 border-sandalwood-100" />
                          <button onClick={() => handleDelete(course._id, course.title)} disabled={actionLoading === course._id} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-sandalwood-900 mb-2 line-clamp-2 group-hover:text-sandalwood-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-sandalwood-600 mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                      <Layers className="w-4 h-4" />
                      <span>{course.contentStats?.totalUnits || course.structure?.units?.length || 0} units</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{(course.pricingType === 'free' || (!course.pricing?.oneTime?.amount && !course.pricing?.subscription?.monthly?.amount)) ? 'Free' : `₹${course.pricing?.oneTime?.amount || course.pricing?.subscription?.monthly?.amount || 0}`}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course._id}/manage`}
                      className="flex-1 py-2.5 bg-sandalwood-600 text-white text-sm font-medium rounded-xl hover:bg-sandalwood-700 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Manage
                    </Link>
                    <Link
                      to={`/courses/${course._id}/edit`}
                      className="py-2.5 px-4 bg-sandalwood-50 text-sandalwood-700 text-sm font-medium rounded-xl hover:bg-sandalwood-100 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/courses/${course._id}/preview`}
                      className="py-2.5 px-4 bg-sandalwood-900 text-white text-sm font-medium rounded-xl hover:bg-sandalwood-800 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-sandalwood-100 p-4 shadow-sm hover:shadow-lg hover:border-sandalwood-200 transition-all"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-24 rounded-xl bg-sandalwood-100 overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img src={getThumbnailUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-sandalwood-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {course.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Edit3 className="w-3 h-3" />Draft
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sandalwood-900 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-sandalwood-600 line-clamp-1 mt-1">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/courses/${course._id}/manage`} className="p-2 rounded-lg bg-sandalwood-600 text-white hover:bg-sandalwood-700 transition-colors" title="Manage Course">
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                        <Link to={`/courses/${course._id}/edit`} className="p-2 rounded-lg bg-sandalwood-50 text-sandalwood-600 hover:bg-sandalwood-100 transition-colors" title="Edit Course">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id, course.title)}
                          disabled={actionLoading === course._id}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollmentCount || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                        <Layers className="w-4 h-4" />
                        <span>{course.contentStats?.totalUnits || course.structure?.units?.length || 0} units</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-sandalwood-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{(course.pricingType === 'free' || (!course.pricing?.oneTime?.amount && !course.pricing?.subscription?.monthly?.amount)) ? 'Free' : `₹${course.pricing?.oneTime?.amount || course.pricing?.subscription?.monthly?.amount || 0}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-sandalwood-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
