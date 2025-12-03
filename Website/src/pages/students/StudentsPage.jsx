import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiService, { API_BASE_URL } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  CreditCard,
  Activity,
  Target,
  Shield,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  IndianRupee,
  GraduationCap,
  Play,
  Star,
  Zap,
} from 'lucide-react';

const StudentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const itemsPerPage = 15;
  
  // Expanded student
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Helper to get full thumbnail URL
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${thumbnail}`;
  };

  useEffect(() => {
    fetchStudentsData();
  }, [currentPage, courseFilter, statusFilter]);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats for overview
      const statsResponse = await apiService.getInstructorDashboardStats();
      setStats(statsResponse.data?.overview || null);
      setCourses(statsResponse.data?.coursePerformance || []);
      
      // Fetch students
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (courseFilter !== 'all') params.courseId = courseFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const studentsResponse = await apiService.getAllStudents(params);
      setStudents(studentsResponse.data?.students || []);
      setTotalPages(studentsResponse.data?.pagination?.totalPages || 1);
      setTotalStudents(studentsResponse.data?.pagination?.totalStudents || 0);
      
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students locally
  const filteredStudents = students.filter(student => {
    // Search filter
    const searchMatch = !search || 
      student.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.student?.email?.toLowerCase().includes(search.toLowerCase());
    
    // Progress filter
    const progress = student.progress?.percentage || 0;
    const progressMatch = progressFilter === 'all' ||
      (progressFilter === 'not_started' && progress === 0) ||
      (progressFilter === 'in_progress' && progress > 0 && progress < 100) ||
      (progressFilter === 'completed' && progress === 100);
    
    return searchMatch && progressMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent': return new Date(b.enrollment?.enrolledAt) - new Date(a.enrollment?.enrolledAt);
      case 'oldest': return new Date(a.enrollment?.enrolledAt) - new Date(b.enrollment?.enrolledAt);
      case 'name': return (a.student?.name || '').localeCompare(b.student?.name || '');
      case 'progress_high': return (b.progress?.percentage || 0) - (a.progress?.percentage || 0);
      case 'progress_low': return (a.progress?.percentage || 0) - (b.progress?.percentage || 0);
      case 'revenue': return (b.payment?.amount || 0) - (a.payment?.amount || 0);
      default: return 0;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading students...</p>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sandalwood-500 to-sandalwood-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                My Students
              </h1>
              <p className="text-sandalwood-600 mt-1">Manage and track your enrolled students</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStudentsData}
                className="p-2 rounded-xl bg-sandalwood-100 text-sandalwood-600 hover:bg-sandalwood-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats.totalStudents}
              color="blue"
            />
            <StatCard
              icon={CheckCircle2}
              label="Active"
              value={stats.activeStudents}
              color="green"
            />
            <StatCard
              icon={GraduationCap}
              label="Completed"
              value={stats.completedStudents}
              color="amber"
            />
            <StatCard
              icon={Target}
              label="Avg Progress"
              value={`${stats.avgCompletionRate}%`}
              color="orange"
            />
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              color="sandalwood"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-sandalwood-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-sandalwood-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400"
              />
            </div>
            
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 min-w-[180px]"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="px-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20"
            >
              <option value="all">All Progress</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">By Name</option>
              <option value="progress_high">Progress (High)</option>
              <option value="progress_low">Progress (Low)</option>
              <option value="revenue">By Revenue</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-sandalwood-500">
            Showing {filteredStudents.length} of {totalStudents} students
          </p>
        </div>

        {/* Students List */}
        {error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sandalwood-900 mb-2">Error Loading Students</h3>
            <p className="text-sandalwood-600 mb-4">{error}</p>
            <button
              onClick={fetchStudentsData}
              className="px-4 py-2 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="bg-white rounded-2xl border border-sandalwood-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sandalwood-50 border-b border-sandalwood-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Enrolled</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Payment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Progress</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Last Active</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandalwood-50">
                  {filteredStudents.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr 
                        className="hover:bg-sandalwood-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedStudent(expandedStudent === item._id ? null : item._id)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-semibold">
                              {item.student?.avatar || 'S'}
                            </div>
                            <div>
                              <p className="font-medium text-sandalwood-900">{item.student?.name || 'Unknown'}</p>
                              <p className="text-xs text-sandalwood-500">{item.student?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {item.course?.thumbnail ? (
                              <img 
                                src={getThumbnailUrl(item.course.thumbnail)} 
                                alt="" 
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-sandalwood-100 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-sandalwood-400" />
                              </div>
                            )}
                            <p className="text-sm text-sandalwood-700 max-w-[150px] truncate">{item.course?.title || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-sandalwood-700">{formatDate(item.enrollment?.enrolledAt)}</p>
                          <p className="text-xs text-sandalwood-500 capitalize">{item.enrollment?.type?.replace('_', ' ')}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-sandalwood-900">{formatCurrency(item.payment?.amount || 0)}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            item.payment?.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : item.payment?.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.payment?.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                            {item.payment?.status === 'pending' && <Clock className="w-3 h-3" />}
                            {item.payment?.status || 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-24">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-sandalwood-900">
                                {item.progress?.percentage || 0}%
                              </span>
                              {item.progress?.isCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="w-full h-2 bg-sandalwood-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  item.progress?.isCompleted
                                    ? 'bg-green-500'
                                    : 'bg-sandalwood-500'
                                }`}
                                style={{ width: `${item.progress?.percentage || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-sandalwood-700">{formatDateTime(item.enrollment?.lastAccess)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.enrollment?.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : item.enrollment?.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.enrollment?.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                            {item.enrollment?.status === 'expired' && <XCircle className="w-3 h-3" />}
                            {item.enrollment?.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2 hover:bg-sandalwood-100 rounded-lg transition-colors"
                              title="Send Message"
                            >
                              <Mail className="w-4 h-4 text-sandalwood-500" />
                            </button>
                            <button className="p-2 hover:bg-sandalwood-100 rounded-lg transition-colors">
                              <ChevronDown className={`w-4 h-4 text-sandalwood-500 transition-transform ${expandedStudent === item._id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedStudent === item._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={8} className="px-4 py-4 bg-sandalwood-50/50">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <DetailCard
                                  icon={CreditCard}
                                  label="Payment Details"
                                  items={[
                                    { label: 'Amount', value: formatCurrency(item.payment?.amount || 0) },
                                    { label: 'Paid At', value: formatDate(item.payment?.paidAt) },
                                    { label: 'Status', value: item.payment?.status || 'N/A' },
                                  ]}
                                />
                                <DetailCard
                                  icon={Activity}
                                  label="Learning Activity"
                                  items={[
                                    { label: 'Lectures Completed', value: item.progress?.lecturesCompleted || 0 },
                                    { label: 'Watch Time', value: formatDuration(item.progress?.totalWatchTime) },
                                    { label: 'Last Access', value: formatDateTime(item.enrollment?.lastAccess) },
                                  ]}
                                />
                                <DetailCard
                                  icon={Target}
                                  label="Progress Details"
                                  items={[
                                    { label: 'Completion', value: `${item.progress?.percentage || 0}%` },
                                    { label: 'Completed', value: item.progress?.isCompleted ? 'Yes' : 'No' },
                                    { label: 'Completed At', value: formatDate(item.progress?.completedAt) },
                                  ]}
                                />
                                <DetailCard
                                  icon={Shield}
                                  label="Enrollment Info"
                                  items={[
                                    { label: 'Type', value: item.enrollment?.type?.replace('_', ' ') || 'N/A' },
                                    { label: 'Enrolled', value: formatDate(item.enrollment?.enrolledAt) },
                                    { label: 'Student Since', value: formatDate(item.student?.joinedAt) },
                                  ]}
                                />
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-lg text-sm font-medium hover:bg-sandalwood-700 transition-colors">
                                  <Mail className="w-4 h-4" />
                                  Send Message
                                </button>
                                {item.progress?.isCompleted && (
                                  <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                                    <Award className="w-4 h-4" />
                                    Issue Certificate
                                  </button>
                                )}
                                <Link
                                  to={`/courses/${item.course?._id}/manage`}
                                  className="flex items-center gap-2 px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-lg text-sm font-medium hover:bg-sandalwood-200 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Course
                                </Link>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-sandalwood-100 p-12 text-center">
            <Users className="w-16 h-16 text-sandalwood-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sandalwood-900 mb-2">No Students Found</h3>
            <p className="text-sandalwood-500">
              {search || courseFilter !== 'all' || statusFilter !== 'all' || progressFilter !== 'all'
                ? 'Try adjusting your filters to find students.'
                : 'Students will appear here when they enroll in your courses.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-sandalwood-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sandalwood-200 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-sandalwood-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sandalwood-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
    sandalwood: 'bg-sandalwood-100 text-sandalwood-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-sandalwood-100 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-sandalwood-900">{value}</p>
          <p className="text-xs text-sandalwood-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Detail Card Component
const DetailCard = ({ icon: Icon, label, items }) => (
  <div className="bg-white rounded-xl p-4 border border-sandalwood-100">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-sandalwood-500" />
      <h4 className="font-medium text-sandalwood-900 text-sm">{label}</h4>
    </div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-sandalwood-500">{item.label}</span>
          <span className="font-medium text-sandalwood-900 capitalize">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StudentsPage;
