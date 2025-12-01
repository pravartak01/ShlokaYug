/**
 * Login Page
 * User authentication page with email/username and password
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from '../../components/ui/Icons';
import { useAuth } from '../../hooks/useAuth';

interface FormErrors {
  identifier?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast, hideToast, success, error: showError } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate identifier (email or username)
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login({ identifier: identifier.trim(), password });
      success('Welcome back to ShlokaYug! 🙏');
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth implementation would go here
    showError('Google login coming soon!');
  };

  return (
    <AuthLayout
      title="Welcome Back 🙏"
      subtitle="Sign in to continue your Sanskrit learning journey"
    >
      <Toast {...toast} onClose={hideToast} />

      <form onSubmit={handleLogin} className="space-y-1">
        {/* Email/Username Input */}
        <Input
          label="Email or Username"
          type="text"
          placeholder="Enter your email or username"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (errors.identifier) {
              setErrors({ ...errors, identifier: undefined });
            }
          }}
          icon={<UserIcon />}
          error={errors.identifier}
          autoComplete="username"
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors({ ...errors, password: undefined });
            }
          }}
          icon={<LockIcon />}
          rightIcon={showPassword ? <EyeIcon /> : <EyeOffIcon />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          error={errors.password}
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-saffron-600 hover:text-saffron-700 font-semibold text-sm transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ancient-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 text-ancient-600">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-ancient-200 rounded-xl text-ancient-700 font-semibold hover:bg-ancient-50 hover:border-ancient-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <GoogleIcon size={24} />
          <span>Google</span>
        </motion.button>

        {/* Register Link */}
        <div className="text-center mt-8">
          <span className="text-ancient-600">Don't have an account? </span>
          <Link
            to="/auth/register"
            className="text-saffron-600 hover:text-saffron-700 font-bold transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
