import React from 'react';
import { Link } from 'react-router-dom';
import { useGuruAuth } from '../../context/GuruAuthContext';
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
} from 'lucide-react';

const GuruDashboard = () => {
  const { user, logout } = useGuruAuth();

  const stats = [
    {
      icon: <BookOpen size={24} />,
      label: 'Total Courses',
      value: user?.guruProfile?.teachingStats?.totalCourses || 0,
      color: 'text-amber-800',
      bgColor: 'bg-amber-100',
    },
    {
      icon: <Users size={24} />,
      label: 'Total Students',
      value: user?.guruProfile?.teachingStats?.totalStudents || 0,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
    },
    {
      icon: <Eye size={24} />,
      label: 'Published Courses',
      value: user?.guruProfile?.teachingStats?.publishedCourses || 0,
      color: 'text-amber-900',
      bgColor: 'bg-amber-100',
    },
    {
      icon: <DollarSign size={24} />,
      label: 'This Month Earnings',
      value: `₹${user?.guruProfile?.teachingStats?.thisMonthEarnings?.toLocaleString() || 0}`,
      color: 'text-amber-950',
      bgColor: 'bg-amber-100',
    },
  ];

  const quickActions = [
    {
      icon: <Plus size={20} />,
      label: 'Create New Course',
      description: 'Start building a new Sanskrit course',
      link: '/courses/create',
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: <BookOpen size={20} />,
      label: 'My Courses',
      description: 'View and manage your courses',
      link: '/courses',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Analytics',
      description: 'View detailed course analytics',
      link: '/analytics',
      color: 'text-amber-900',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: <Users size={20} />,
      label: 'Students',
      description: 'Manage enrolled students',
      link: '/students',
      color: 'text-amber-950',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E6C3] via-[#D6B278] via-[#BA8D54] to-[#BABD54]">
      {/* Main Content Container */}
      <div className="relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">ॐ</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-900">ShlokaYug</h1>
                  <p className="text-amber-700 text-sm">Guru Learning Management System</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-amber-900 font-semibold">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-amber-700 text-sm">
                    {user?.guruProfile?.applicationStatus === 'approved' ? (
                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Verified Guru
                      </span>
                    ) : (
                      <span className="text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs font-medium">
                        Pending Approval
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/settings"
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200 border border-transparent hover:border-amber-200"
                    title="Settings"
                  >
                    <Settings size={20} className="text-amber-700" />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200 border border-transparent hover:border-amber-200"
                    title="Logout"
                  >
                    <LogOut size={20} className="text-amber-800" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-amber-200 shadow-lg">
              <h2 className="text-3xl font-bold text-amber-900 mb-3">
                Welcome back, {user?.profile?.firstName}!
              </h2>
              <p className="text-amber-800 text-lg max-w-2xl mx-auto">
                Manage your Sanskrit prosody courses and inspire students on their learning journey.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} ${stat.bgColor} p-2 rounded-lg`}>
                    {stat.icon}
                  </div>
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <p className="text-amber-700 text-sm mb-1 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-amber-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-amber-900 mb-6 text-center">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="block group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-amber-300 h-full">
                    <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border ${action.borderColor}`}>
                      <div className={action.color}>{action.icon}</div>
                    </div>
                    <h4 className="text-amber-900 font-semibold mb-2 text-lg">{action.label}</h4>
                    <p className="text-amber-700 text-sm">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Enrollments */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-amber-900">Recent Enrollments</h3>
                <Link to="/students" className="text-amber-700 hover:text-amber-800 text-sm font-medium underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold shadow-md">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-900 font-semibold">Arjun Kumar</p>
                    <p className="text-amber-700 text-sm">Enrolled in Vedic Prosody</p>
                  </div>
                  <p className="text-amber-600 text-sm font-medium">2 days ago</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold shadow-md">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-900 font-semibold">Sita Devi</p>
                    <p className="text-amber-700 text-sm">Enrolled in Chandas Shastra</p>
                  </div>
                  <p className="text-amber-600 text-sm font-medium">5 days ago</p>
                </div>
                <div className="text-center py-6">
                  <p className="text-amber-600 text-sm italic">No recent enrollments</p>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-amber-900">Upcoming Sessions</h3>
                <Link to="/schedule" className="text-amber-700 hover:text-amber-800 text-sm font-medium underline">
                  Manage Schedule
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-amber-700 bg-amber-100 p-2 rounded-lg">
                    <Calendar size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-900 font-semibold">Live Q&A Session</p>
                    <p className="text-amber-700 text-sm">Vedic Prosody - Module 3</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-900 font-semibold text-sm">Tomorrow</p>
                    <p className="text-amber-600 text-sm">4:00 PM</p>
                  </div>
                </div>
                <div className="text-center py-6">
                  <p className="text-amber-600 text-sm italic mb-3">No upcoming sessions scheduled</p>
                  <Link to="/schedule/create" className="text-amber-700 hover:text-amber-800 text-sm font-medium underline">
                    Schedule a Session
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement/Motivation Section */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 text-center border border-amber-200 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-full shadow-lg">
                <Award size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">Share Your Knowledge</h3>
            <p className="text-amber-800 text-lg mb-4 italic">
              "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः॥"
            </p>
            <p className="text-amber-700 text-sm italic max-w-2xl mx-auto">
              The Guru is Brahma, Vishnu, and Maheshwara. The Guru is the Supreme Absolute itself.
              Salutations to that revered Guru.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-amber-200 mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-700 text-sm">
              © 2025 ShlokaYug Learning Management System. Preserving ancient wisdom through modern
              technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GuruDashboard;