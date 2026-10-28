import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Shield, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';
import apiClient from '../services/apiClient';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setAuth, isDemoMode } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@contextos.local');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('Abhed Tyagi');
  const [role, setRole] = useState<Role>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password strength logic
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdStrength = calculatePasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Unbreakable'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-brand-DEFAULT'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isDemoMode) {
        // Fallback demo login
        login(email, role);
        navigate('/dashboard');
        return;
      }

      if (isLogin) {
        const res = await apiClient.post('/auth/login', { email, password });
        const { token, refreshToken, ...user } = res.data;
        setAuth(user, token, refreshToken);
      } else {
        await apiClient.post('/auth/register', { name, email, password, role });
        const res = await apiClient.post('/auth/login', { email, password });
        const { token, refreshToken, ...user } = res.data;
        setAuth(user, token, refreshToken);
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (!err.response || err.message?.includes('Network')) {
        // Seamless fallback for Vercel / offline preview
        login(email, role);
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setEmail('admin@contextos.local');
    setPassword('admin123');
    setRole('ADMIN');
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { name: 'Admin User', email: 'admin@contextos.local', password: 'admin123', role: 'ADMIN' }).catch(() => {});
      const res = await apiClient.post('/auth/login', { email: 'admin@contextos.local', password: 'admin123' });
      const { token, refreshToken, ...user } = res.data;
      setAuth(user, token, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      // Fallback demo login for Vercel / offline mode
      login('admin@contextos.local', 'ADMIN');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoParticipant = async () => {
    setEmail('alice@example.com');
    setPassword('password');
    setRole('PARTICIPANT');
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { name: 'Participant User', email: 'alice@example.com', password: 'password', role: 'PARTICIPANT' }).catch(() => {});
      const res = await apiClient.post('/auth/login', { email: 'alice@example.com', password: 'password' });
      const { token, refreshToken, ...user } = res.data;
      setAuth(user, token, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      // Fallback demo login for Vercel / offline mode
      login('alice@example.com', 'PARTICIPANT');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left Split Banner - Branding & Architecture Showcase */}
      <div className="md:w-1/2 bg-gradient-to-br from-brand-DEFAULT/20 via-surface to-background border-b md:border-b-0 md:border-r border-border p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-DEFAULT/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-brand-cyan/20 blur-[90px] rounded-full pointer-events-none" />

        <div className="space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-DEFAULT to-brand-cyan flex items-center justify-center text-white font-extrabold shadow-glow-indigo text-xl">
              C
            </div>
            <span className="text-2xl font-extrabold text-gradient">ContextOS</span>
          </div>
          <Badge variant="cyan" size="sm">JWT Auth & Role-Based Access Control</Badge>
        </div>

        <div className="my-12 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Unified Organizational Intelligence & Meeting Automation.
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            Securely access your team's meetings, WebRTC conferencing, task Kanban, decisions, and RAG knowledge assistant.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-text-primary">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Role-Based Access Control (Admin Host vs Participant)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-primary">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>JWT Bearer Token Authentication & Refresh Sessions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-primary">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Full Offline Demo Mode Compatibility</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>B.Tech CS Capstone Project</span>
          <span>ContextOS Security v1.0</span>
        </div>
      </div>

      {/* Right Split - Form Section */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center relative">
        <GlassCard className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-surface p-1 border border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isLogin ? 'bg-brand-DEFAULT text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isLogin ? 'bg-brand-DEFAULT text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Register
            </button>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-text-primary">
              {isLogin ? 'Welcome Back to ContextOS' : 'Create Account'}
            </h3>
            <p className="text-xs text-text-muted">
              {isLogin ? 'Enter your credentials or click Quick Demo Login' : 'Fill in details to register a new user'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon className="w-4 h-4 text-text-muted" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="user@contextos.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-text-muted" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-text-muted" />}
              required
            />

            {/* Password Strength Meter */}
            {!isLogin && password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-text-muted">
                  <span>Password Strength</span>
                  <span className="font-semibold">{strengthLabels[pwdStrength]}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all ${
                        idx < pwdStrength ? strengthColors[pwdStrength] : 'bg-surface-hover'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex flex-col gap-1 transition-all ${
                    role === 'ADMIN'
                      ? 'bg-brand-DEFAULT/15 border-brand-DEFAULT text-brand-DEFAULT'
                      : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin (Host)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PARTICIPANT')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex flex-col gap-1 transition-all ${
                    role === 'PARTICIPANT'
                      ? 'bg-brand-DEFAULT/15 border-brand-DEFAULT text-brand-DEFAULT'
                      : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Participant</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-[11px] font-semibold text-text-muted text-center uppercase tracking-wider">
              Offline Demo Mode Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickDemoAdmin}
                icon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              >
                Login as Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickDemoParticipant}
                icon={<UserIcon className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Login as Participant
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
