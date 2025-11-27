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
      color: 'vintage-sepia',
    },
    {
      icon: <Users size={24} />,
      label: 'Total Students',
      value: user?.guruProfile?.teachingStats?.totalStudents || 0,
      color: 'vintage-gold',
    },
    {
      icon: <Eye size={24} />,
      label: 'Published Courses',
      value: user?.guruProfile?.teachingStats?.publishedCourses || 0,
      color: 'vintage-amber',
    },
    {
      icon: <DollarSign size={24} />,
      label: 'This Month Earnings',
      value: `₹${user?.guruProfile?.teachingStats?.thisMonthEarnings?.toLocaleString() || 0}`,
      color: 'vintage-burgundy',
    },
  ];

  const quickActions = [
    {
      icon: <Plus size={20} />,
      label: 'Create New Course',
      description: 'Start building a new Sanskrit course',
      link: '/courses/create',
      color: 'vintage-sepia',
    },
    {
      icon: <BookOpen size={20} />,
      label: 'My Courses',
      description: 'View and manage your courses',
      link: '/courses',
      color: 'vintage-gold',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Analytics',
      description: 'View detailed course analytics',
      link: '/analytics',
      color: 'vintage-amber',
    },
    {
      icon: <Users size={20} />,
      label: 'Students',
      description: 'Manage enrolled students',
      link: '/students',
      color: 'vintage-burgundy',
    },
  ];

  return (
    <div className="min-h-screen vintage-paper">
      {/* Header */}
      <header className="bg-vintage-paper-light border-b-2 border-vintage-aged sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="vintage-om text-3xl">ॐ</div>
              <div>
                <h1 className="vintage-heading vintage-heading-sm">ShlokaYug</h1>
                <p className="vintage-text-sm">Guru Learning Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="vintage-text font-semibold">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="vintage-text-sm">
                  {user?.guruProfile?.applicationStatus === 'approved' ? (
                    <span className="text-green-600">✓ Verified Guru</span>
                  ) : (
                    <span className="text-vintage-amber">Pending Approval</span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/settings"
                  className="p-2 hover:bg-vintage-aged rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings size={20} className="text-vintage-sepia" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-vintage-aged rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} className="text-vintage-burgundy" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="vintage-heading vintage-heading-md mb-2">
            Welcome back, {user?.profile?.firstName}!
          </h2>
          <p className="vintage-text">
            Manage your Sanskrit prosody courses and inspire students on their learning journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="vintage-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`text-${stat.color}`}>{stat.icon}</div>
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <p className="vintage-text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-vintage-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="vintage-heading vintage-heading-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="vintage-card p-6 hover:shadow-lg transition-shadow group"
              >
                <div className={`w-12 h-12 rounded-full bg-${action.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`text-${action.color}`}>{action.icon}</div>
                </div>
                <h4 className="vintage-label mb-2">{action.label}</h4>
                <p className="vintage-text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <div className="vintage-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="vintage-heading vintage-heading-sm">Recent Enrollments</h3>
              <Link to="/students" className="vintage-link text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-vintage-paper-light rounded-lg">
                <div className="w-10 h-10 rounded-full bg-vintage-sepia text-white flex items-center justify-center font-bold">
                  A
                </div>
                <div className="flex-1">
                  <p className="vintage-text font-semibold">Arjun Kumar</p>
                  <p className="vintage-text-sm">Enrolled in Vedic Prosody</p>
                </div>
                <p className="vintage-text-sm">2 days ago</p>
              </div>
              <div className="flex items-center gap-4 p-3 bg-vintage-paper-light rounded-lg">
                <div className="w-10 h-10 rounded-full bg-vintage-gold text-white flex items-center justify-center font-bold">
                  S
                </div>
                <div className="flex-1">
                  <p className="vintage-text font-semibold">Sita Devi</p>
                  <p className="vintage-text-sm">Enrolled in Chandas Shastra</p>
                </div>
                <p className="vintage-text-sm">5 days ago</p>
              </div>
              <div className="text-center py-4">
                <p className="vintage-text-sm italic">No recent enrollments</p>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="vintage-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="vintage-heading vintage-heading-sm">Upcoming Sessions</h3>
              <Link to="/schedule" className="vintage-link text-sm">
                Manage Schedule
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-vintage-paper-light rounded-lg">
                <div className="text-vintage-sepia">
                  <Calendar size={24} />
                </div>
                <div className="flex-1">
                  <p className="vintage-text font-semibold">Live Q&A Session</p>
                  <p className="vintage-text-sm">Vedic Prosody - Module 3</p>
                </div>
                <div className="text-right">
                  <p className="vintage-text-sm font-semibold">Tomorrow</p>
                  <p className="vintage-text-sm">4:00 PM</p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="vintage-text-sm italic">No upcoming sessions scheduled</p>
                <Link to="/schedule/create" className="vintage-link text-sm mt-2 inline-block">
                  Schedule a Session
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement/Motivation Section */}
        <div className="mt-8 vintage-card p-8 text-center">
          <div className="flex justify-center mb-4">
            <Award size={48} className="text-vintage-gold" />
          </div>
          <h3 className="vintage-heading vintage-heading-sm mb-2">Share Your Knowledge</h3>
          <p className="vintage-text mb-4">
            "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः॥"
          </p>
          <p className="vintage-text-sm italic">
            The Guru is Brahma, Vishnu, and Maheshwara. The Guru is the Supreme Absolute itself.
            Salutations to that revered Guru.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-vintage-paper-light border-t-2 border-vintage-aged mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="vintage-text-sm">
            © 2025 ShlokaYug Learning Management System. Preserving ancient wisdom through modern
            technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GuruDashboard;
