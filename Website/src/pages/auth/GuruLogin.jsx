import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../context/GuruAuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const GuruLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useGuruAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.identifier || !formData.password) {
      setError('Please enter both email/username and password');
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen vintage-paper flex items-center justify-center px-4 py-12">
      {/* Ornamental Corners */}
      <div className="vintage-corner-ornament top-left" />
      <div className="vintage-corner-ornament top-right" />
      <div className="vintage-corner-ornament bottom-left" />
      <div className="vintage-corner-ornament bottom-right" />

      <div className="w-full max-w-md">
        <div className="vintage-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="vintage-om mb-4">ॐ</div>
            <h1 className="vintage-heading vintage-heading-md mb-2">
              Guru Portal
            </h1>
            <p className="vintage-text-sm">
              Welcome back to ShlokaYug Learning Management System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="vintage-alert vintage-alert-error flex items-center gap-2 mb-6">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="identifier" className="vintage-label">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="vintage-input w-full pl-12"
                  placeholder="Enter your email or username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="vintage-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="vintage-input w-full pl-12 pr-12"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded hover:text-vintage-sepia transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="vintage-link text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="vintage-btn w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="vintage-spinner w-5 h-5 border-2" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="vintage-divider my-8" />

          {/* Register Link */}
          <div className="text-center">
            <p className="vintage-text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="vintage-link">
                Apply as Guru
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-8 text-center">
          <p className="vintage-text-sm italic">
            "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः"
          </p>
          <p className="vintage-text-sm mt-2">
            The Guru is Brahma, Vishnu, and Maheshwara
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuruLogin;
