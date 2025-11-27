import React from 'react';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 bg-ancient-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
};