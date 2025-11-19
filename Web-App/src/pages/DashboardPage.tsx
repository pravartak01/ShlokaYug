import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, getSanskritGreeting, getTimeOfDay, getMotivationalQuote } from '../utils/helpers';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const timeOfDay = getTimeOfDay();
  const sanskritGreeting = getSanskritGreeting(timeOfDay);
  const quote = getMotivationalQuote();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 bg-ancient-pattern">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-ancient-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-ancient-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-sanskrit text-white">ॐ</span>
              </div>
              <h1 className="text-xl font-bold text-ancient-800 font-ancient">ShlokaYug</h1>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={getAvatarUrl(user)}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-ancient-700 font-medium">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-ancient-800 font-ancient">
              {sanskritGreeting}, {user.name}
            </h2>
            <p className="text-ancient-600 font-elegant max-w-2xl mx-auto">
              Welcome to ShlokaYug - your Sanskrit prosody learning dashboard. Continue your journey in understanding the beautiful meters of classical Sanskrit poetry.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="ancient">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-saffron-600 font-ancient">
                  {user.profile.learningProgress.shlokasCompleted}
                </div>
                <div className="text-ancient-600 font-elegant mt-2">Shlokas Completed</div>
              </CardContent>
            </Card>

            <Card variant="ancient">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-saffron-600 font-ancient">
                  {user.profile.learningProgress.accuracy}%
                </div>
                <div className="text-ancient-600 font-elegant mt-2">Accuracy</div>
              </CardContent>
            </Card>

            <Card variant="ancient">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-saffron-600 font-ancient">
                  {user.profile.learningProgress.streakDays}
                </div>
                <div className="text-ancient-600 font-elegant mt-2">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Quote */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-ancient-800 font-ancient">Daily Inspiration</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xl font-sanskrit text-ancient-800 text-center">
                {quote.sanskrit}
              </div>
              <div className="text-ancient-600 italic text-center">
                {quote.transliteration}
              </div>
              <div className="text-ancient-700 font-medium text-center">
                "{quote.translation}"
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="ancient">
              <CardHeader>
                <h3 className="text-lg font-semibold text-ancient-800 font-ancient">Practice</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-ancient-600">
                  Identify the meter of Sanskrit shlokas and improve your accuracy.
                </p>
                <Button className="w-full">
                  Start Practice Session
                </Button>
              </CardContent>
            </Card>

            <Card variant="ancient">
              <CardHeader>
                <h3 className="text-lg font-semibold text-ancient-800 font-ancient">Learn</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-ancient-600">
                  Study different chandas meters and their patterns.
                </p>
                <Button variant="secondary" className="w-full">
                  Browse Lessons
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Section */}
          <Card variant="ancient">
            <CardHeader>
              <h3 className="text-lg font-semibold text-ancient-800 font-ancient">Your Profile</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-ancient-600 font-medium">Learning Level</label>
                  <div className="text-ancient-800 font-semibold capitalize">
                    {user.profile.level}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-ancient-600 font-medium">Preferred Language</label>
                  <div className="text-ancient-800 font-semibold capitalize">
                    {user.profile.preferences.language}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-ancient-600 font-medium">Email Verified</label>
                  <div className={`font-semibold ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-ancient-600 font-medium">Member Since</label>
                  <div className="text-ancient-800 font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/profile">
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};