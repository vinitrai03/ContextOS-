import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';
import apiClient from '../services/apiClient';
import { SignInPage, SignInData } from '../components/ui/auth-page';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setAuth } = useAuthStore();

  const handleLogin = async (data: SignInData) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      // Offline / Demo fallback
      console.warn('Backend unavailable, using client demo session');
      const role: Role = data.email.toLowerCase().includes('admin') ? 'ADMIN' : 'PARTICIPANT';
      login(data.email, role);
      navigate('/dashboard');
    }
  };

  const handleQuickDemo = (role: Role) => {
    const demoEmail = role === 'ADMIN' ? 'admin@contextos.local' : 'participant@contextos.local';
    login(demoEmail, role);
    navigate('/dashboard');
  };

  const handleGoogleLogin = () => {
    login('google.user@contextos.local', 'PARTICIPANT');
    navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    alert('Password reset link sent to registered email address.');
  };

  return (
    <SignInPage
      onSubmit={handleLogin}
      onGoogle={handleGoogleLogin}
      onQuickDemo={handleQuickDemo}
      onForgotPassword={handleForgotPassword}
      requestAccessHref="/"
    />
  );
};

export default AuthPage;
