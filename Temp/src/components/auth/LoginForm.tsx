import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
    rememberMe: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({
        identifier: formData.identifier,
        password: formData.password
      });
      
      onSuccess?.();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="ancient" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-saffron-400 to-ancient-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-sanskrit text-white">ॐ</span>
        </div>
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">Welcome Back</h2>
        <p className="text-ancient-600 font-elegant">
          Continue your journey in Sanskrit prosody
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

          <Input
            type="text"
            label="Email or Username"
            placeholder="Enter your email or username"
            value={formData.identifier}
            onChange={(e) => handleInputChange('identifier', e.target.value)}
            leftIcon={<Mail size={20} />}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
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
            autoComplete="current-password"
            required
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="rounded border-ancient-300 text-saffron-500 focus:ring-saffron-500"
                disabled={isLoading}
              />
              <span className="text-sm text-ancient-600">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ancient-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-ancient-500">New to our platform?</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-ancient-600 text-center">
            <Link
              to="/register"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Create Student Account
            </Link>
          </p>
          <p className="text-ancient-600 text-center">
            <Link
              to="/guru/register"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Apply as Guru/Instructor
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};