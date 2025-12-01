/**
 * Forgot Password Page
 * Request password reset email
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { MailIcon, KeyIcon } from '../../components/ui/Icons';
import authService from '../../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const { toast, hideToast, success, error: showError } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setEmailSent(true);
      success('Password reset email sent successfully!');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check Your Email 📧"
        subtitle={`We've sent a password reset link to ${email}`}
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
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-saffron-100 to-saffron-200 rounded-full flex items-center justify-center">
            <MailIcon className="w-12 h-12 text-saffron-500" size={48} />
          </div>

          {/* Info Box */}
          <div className="bg-ancient-100 rounded-2xl p-6 mb-8">
            <p className="text-ancient-700 text-sm">
              The link will expire in <span className="font-bold">10 minutes</span>. If you don't see the email,
              check your spam folder.
            </p>
          </div>

          {/* Back to Login Button */}
          <Link to="/auth/login">
            <Button fullWidth size="lg">
              Back to Login
            </Button>
          </Link>

          {/* Try Different Email */}
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="mt-6 text-saffron-600 hover:text-saffron-700 font-semibold transition-colors"
          >
            Try different email
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password? 🔒"
      subtitle="Enter your email and we'll send you a link to reset your password"
    >
      <Toast {...toast} onClose={hideToast} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-saffron-100 to-saffron-200 rounded-full flex items-center justify-center animate-float">
            <KeyIcon className="w-16 h-16 text-saffron-500" size={64} />
          </div>
        </div>

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          icon={<MailIcon />}
          error={error}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
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

export default ForgotPasswordPage;
