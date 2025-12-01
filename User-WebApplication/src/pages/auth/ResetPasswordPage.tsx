/**
 * Reset Password Page
 * Set new password using reset token
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { LockIcon, EyeIcon, EyeOffIcon, ShieldIcon } from '../../components/ui/Icons';
import authService from '../../services/authService';

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast, hideToast, success, error: showError } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!token) {
      showError('Invalid or expired reset link. Please request a new one.');
      setTimeout(() => {
        navigate('/auth/forgot-password');
      }, 3000);
    }
  }, [token, navigate, showError]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters with uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Invalid reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.resetPassword({
        token,
        newPassword,
      });

      success('Password reset successful! ✅ You can now login with your new password.');
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is invalid or has expired"
        showBackButton={false}
      >
        <Toast {...toast} onClose={hideToast} />
        <div className="text-center">
          <p className="text-ancient-600 mb-6">Redirecting to forgot password page...</p>
          <Link to="/auth/forgot-password">
            <Button variant="outline" fullWidth>
              Request New Link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password 🔐"
      subtitle="Please enter your new password"
      showBackButton={false}
    >
      <Toast {...toast} onClose={hideToast} />

      <form onSubmit={handleResetPassword} className="space-y-4">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-saffron-100 to-saffron-200 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldIcon className="w-16 h-16 text-saffron-500" size={64} />
          </motion.div>
        </div>

        {/* New Password Input */}
        <Input
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) {
              setErrors({ ...errors, newPassword: undefined });
            }
          }}
          icon={<LockIcon />}
          rightIcon={showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
          onRightIconClick={() => setShowNewPassword(!showNewPassword)}
          error={errors.newPassword}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Password Requirements */}
        <div className="bg-ancient-100 rounded-xl p-4">
          <p className="text-ancient-700 text-xs font-semibold mb-2">Password must contain:</p>
          <ul className="text-ancient-600 text-xs space-y-1">
            <li className="flex items-center gap-2">
              <span className={newPassword.length >= 8 ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/\d/.test(newPassword) ? 'text-green-500' : 'text-ancient-400'}>
                ✓
              </span>
              One number
            </li>
          </ul>
        </div>

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
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

        {/* Reset Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Reset Password
        </Button>

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <span className="text-ancient-600">Remember your password? </span>
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

export default ResetPasswordPage;
