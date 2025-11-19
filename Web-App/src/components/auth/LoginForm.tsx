import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">Welcome Back</h2>
        <p className="text-ancient-600 font-elegant">
          Continue your journey in Sanskrit prosody
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Enter your password"
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
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-ancient-300 text-saffron-500 focus:ring-saffron-500"
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
          >
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <p className="text-ancient-600">
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