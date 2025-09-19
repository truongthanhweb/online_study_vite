import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader
        title="Đăng nhập"
        subtitle="Chào mừng bạn quay trở lại"
      />
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={Mail}
            iconPosition="left"
            autoComplete="email"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={Lock}
              iconPosition="left"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-sm text-danger-600 bg-danger-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Đăng nhập
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
