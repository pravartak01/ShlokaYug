import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    preferredScript: 'devanagari' as const
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name');
      return false;
    }

    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredScript: formData.preferredScript
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        navigate('/login', { 
          state: { message: 'Registration successful! Please check your email to verify your account.' }
        });
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card variant="ancient" className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-ancient-800 mb-2">
            Registration Successful!
          </h3>
          <p className="text-ancient-600">
            Please check your email to verify your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="ancient" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-saffron-400 to-ancient-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-sanskrit text-white">ॐ</span>
        </div>
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">Create Account</h2>
        <p className="text-ancient-600 font-elegant">
          Begin your journey in Sanskrit prosody
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              label="First Name"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              leftIcon={<User size={20} />}
              autoComplete="given-name"
              required
              disabled={isLoading}
            />

            <Input
              type="text"
              label="Last Name"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              leftIcon={<User size={20} />}
              autoComplete="family-name"
              required
              disabled={isLoading}
            />
          </div>

          <Input
            type="text"
            label="Username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            leftIcon={<User size={20} />}
            autoComplete="username"
            required
            disabled={isLoading}
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            leftIcon={<Mail size={20} />}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password (min 8 characters)"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ancient-500 hover:text-ancient-700 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-ancient-500 hover:text-ancient-700 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 rounded border-ancient-300 text-saffron-500 focus:ring-saffron-500"
                disabled={isLoading}
              />
              <span className="text-sm text-ancient-600 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-saffron-600 hover:text-saffron-500 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-saffron-600 hover:text-saffron-500 underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ancient-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-ancient-500">Already have an account?</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-ancient-600 text-center">
            <Link
              to="/login"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <p className="text-ancient-600 text-center text-sm">
            Want to teach on our platform?{' '}
            <Link
              to="/guru/register"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Apply as Guru
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};