import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiService, { API_BASE_URL } from '../../services/api';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit3,
  Settings,
  BarChart3,
  Clock,
  Calendar,
  Star,
  Play,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Download,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  CreditCard,
  RefreshCw,
  MessageSquare,
  Award,
  Target,
  Activity,
  Percent,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Video,
  Layers,
  GraduationCap,
  Globe,
  Shield,
  Zap,
  Trash2,
} from 'lucide-react';

const CourseManagement = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Course data
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to get full thumbnail URL
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${thumbnail}`;
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await apiService.getCourseById(courseId, true);
      setCourse(courseResponse.data?.course || courseResponse.data);
      
      // Fetch enrollments for this course
      try {
        const enrollmentsResponse = await apiService.getEnrollments(courseId);
        setEnrollments(enrollmentsResponse.data?.enrollments || []);
      } catch (enrollError) {
        console.log('No enrollments data:', enrollError.message);
        setEnrollments([]);
      }
      
      // Fetch analytics
      try {
        const analyticsResponse = await apiService.getCourseAnalytics(courseId);
        setAnalytics(analyticsResponse.data);
      } catch (analyticsError) {
        console.log('No analytics data:', analyticsError.message);
        setAnalytics(null);
      }
      
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError(err.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async () => {
    if (!window.confirm(`Are you sure you want to delete "${course?.title}"? This will make the course unavailable to all students.`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      await apiService.deleteCourse(courseId);
      alert('Course deleted successfully');
      navigate('/courses');
    } catch (err) {
      console.error('Delete course error:', err);
      setError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate stats from enrollments
  const stats = {
    totalStudents: enrollments.length,
    activeStudents: enrollments.filter(e => e.access?.status === 'active').length,
    completedStudents: enrollments.filter(e => e.progress?.isCompleted).length,
    totalRevenue: enrollments.reduce((acc, e) => acc + (e.payment?.amount || 0), 0),
    avgProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress?.completionPercentage || 0), 0) / enrollments.length)
      : 0,
    avgRating: course?.analytics?.ratings?.average || 0,
    totalRatings: course?.analytics?.ratings?.count || 0,
    completionRate: enrollments.length > 0 
      ? Math.round((enrollments.filter(e => e.progress?.isCompleted).length / enrollments.length) * 100)
      : 0,
  };

  // Filter and sort enrollments
  const filteredEnrollments = enrollments
    .filter(enrollment => {
      // Search filter
      const student = enrollment.userId;
      const searchMatch = !studentSearch || 
        student?.profile?.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student?.profile?.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student?.email?.toLowerCase().includes(studentSearch.toLowerCase());
      
      // Payment filter
      const paymentMatch = paymentFilter === 'all' ||
        (paymentFilter === 'paid' && enrollment.payment?.status === 'completed') ||
        (paymentFilter === 'pending' && enrollment.payment?.status === 'pending') ||
        (paymentFilter === 'free' && enrollment.payment?.amount === 0);
      
      // Progress filter
      const progress = enrollment.progress?.completionPercentage || 0;
      const progressMatch = progressFilter === 'all' ||
        (progressFilter === 'not_started' && progress === 0) ||
        (progressFilter === 'in_progress' && progress > 0 && progress < 100) ||
        (progressFilter === 'completed' && progress === 100);
      
      return searchMatch && paymentMatch && progressMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name': return (a.userId?.profile?.firstName || '').localeCompare(b.userId?.profile?.firstName || '');
        case 'progress_high': return (b.progress?.completionPercentage || 0) - (a.progress?.completionPercentage || 0);
        case 'progress_low': return (a.progress?.completionPercentage || 0) - (b.progress?.completionPercentage || 0);
        case 'revenue': return (b.payment?.amount || 0) - (a.payment?.amount || 0);
        default: return 0;
      }
    });

  // Paginate enrollments
  const paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

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
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-sandalwood-900 mb-2">Error Loading Course</h2>
          <p className="text-sandalwood-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors"
          >
            Back to My Courses
          </button>
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
              <button
                onClick={() => navigate('/courses')}
                className="p-2 rounded-xl hover:bg-sandalwood-100 text-sandalwood-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {course?.thumbnail ? (
                  <img
                    src={getThumbnailUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-sandalwood-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-sandalwood-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-sandalwood-900 line-clamp-1">{course?.title}</h1>
                  <div className="flex items-center gap-2 text-sm">
                    {course?.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Draft
                      </span>
                    )}
                    <span className="text-sandalwood-500">•</span>
                    <span className="text-sandalwood-500">{stats.totalStudents} students</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCourseData}
                className="p-2 rounded-xl hover:bg-sandalwood-100 text-sandalwood-600 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                to={`/courses/${courseId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-xl hover:bg-sandalwood-200 transition-colors font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit Course
              </Link>
              <Link
                to={`/courses/${courseId}/preview`}
                className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-xl hover:bg-sandalwood-700 transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              <button
                onClick={handleDeleteCourse}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium disabled:opacity-50"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents}
            subValue={`${stats.activeStudents} active`}
            color="blue"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subValue="All time"
            color="green"
          />
          <StatCard
            icon={Target}
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            subValue={`${stats.completedStudents} completed`}
            color="amber"
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={stats.avgRating.toFixed(1)}
            subValue={`${stats.totalRatings} reviews`}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-sandalwood-100 mb-6 overflow-hidden">
          <div className="flex border-b border-sandalwood-100 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users, badge: stats.totalStudents },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'content', label: 'Content', icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-sandalwood-900 border-b-2 border-sandalwood-600 bg-sandalwood-50/50'
                    : 'text-sandalwood-500 hover:text-sandalwood-700 hover:bg-sandalwood-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-sandalwood-600 text-white' : 'bg-sandalwood-100 text-sandalwood-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                course={course}
                stats={stats}
                enrollments={enrollments}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'students' && (
              <StudentsTab
                enrollments={paginatedEnrollments}
                totalEnrollments={filteredEnrollments.length}
                studentSearch={studentSearch}
                setStudentSearch={setStudentSearch}
                paymentFilter={paymentFilter}
                setPaymentFilter={setPaymentFilter}
                progressFilter={progressFilter}
                setProgressFilter={setProgressFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
              />
            )}

            {activeTab === 'revenue' && (
              <RevenueTab
                enrollments={enrollments}
                stats={stats}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'content' && (
              <ContentTab
                course={course}
                courseId={courseId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color, trend }) => {
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
      className="bg-white rounded-2xl p-5 border border-sandalwood-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-sandalwood-900">{value}</p>
      <p className="text-sm text-sandalwood-500 mt-1">{label}</p>
      {subValue && <p className="text-xs text-sandalwood-400 mt-0.5">{subValue}</p>}
    </motion.div>
  );
};

// Overview Tab
const OverviewTab = ({ course, stats, enrollments, formatCurrency, formatDate }) => {
  // Recent enrollments (last 5)
  const recentEnrollments = enrollments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Enrollment trends (by day for last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const enrollmentsByDay = last7Days.map(day => ({
    day: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }),
    count: enrollments.filter(e => new Date(e.createdAt).toDateString() === day).length,
  }));

  return (
    <div className="space-y-6">
      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-sandalwood-50 rounded-2xl p-6">
            <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sandalwood-600" />
              Course Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Category" value={course?.category || 'N/A'} icon={Layers} />
              <InfoItem label="Level" value={course?.level || course?.metadata?.difficulty || 'N/A'} icon={Target} />
              <InfoItem label="Language" value={course?.language || course?.metadata?.language?.instruction || 'N/A'} icon={Globe} />
              <InfoItem label="Duration" value={course?.duration ? `${course.duration} hours` : 'N/A'} icon={Clock} />
              <InfoItem 
                label="Units" 
                value={course?.structure?.units?.length || course?.contentStats?.totalUnits || 0} 
                icon={Layers} 
              />
              <InfoItem 
                label="Lessons" 
                value={course?.contentStats?.totalLessons || course?.structure?.units?.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || 0} 
                icon={FileText} 
              />
              <InfoItem 
                label="Lectures" 
                value={course?.contentStats?.totalLectures || 0} 
                icon={Video} 
              />
              <InfoItem label="Created" value={formatDate(course?.createdAt)} icon={Calendar} />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-sandalwood-50 rounded-2xl p-6">
            <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-sandalwood-600" />
              Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem 
                label="Pricing Type" 
                value={course?.pricingType || (course?.pricing?.oneTime?.amount > 0 ? 'Paid' : 'Free')} 
                icon={CreditCard} 
              />
              <InfoItem 
                label="One-Time Price" 
                value={formatCurrency(course?.pricing?.oneTime?.amount || 0)} 
                icon={IndianRupee} 
              />
              <InfoItem 
                label="Monthly" 
                value={formatCurrency(course?.pricing?.subscription?.monthly?.amount || 0)} 
                icon={Calendar} 
              />
              <InfoItem 
                label="Yearly" 
                value={formatCurrency(course?.pricing?.subscription?.yearly?.amount || 0)} 
                icon={Calendar} 
              />
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-sandalwood-50 rounded-2xl p-6">
          <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-sandalwood-600" />
            Recent Enrollments
          </h3>
          {recentEnrollments.length > 0 ? (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-semibold">
                    {enrollment.userId?.profile?.firstName?.[0] || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sandalwood-900 truncate">
                      {enrollment.userId?.profile?.firstName} {enrollment.userId?.profile?.lastName}
                    </p>
                    <p className="text-xs text-sandalwood-500">{formatDate(enrollment.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    enrollment.payment?.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {formatCurrency(enrollment.payment?.amount || 0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-sandalwood-300 mx-auto mb-2" />
              <p className="text-sandalwood-500">No enrollments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Enrollment Trend */}
      <div className="bg-sandalwood-50 rounded-2xl p-6">
        <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sandalwood-600" />
          Enrollments This Week
        </h3>
        <div className="flex items-end gap-2 h-32">
          {enrollmentsByDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-sandalwood-500 rounded-t-lg transition-all hover:bg-sandalwood-600"
                style={{ height: `${Math.max(day.count * 20, 8)}px` }}
              />
              <span className="text-xs text-sandalwood-500">{day.day}</span>
              <span className="text-xs font-medium text-sandalwood-700">{day.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
      <Icon className="w-4 h-4 text-sandalwood-500" />
    </div>
    <div>
      <p className="text-xs text-sandalwood-500">{label}</p>
      <p className="font-medium text-sandalwood-900 capitalize">{value}</p>
    </div>
  </div>
);

// Students Tab
const StudentsTab = ({
  enrollments,
  totalEnrollments,
  studentSearch,
  setStudentSearch,
  paymentFilter,
  setPaymentFilter,
  progressFilter,
  setProgressFilter,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  totalPages,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  const [expandedStudent, setExpandedStudent] = useState(null);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-sandalwood-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400"
          />
        </div>
        
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm text-sandalwood-700 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="free">Free</option>
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
          <option value="progress_high">Progress (High to Low)</option>
          <option value="progress_low">Progress (Low to High)</option>
          <option value="revenue">By Revenue</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-sandalwood-600 text-white rounded-xl text-sm font-medium hover:bg-sandalwood-700 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-sandalwood-500">
        Showing {enrollments.length} of {totalEnrollments} students
      </p>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-sandalwood-100 overflow-hidden">
        {enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sandalwood-50 border-b border-sandalwood-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Enrolled</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Last Active</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sandalwood-50">
                {enrollments.map((enrollment) => (
                  <React.Fragment key={enrollment._id}>
                    <tr 
                      className="hover:bg-sandalwood-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedStudent(expandedStudent === enrollment._id ? null : enrollment._id)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-semibold">
                            {enrollment.userId?.profile?.firstName?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-sandalwood-900">
                              {enrollment.userId?.profile?.firstName} {enrollment.userId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-sandalwood-500">{enrollment.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-sandalwood-700">{formatDate(enrollment.createdAt)}</p>
                        <p className="text-xs text-sandalwood-500 capitalize">{enrollment.enrollmentType?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-sandalwood-900">{formatCurrency(enrollment.payment?.amount || 0)}</p>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          enrollment.payment?.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : enrollment.payment?.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {enrollment.payment?.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {enrollment.payment?.status === 'pending' && <Clock className="w-3 h-3" />}
                          {enrollment.payment?.status || 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-sandalwood-900">
                              {enrollment.progress?.completionPercentage || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-sandalwood-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                (enrollment.progress?.completionPercentage || 0) === 100
                                  ? 'bg-green-500'
                                  : 'bg-sandalwood-500'
                              }`}
                              style={{ width: `${enrollment.progress?.completionPercentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-sandalwood-700">{formatDate(enrollment.access?.lastAccessedAt || enrollment.analytics?.lastActivityDate)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          enrollment.access?.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : enrollment.access?.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {enrollment.access?.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                          {enrollment.access?.status === 'expired' && <XCircle className="w-3 h-3" />}
                          {enrollment.access?.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 hover:bg-sandalwood-100 rounded-lg transition-colors">
                          <ChevronDown className={`w-4 h-4 text-sandalwood-500 transition-transform ${expandedStudent === enrollment._id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedStudent === enrollment._id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="px-4 py-4 bg-sandalwood-50/50">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <DetailCard
                                icon={CreditCard}
                                label="Payment Details"
                                items={[
                                  { label: 'Payment ID', value: enrollment.payment?.paymentId || 'N/A' },
                                  { label: 'Paid At', value: formatDateTime(enrollment.payment?.paidAt) },
                                  { label: 'Method', value: enrollment.payment?.razorpayPaymentId ? 'Razorpay' : 'Direct' },
                                ]}
                              />
                              <DetailCard
                                icon={Activity}
                                label="Learning Activity"
                                items={[
                                  { label: 'Lectures Completed', value: enrollment.progress?.lecturesCompleted?.length || 0 },
                                  { label: 'Watch Time', value: `${Math.round((enrollment.progress?.totalWatchTime || 0) / 60)} mins` },
                                  { label: 'Login Days', value: enrollment.analytics?.totalLoginDays || 0 },
                                ]}
                              />
                              <DetailCard
                                icon={Target}
                                label="Progress Details"
                                items={[
                                  { label: 'Completed', value: enrollment.progress?.isCompleted ? 'Yes' : 'No' },
                                  { label: 'Completed At', value: formatDate(enrollment.progress?.completedAt) },
                                  { label: 'Certificate', value: enrollment.progress?.certificateEligible ? 'Eligible' : 'Not Yet' },
                                ]}
                              />
                              <DetailCard
                                icon={Shield}
                                label="Access Info"
                                items={[
                                  { label: 'Access Granted', value: formatDate(enrollment.access?.grantedAt) },
                                  { label: 'Expires', value: formatDate(enrollment.access?.expiresAt) || 'Lifetime' },
                                  { label: 'Devices', value: enrollment.access?.accessDevices?.length || 0 },
                                ]}
                              />
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-lg text-sm font-medium hover:bg-sandalwood-700 transition-colors">
                                <Mail className="w-4 h-4" />
                                Send Message
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 bg-sandalwood-100 text-sandalwood-700 rounded-lg text-sm font-medium hover:bg-sandalwood-200 transition-colors">
                                <Award className="w-4 h-4" />
                                Issue Certificate
                              </button>
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
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-sandalwood-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sandalwood-900 mb-2">No Students Found</h3>
            <p className="text-sandalwood-500">No students match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
          <span className="font-medium text-sandalwood-900">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

// Revenue Tab
const RevenueTab = ({ enrollments, stats, formatCurrency, formatDate }) => {
  // Group revenue by month
  const revenueByMonth = enrollments.reduce((acc, e) => {
    if (e.payment?.status === 'completed' && e.payment?.paidAt) {
      const month = new Date(e.payment.paidAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + (e.payment.amount || 0);
    }
    return acc;
  }, {});

  // Group by payment type
  const revenueByType = enrollments.reduce((acc, e) => {
    if (e.payment?.status === 'completed') {
      const type = e.enrollmentType || 'unknown';
      acc[type] = (acc[type] || 0) + (e.payment.amount || 0);
    }
    return acc;
  }, {});

  // Calculate platform fee (20%)
  const platformFee = stats.totalRevenue * 0.2;
  const netEarnings = stats.totalRevenue * 0.8;

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-green-600">Gross Revenue</p>
        </div>
        
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(platformFee)}</p>
          <p className="text-sm text-amber-600">Platform Fee (20%)</p>
        </div>
        
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(netEarnings)}</p>
          <p className="text-sm text-blue-600">Your Earnings (80%)</p>
        </div>
        
        <div className="bg-sandalwood-50 rounded-2xl p-5 border border-sandalwood-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-sandalwood-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-sandalwood-900">
            {formatCurrency(stats.totalStudents > 0 ? stats.totalRevenue / stats.totalStudents : 0)}
          </p>
          <p className="text-sm text-sandalwood-600">Avg. Per Student</p>
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="bg-sandalwood-50 rounded-2xl p-6">
        <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sandalwood-600" />
          Revenue by Month
        </h3>
        {Object.keys(revenueByMonth).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(revenueByMonth).map(([month, amount]) => (
              <div key={month} className="flex items-center gap-4">
                <span className="w-24 text-sm text-sandalwood-600">{month}</span>
                <div className="flex-1 h-8 bg-white rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sandalwood-400 to-sandalwood-600 rounded-lg flex items-center px-3"
                    style={{ width: `${Math.max((amount / stats.totalRevenue) * 100, 10)}%` }}
                  >
                    <span className="text-white text-xs font-medium">{formatCurrency(amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sandalwood-500 text-center py-8">No revenue data yet</p>
        )}
      </div>

      {/* Revenue by Type */}
      <div className="bg-sandalwood-50 rounded-2xl p-6">
        <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sandalwood-600" />
          Revenue by Purchase Type
        </h3>
        {Object.keys(revenueByType).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(revenueByType).map(([type, amount]) => (
              <div key={type} className="bg-white rounded-xl p-4 border border-sandalwood-100">
                <p className="text-sm text-sandalwood-500 capitalize">{type.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-sandalwood-900 mt-1">{formatCurrency(amount)}</p>
                <p className="text-xs text-sandalwood-400 mt-1">
                  {Math.round((amount / stats.totalRevenue) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sandalwood-500 text-center py-8">No revenue data yet</p>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-sandalwood-50 rounded-2xl p-6">
        <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-sandalwood-600" />
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {enrollments
            .filter(e => e.payment?.status === 'completed')
            .sort((a, b) => new Date(b.payment?.paidAt) - new Date(a.payment?.paidAt))
            .slice(0, 10)
            .map((enrollment, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-sandalwood-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-semibold">
                    {enrollment.userId?.profile?.firstName?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-sandalwood-900">
                      {enrollment.userId?.profile?.firstName} {enrollment.userId?.profile?.lastName}
                    </p>
                    <p className="text-xs text-sandalwood-500">{formatDate(enrollment.payment?.paidAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(enrollment.payment?.amount || 0)}</p>
                  <p className="text-xs text-sandalwood-500 capitalize">{enrollment.enrollmentType?.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          {enrollments.filter(e => e.payment?.status === 'completed').length === 0 && (
            <p className="text-sandalwood-500 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Content Tab
const ContentTab = ({ course, courseId }) => {
  const units = course?.structure?.units || [];
  const [expandedUnit, setExpandedUnit] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sandalwood-900">Course Content</h3>
          <p className="text-sm text-sandalwood-500">
            {units.length} units • {units.reduce((acc, u) => acc + (u.lessons?.length || 0), 0)} lessons
          </p>
        </div>
        <Link
          to={`/courses/${courseId}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-sandalwood-600 text-white rounded-xl text-sm font-medium hover:bg-sandalwood-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit Content
        </Link>
      </div>

      {units.length > 0 ? (
        <div className="space-y-3">
          {units.map((unit, unitIndex) => (
            <div key={unit._id || unitIndex} className="bg-sandalwood-50 rounded-xl border border-sandalwood-100 overflow-hidden">
              <button
                onClick={() => setExpandedUnit(expandedUnit === unitIndex ? null : unitIndex)}
                className="w-full flex items-center justify-between p-4 hover:bg-sandalwood-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sandalwood-200 flex items-center justify-center font-bold text-sandalwood-700">
                    {unitIndex + 1}
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sandalwood-900">{unit.title || `Unit ${unitIndex + 1}`}</h4>
                    <p className="text-sm text-sandalwood-500">{unit.lessons?.length || 0} lessons</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-sandalwood-500 transition-transform ${expandedUnit === unitIndex ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {expandedUnit === unitIndex && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-sandalwood-100"
                  >
                    <div className="p-4 space-y-2">
                      {unit.lessons?.map((lesson, lessonIndex) => (
                        <div key={lesson._id || lessonIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-sandalwood-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-sandalwood-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sandalwood-900">{lesson.title || `Lesson ${lessonIndex + 1}`}</p>
                            <p className="text-xs text-sandalwood-500">{lesson.lectures?.length || 0} lectures</p>
                          </div>
                          <span className="text-xs text-sandalwood-500">
                            {lesson.duration ? `${lesson.duration} min` : ''}
                          </span>
                        </div>
                      ))}
                      {(!unit.lessons || unit.lessons.length === 0) && (
                        <p className="text-sm text-sandalwood-500 text-center py-4">No lessons in this unit</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sandalwood-50 rounded-2xl">
          <Layers className="w-16 h-16 text-sandalwood-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sandalwood-900 mb-2">No Content Yet</h3>
          <p className="text-sandalwood-500 mb-4">Start adding units and lessons to your course.</p>
          <Link
            to={`/courses/${courseId}/edit`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sandalwood-600 text-white rounded-xl font-medium hover:bg-sandalwood-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Add Content
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
