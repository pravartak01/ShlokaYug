import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Direct redirect to dashboard without any validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediately redirect to dashboard
    navigate('/dashboard');
    onSuccess?.();
  };

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
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            leftIcon={<User size={20} />}
            autoComplete="name"
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            leftIcon={<Mail size={20} />}
            autoComplete="email"
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
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
            autoComplete="new-password"
          />

          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Confirm your password"
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
            autoComplete="new-password"
          />

          <div className="space-y-2">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="mt-1 rounded border-ancient-300 text-saffron-500 focus:ring-saffron-500"
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
          >
            Create Account
          </Button>
        </form>

        <div className="text-center">
          <p className="text-ancient-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};