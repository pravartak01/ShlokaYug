/**
 * Register Page
 * New user registration with form validation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import {
  UserIcon,
  MailIcon,
  LockIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
} from '../../components/ui/Icons';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterData } from '../../types/auth';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast, hideToast, success, error: showError } = useToast();

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    preferredScript: 'devanagari',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    // Username: 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password: string): boolean => {
    // Password: At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, and number';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
      });

      success('Registration successful! 🎉 Please check your email to verify your account.');
      
      // Navigate to verify email page
      setTimeout(() => {
        navigate('/auth/verify-email');
      }, 2000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <AuthLayout
      title="Create Account 📿"
      subtitle="Join ShlokaYug to start your Sanskrit learning journey"
    >
      <Toast {...toast} onClose={hideToast} />

      <form onSubmit={handleRegister} className="space-y-1">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            icon={<UserIcon />}
            error={errors.firstName}
            autoComplete="given-name"
            disabled={isLoading}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            icon={<UserIcon />}
            error={errors.lastName}
            autoComplete="family-name"
            disabled={isLoading}
          />
        </div>

        {/* Email Input */}
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          icon={<MailIcon />}
          error={errors.email}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Username Input */}
        <Input
          label="Username"
          type="text"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
          icon={<AtSignIcon />}
          error={errors.username}
          autoComplete="username"
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          icon={<LockIcon />}
          rightIcon={showPassword ? <EyeIcon /> : <EyeOffIcon />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          error={errors.password}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: undefined });
            }
          }}
          icon={<LockIcon />}
          rightIcon={showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Password Requirements */}
        <div className="bg-ancient-100 rounded-xl p-4 mt-2">
          <p className="text-ancient-700 text-xs font-semibold mb-2">Password must contain:</p>
          <ul className="text-ancient-600 text-xs space-y-1">
            <li className="flex items-center gap-2">
              <span className={formData.password.length >= 8 ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/\d/.test(formData.password) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One number
            </li>
          </ul>
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Create Account
        </Button>

        {/* Terms and Privacy */}
        <p className="text-ancient-600 text-xs text-center mt-4">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-saffron-600 font-semibold hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-saffron-600 font-semibold hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Login Link */}
        <div className="text-center mt-6">
          <span className="text-ancient-600">Already have an account? </span>
          <Link
            to="/auth/login"
            className="text-saffron-600 hover:text-saffron-700 font-bold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
