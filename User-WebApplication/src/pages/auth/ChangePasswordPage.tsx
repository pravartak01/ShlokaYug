/**
 * Change Password Page
 * For logged in users to change their password
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { LockIcon, EyeIcon, EyeOffIcon, ShieldIcon } from '../../components/ui/Icons';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast, hideToast, success, error: showError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters with uppercase, lowercase, and number';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      success('Password changed successfully! ✅');
      
      // Clear form and navigate to profile/dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Change Password 🔐"
      subtitle="Update your account password"
    >
      <Toast {...toast} onClose={hideToast} />

      <form onSubmit={handleChangePassword} className="space-y-4">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-28 h-28 bg-gradient-to-br from-saffron-100 to-saffron-200 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldIcon className="w-14 h-14 text-saffron-500" size={56} />
          </motion.div>
        </div>

        {/* Current Password Input */}
        <Input
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
              setErrors({ ...errors, currentPassword: undefined });
            }
          }}
          icon={<LockIcon />}
          rightIcon={showCurrentPassword ? <EyeIcon /> : <EyeOffIcon />}
          onRightIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
          error={errors.currentPassword}
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ancient-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 text-ancient-500 text-xs">
              NEW PASSWORD
            </span>
          </div>
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
          label="Confirm New Password"
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

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Change Password
        </Button>

        {/* Cancel Link */}
        <div className="text-center mt-4">
          <Link
            to="/dashboard"
            className="text-ancient-600 hover:text-ancient-800 font-semibold transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ChangePasswordPage;
