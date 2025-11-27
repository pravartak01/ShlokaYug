import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { ResetPasswordFormData } from '../../types';

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await resetPassword(token, data.password);
      
      setSuccess('Password reset successful! You can now sign in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card variant="ancient" className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <Alert variant="error">
            Invalid or missing reset token. Please request a new password reset.
          </Alert>
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
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">Set New Password</h2>
        <p className="text-ancient-600 font-elegant">
          Enter your new password below
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
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="Enter your new password"
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-ancient-500 hover:text-ancient-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              error={errors.password?.message}
              autoComplete="new-password"
            />

            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              placeholder="Confirm your new password"
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-ancient-500 hover:text-ancient-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};