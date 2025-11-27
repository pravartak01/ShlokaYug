import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-ancient-100 bg-ancient-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};