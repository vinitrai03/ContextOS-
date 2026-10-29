import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';
import apiClient from '../services/apiClient';
import {
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
  BoxReveal,
  BottomGradient,
  iconsArray,
} from '../components/ui/auth-page';
import { Button } from '../components/ui/button';
import { Sparkles, Shield, UserCheck, ArrowLeft } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@contextos.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      // Offline / Demo fallback
      console.warn('Backend unavailable, using client demo session');
      login(email, email.includes('admin') ? 'ADMIN' : 'PARTICIPANT');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: Role) => {
    const demoEmail = role === 'ADMIN' ? 'admin@contextos.local' : 'participant@contextos.local';
    login(demoEmail, role);
    navigate('/dashboard');
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to access your ContextOS workspace',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'admin@contextos.local',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: '••••••••',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      },
    ],
    submitButton: loading ? 'Signing in...' : 'Sign In',
    textVariantButton: 'Forgot password?',
    errorField: error || undefined,
  };

  return (
    <section className="flex min-h-screen w-full bg-background overflow-hidden relative">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg border border-border bg-surface/50 backdrop-blur transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Left side: Tech Orbit with Meeting Platform Logos and Ripple */}
      <div className="flex flex-col justify-center items-center w-1/2 relative max-lg:hidden border-r border-border/40 bg-surface/30">
        <Ripple mainCircleSize={120} numCircles={8} />
        <TechOrbitDisplay iconsArray={iconsArray} text="ContextOS" />
      </div>

      {/* Right side: Animated Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 md:p-12 z-10">
        <div className="w-full max-w-md space-y-6">
          <AnimatedForm
            {...formFields}
            fieldPerRow={1}
            onSubmit={handleLogin}
            goTo={() => alert('Password reset link sent to registered email.')}
            googleLogin="Continue with Google"
          />

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-text-muted text-center mb-3 font-medium uppercase tracking-wider">
              Or Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('ADMIN')}
                className="w-full flex items-center justify-center gap-2 border-indigo-500/30 hover:border-indigo-500/60"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs">Admin Demo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('PARTICIPANT')}
                className="w-full flex items-center justify-center gap-2 border-cyan-500/30 hover:border-cyan-500/60"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs">User Demo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
