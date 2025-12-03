import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGuruAuth } from '../../context/GuruAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Calendar,
  Award,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Bell,
  ChevronRight,
  Clock,
  Star,
  Sparkles,
  Play,
  Video,
  MessageSquare,
  Flame,
  Target,
  GraduationCap,
  Menu,
  X,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Color constants matching mobile app
const COLORS = {
  // Sandalwood Brown Theme
  sandalwood: {
    50: '#faf5f0',
    100: '#f4e6d7',
    200: '#e8ccae',
    300: '#dab281',
    400: '#ca9554',
    500: '#c08552',
    600: '#a0704a',
    700: '#835941',
    800: '#6c4839',
    900: '#583b31',
  },
  // Ancient Theme
  ancient: {
    50: '#fdf6e3',
    100: '#faecc2',
    200: '#f5d780',
    300: '#eab834',
    400: '#d4940c',
    500: '#b8860b',
    600: '#996f0a',
    700: '#7a5708',
    800: '#5c4106',
    900: '#3d2b04',
  },
  // Saffron accent
  saffron: {
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
  },
};

const GuruDashboard = () => {
  const { user, logout } = useGuruAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
  });

  // Fetch real data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch comprehensive dashboard stats
        const dashboardResponse = await apiService.getInstructorDashboardStats();
        const data = dashboardResponse.data || {};
        const overview = data.overview || {};
        
        // Set stats from API
        setDashboardStats({
          totalCourses: overview.totalCourses || 0,
          publishedCourses: overview.publishedCourses || 0,
          totalStudents: overview.totalStudents || 0,
          totalEarnings: overview.totalRevenue || 0,
        });
        
        // Set recent enrollments from API
        const apiEnrollments = data.recentEnrollments || [];
        setRecentEnrollments(apiEnrollments.map(e => ({
          id: e._id,
          name: e.userId?.name || e.userId?.profile?.firstName || 'Student',
          course: e.courseId?.title || 'Unknown Course',
          avatar: (e.userId?.name || e.userId?.profile?.firstName || 'S')[0].toUpperCase(),
          time: formatTimeAgo(e.enrolledAt),
          progress: e.progress?.completionPercentage || 0,
        })));
        
        // Mock notifications (can be replaced with real API call later)
        setNotifications([
          { id: 1, type: 'enrollment', message: 'New student enrolled in your course', time: '2h ago', unread: true },
          { id: 2, type: 'review', message: 'You received a 5-star review!', time: '5h ago', unread: true },
          { id: 3, type: 'reminder', message: 'Live session starting in 1 hour', time: '1h ago', unread: false },
        ]);

        // Mock upcoming sessions (can be replaced with real API call later)
        setUpcomingSessions([
          { id: 1, title: 'Live Q&A Session', course: 'Vedic Prosody - Module 3', date: 'Tomorrow', time: '4:00 PM', attendees: 24 },
          { id: 2, title: 'Doubt Clearing Session', course: 'Chandas Shastra', date: 'Dec 5', time: '6:00 PM', attendees: 18 },
        ]);

        // Performance data from overview
        setPerformanceData({
          weeklyGrowth: 12.5,
          monthlyEarningsGrowth: 8.3,
          studentSatisfaction: overview.avgRating || 4.5,
          completionRate: overview.avgCompletionRate || 0,
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to basic course data
        try {
          const coursesResponse = await apiService.getMyCourses();
          const courses = coursesResponse.data?.courses || [];
          
          const totalCourses = courses.length;
          const publishedCourses = courses.filter(c => c.isPublished).length;
          const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
          
          setDashboardStats({
            totalCourses,
            publishedCourses,
            totalStudents,
            totalEarnings: 0,
          });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Dynamic stats from real API data
  const stats = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: dashboardStats.totalCourses,
      trend: performanceData?.weeklyGrowth || 0,
      trendUp: true,
      color: 'sandalwood',
    },
    {
      icon: Users,
      label: 'Total Students',
      value: dashboardStats.totalStudents,
      trend: 15.2,
      trendUp: true,
      color: 'ancient',
    },
    {
      icon: Eye,
      label: 'Published Courses',
      value: dashboardStats.publishedCourses,
      trend: 5,
      trendUp: true,
      color: 'saffron',
    },
    {
      icon: DollarSign,
      label: 'This Month',
      value: dashboardStats.totalEarnings,
      isAmount: true,
      trend: performanceData?.monthlyEarningsGrowth || 0,
      trendUp: (performanceData?.monthlyEarningsGrowth || 0) > 0,
      color: 'green',
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Create Course',
      description: 'Build a new Sanskrit course',
      link: '/courses/create',
      gradient: 'from-sandalwood-500 to-sandalwood-600',
    },
    {
      icon: BookOpen,
      label: 'My Courses',
      description: 'Manage your courses',
      link: '/courses',
      gradient: 'from-ancient-500 to-ancient-600',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View insights & stats',
      link: '/analytics',
      gradient: 'from-saffron-500 to-saffron-600',
    },
    {
      icon: Video,
      label: 'Go Live',
      description: 'Start a live session',
      link: '/live',
      gradient: 'from-red-500 to-red-600',
    },
  ];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sandalwood-600 animate-spin mx-auto mb-4" />
          <p className="text-sandalwood-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-sandalwood-200 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-sandalwood-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-sandalwood-500 to-sandalwood-700 rounded-2xl flex items-center justify-center shadow-lg shadow-sandalwood-200">
              <span className="text-white text-2xl font-bold">ॐ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-sandalwood-900">ShlokaYug</h1>
              <p className="text-xs text-sandalwood-500 font-medium">Guru Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={BarChart3} label="Dashboard" link="/dashboard" active />
          <NavItem icon={BookOpen} label="My Courses" link="/courses" badge={dashboardStats.totalCourses || null} />
          <NavItem icon={Users} label="Students" link="/students" />
          <NavItem icon={Video} label="Live Sessions" link="/live" />
          <NavItem icon={MessageSquare} label="Messages" link="/messages" badge={3} />
          <NavItem icon={DollarSign} label="Earnings" link="/earnings" />
          <NavItem icon={BarChart3} label="Analytics" link="/analytics" />
          <NavItem icon={Calendar} label="Schedule" link="/schedule" />
          <NavItem icon={Award} label="Achievements" link="/achievements" />
          
          <div className="pt-4 mt-4 border-t border-sandalwood-100">
            <NavItem icon={Settings} label="Settings" link="/settings" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>

        {/* Guru Profile Card */}
        <div className="p-4 border-t border-sandalwood-100">
          <div className="bg-linear-to-br from-sandalwood-50 to-sandalwood-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user?.profile?.firstName?.[0] || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sandalwood-900 truncate">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-sandalwood-600 truncate">
                  {user?.email || 'guru@shlokayug.com'}
                </p>
              </div>
            </div>
            {user?.guruProfile?.applicationStatus === 'approved' ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Guru
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Approval
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-sandalwood-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-sandalwood-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-sandalwood-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-sandalwood-500 to-sandalwood-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">ॐ</span>
            </div>
            <span className="font-bold text-sandalwood-900">ShlokaYug</span>
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-sandalwood-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-sandalwood-700" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto"
            >
              <div className="p-4 flex justify-between items-center border-b border-sandalwood-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-sandalwood-500 to-sandalwood-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">ॐ</span>
                  </div>
                  <span className="font-bold text-sandalwood-900">ShlokaYug</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-sandalwood-100"
                >
                  <X className="w-5 h-5 text-sandalwood-700" />
                </button>
              </div>
              {/* Mobile nav items - similar to desktop */}
              <nav className="p-4 space-y-1">
                <NavItem icon={BarChart3} label="Dashboard" link="/dashboard" active onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={BookOpen} label="My Courses" link="/courses" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Users} label="Students" link="/students" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Video} label="Live Sessions" link="/live" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={DollarSign} label="Earnings" link="/earnings" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Settings} label="Settings" link="/settings" onClick={() => setIsMobileMenuOpen(false)} />
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        {/* Top Bar - Desktop */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-sandalwood-100">
          <div>
            <p className="text-sandalwood-500 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-sandalwood-900">
              Welcome back, {user?.profile?.firstName || 'Guru'}! 
              <span className="ml-2">🙏</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-sandalwood-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, students..."
                className="w-72 pl-10 pr-4 py-2.5 bg-sandalwood-50 border border-sandalwood-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-sandalwood-50 hover:bg-sandalwood-100 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-sandalwood-700" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-sandalwood-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-sandalwood-100 flex items-center justify-between">
                      <h3 className="font-semibold text-sandalwood-900">Notifications</h3>
                      <span className="text-xs text-sandalwood-500">{notifications.filter(n => n.unread).length} new</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-sandalwood-50 hover:bg-sandalwood-50 transition-colors cursor-pointer ${notif.unread ? 'bg-sandalwood-50/50' : ''}`}
                        >
                          <p className="text-sm text-sandalwood-800">{notif.message}</p>
                          <p className="text-xs text-sandalwood-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/notifications"
                      className="block p-3 text-center text-sm font-medium text-sandalwood-600 hover:bg-sandalwood-50 transition-colors"
                    >
                      View all notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Quick Access */}
            <Link
              to="/profile"
              className="flex items-center gap-3 pl-4 pr-5 py-2 bg-sandalwood-50 hover:bg-sandalwood-100 rounded-xl transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.profile?.firstName?.[0] || 'G'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-sandalwood-900">{user?.profile?.firstName}</p>
                <p className="text-xs text-sandalwood-500">View Profile</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-sandalwood-100 hover:shadow-lg hover:border-sandalwood-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'sandalwood' ? 'bg-sandalwood-100 text-sandalwood-600' :
                    stat.color === 'ancient' ? 'bg-amber-100 text-amber-600' :
                    stat.color === 'saffron' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  } group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}%
                  </div>
                </div>
                <p className="text-sandalwood-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-sandalwood-900">
                  {stat.isAmount ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-sandalwood-900">Quick Actions</h2>
              <Link to="/courses/create" className="text-sm font-medium text-sandalwood-600 hover:text-sandalwood-800 flex items-center gap-1">
                Create Course <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    to={action.link}
                    className="block group"
                  >
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-sandalwood-100 hover:border-sandalwood-300 hover:shadow-lg transition-all h-full">
                      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-sandalwood-900 mb-1">{action.label}</h3>
                      <p className="text-sm text-sandalwood-500">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Enrollments */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-sandalwood-100 overflow-hidden"
            >
              <div className="p-5 lg:p-6 border-b border-sandalwood-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-sandalwood-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sandalwood-900">Recent Enrollments</h3>
                    <p className="text-xs text-sandalwood-500">{recentEnrollments.length} new this week</p>
                  </div>
                </div>
                <Link to="/students" className="text-sm font-medium text-sandalwood-600 hover:text-sandalwood-800">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-sandalwood-50">
                {recentEnrollments.length > 0 ? (
                  recentEnrollments.map((student) => (
                    <div key={student.id} className="p-4 lg:p-5 hover:bg-sandalwood-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sandalwood-400 to-sandalwood-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {student.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sandalwood-900 truncate">{student.name}</p>
                          <p className="text-sm text-sandalwood-500 truncate">{student.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-sandalwood-400">{student.time}</p>
                          <div className="mt-1 w-16 h-1.5 bg-sandalwood-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-sandalwood-400 to-sandalwood-600 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-sandalwood-200 mx-auto mb-3" />
                    <p className="text-sandalwood-500">No recent enrollments</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-sandalwood-100 overflow-hidden"
            >
              <div className="p-5 lg:p-6 border-b border-sandalwood-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sandalwood-900">Upcoming Sessions</h3>
                    <p className="text-xs text-sandalwood-500">{upcomingSessions.length} scheduled</p>
                  </div>
                </div>
                <Link to="/schedule" className="text-sm font-medium text-sandalwood-600 hover:text-sandalwood-800">
                  Manage
                </Link>
              </div>
              <div className="divide-y divide-sandalwood-50">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="p-4 lg:p-5 hover:bg-sandalwood-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sandalwood-900">{session.title}</p>
                          <p className="text-sm text-sandalwood-500 truncate">{session.course}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-sandalwood-600 bg-sandalwood-100 px-2 py-1 rounded-lg">
                              {session.date}, {session.time}
                            </span>
                            <span className="text-xs text-sandalwood-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {session.attendees} registered
                            </span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all">
                          Start
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-sandalwood-200 mx-auto mb-3" />
                    <p className="text-sandalwood-500 mb-3">No upcoming sessions</p>
                    <Link
                      to="/schedule/create"
                      className="inline-flex items-center gap-2 text-sm font-medium text-sandalwood-600 hover:text-sandalwood-800"
                    >
                      <Plus className="w-4 h-4" /> Schedule a Session
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Performance & Inspiration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-sandalwood-100 p-5 lg:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sandalwood-900">Performance Overview</h3>
                    <p className="text-xs text-sandalwood-500">This month's metrics</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <PerformanceCard
                  label="Student Satisfaction"
                  value={performanceData?.studentSatisfaction || 0}
                  suffix="/5"
                  icon={Star}
                  color="amber"
                />
                <PerformanceCard
                  label="Course Completion"
                  value={performanceData?.completionRate || 0}
                  suffix="%"
                  icon={Target}
                  color="green"
                />
                <PerformanceCard
                  label="Active Learners"
                  value={user?.guruProfile?.teachingStats?.totalStudents || 0}
                  icon={Flame}
                  color="orange"
                />
                <PerformanceCard
                  label="Total Lessons"
                  value={12}
                  icon={Play}
                  color="blue"
                />
              </div>
            </motion.div>

            {/* Inspiration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-linear-to-br from-sandalwood-500 to-sandalwood-700 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">Share Your Wisdom</h3>
                <p className="text-sm text-sandalwood-100 leading-relaxed mb-4 italic">
                  "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।"
                </p>
                <p className="text-xs text-sandalwood-200 mb-4">
                  The Guru is the creator, preserver, and transformer of knowledge.
                </p>
                <Link
                  to="/courses/create"
                  className="inline-flex items-center gap-2 bg-white text-sandalwood-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sandalwood-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Course
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 p-6 border-t border-sandalwood-100 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sandalwood-500 text-sm">
              © 2025 ShlokaYug • Preserving ancient wisdom through modern technology
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon: Icon, label, link, active, badge, onClick }) => (
  <Link
    to={link}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white shadow-lg shadow-sandalwood-200'
        : 'text-sandalwood-700 hover:bg-sandalwood-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
        active ? 'bg-white/20 text-white' : 'bg-sandalwood-100 text-sandalwood-600'
      }`}>
        {badge}
      </span>
    )}
  </Link>
);

// Performance Card Component
const PerformanceCard = ({ label, value, suffix = '', icon: Icon, color }) => {
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-sandalwood-50 rounded-xl p-4 text-center">
      <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-sandalwood-900">
        {value}{suffix}
      </p>
      <p className="text-xs text-sandalwood-500 mt-1">{label}</p>
    </div>
  );
};

export default GuruDashboard;
