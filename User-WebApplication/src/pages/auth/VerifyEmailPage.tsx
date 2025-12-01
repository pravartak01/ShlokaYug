/**
 * Verify Email Page
 * Verify email address with token or resend verification
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { MailIcon, CheckCircleIcon, XCircleIcon } from '../../components/ui/Icons';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshUser } = useAuth();
  const { toast, hideToast, success, error: showError } = useToast();

  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setVerificationStatus('verifying');
    setErrorMessage('');

    try {
      await authService.verifyEmail(verificationToken);
      setVerificationStatus('success');
      success('Email verified successfully! ✅');

      // Refresh user data to update verification status
      if (user) {
        await refreshUser();
      }

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setVerificationStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Verification failed');
      showError(err instanceof Error ? err.message : 'Verification failed');
    }
  }, [user, refreshUser, navigate, success, showError]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      await authService.resendVerification();
      success('Verification email sent! 📧 Please check your inbox.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleSkipForNow = () => {
    navigate('/dashboard');
  };

  // Verifying state
  if (verificationStatus === 'verifying') {
    return (
      <AuthLayout
        title="Verifying..."
        subtitle="Please wait while we verify your email"
        showBackButton={false}
      >
        <Toast {...toast} onClose={hideToast} />
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            className="w-16 h-16 border-4 border-saffron-200 border-t-saffron-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-ancient-600 mt-6 text-lg">Verifying your email...</p>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <AuthLayout
        title="Email Verified! ✅"
        subtitle="Your email has been successfully verified"
        showBackButton={false}
      >
        <Toast {...toast} onClose={hideToast} />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-green-500" size={48} />
          </div>

          <p className="text-ancient-600 mb-8">
            You're all set! Redirecting to your dashboard...
          </p>

          <Link to="/dashboard">
            <Button fullWidth size="lg">
              Continue to Dashboard
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <AuthLayout
        title="Verification Failed ❌"
        subtitle={errorMessage || 'The verification link is invalid or has expired'}
        showBackButton={false}
      >
        <Toast {...toast} onClose={hideToast} />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Error Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <XCircleIcon className="w-12 h-12 text-red-500" size={48} />
          </div>

          {/* Info Box */}
          <div className="bg-ancient-100 rounded-2xl p-6 mb-8">
            <p className="text-ancient-700 text-sm">
              Please request a new verification link to verify your email address.
            </p>
          </div>

          <Button
            onClick={handleResendVerification}
            isLoading={isResending}
            fullWidth
            size="lg"
          >
            Resend Verification Email
          </Button>

          <Link to="/auth/login" className="block mt-4">
            <Button variant="ghost" fullWidth>
              Back to Login
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  // Default pending state (no token, waiting for user to check email)
  return (
    <AuthLayout
      title="Verify Your Email 📧"
      subtitle={user?.email ? `We've sent a verification email to ${user.email}` : 'Please check your email for verification link'}
      showBackButton={false}
    >
      <Toast {...toast} onClose={hideToast} />

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Email Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-saffron-100 to-saffron-200 rounded-full flex items-center justify-center animate-bounce-gentle">
          <MailIcon className="w-12 h-12 text-saffron-500" size={48} />
        </div>

        {/* User Email Display */}
        {user?.email && (
          <p className="text-lg font-semibold text-ancient-800 mb-6">
            {user.email}
          </p>
        )}

        {/* Info Box */}
        <div className="bg-ancient-100 rounded-2xl p-6 mb-8">
          <p className="text-ancient-700 text-sm">
            Check your inbox and click the verification link. Don't forget to check your spam folder!
          </p>
        </div>

        {/* Resend Verification Button */}
        {user && !user.isEmailVerified && (
          <Button
            onClick={handleResendVerification}
            isLoading={isResending}
            fullWidth
            size="lg"
            className="mb-4"
          >
            Resend Verification Email
          </Button>
        )}

        {/* Skip Button */}
        {user && (
          <button
            onClick={handleSkipForNow}
            className="text-ancient-600 hover:text-ancient-800 font-semibold transition-colors"
            disabled={isResending}
          >
            Skip for now
          </button>
        )}

        {/* Back to Login (if not logged in) */}
        {!user && (
          <Link to="/auth/login">
            <Button variant="ghost" fullWidth>
              Back to Login
            </Button>
          </Link>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
