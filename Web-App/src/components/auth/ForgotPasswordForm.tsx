import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { ForgotPasswordFormData } from '../../types';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await forgotPassword(data.email);
      
      setSuccess('Password reset email sent! Please check your inbox.');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">Reset Password</h2>
        <p className="text-ancient-600 font-elegant">
          Enter your email to receive a password reset link
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              leftIcon={<Mail size={20} />}
              error={errors.email?.message}
              autoComplete="email"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center space-y-2">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
          
          <p className="text-ancient-600 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};