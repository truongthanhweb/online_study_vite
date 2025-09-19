import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const { user } = useAuthStore();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EduConnect LMS
          </h1>
          <p className="text-gray-600">
            Nền tảng học trực tuyến hiện đại
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};
