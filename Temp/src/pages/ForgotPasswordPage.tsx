import React from 'react';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  const handleSuccess = () => {
    // Stay on the same page to show success message
    // User can navigate back to login manually
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 bg-ancient-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};