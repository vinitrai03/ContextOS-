import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  ChevronLeftIcon,
  AtSignIcon,
  Lock,
  Sparkles,
  Shield,
  User as UserIcon,
  CheckCircle,
  Grid2x2PlusIcon
} from 'lucide-react';
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
      await apiClient.post('/auth/register', { name: 'Admin User', email: 'admin@contextos.local', password: 'admin123', role: 'ADMIN' }).catch(() => { });
      const res = await apiClient.post('/auth/login', { email: 'admin@contextos.local', password: 'admin123' });
      const { token, refreshToken, ...user } = res.data;
      setAuth(user, token, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
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
      await apiClient.post('/auth/register', { name: 'Participant User', email: 'alice@example.com', password: 'password', role: 'PARTICIPANT' }).catch(() => { });
      const res = await apiClient.post('/auth/login', { email: 'alice@example.com', password: 'password' });
      const { token, refreshToken, ...user } = res.data;
      setAuth(user, token, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      login('alice@example.com', 'PARTICIPANT');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-background text-text-primary">
      {/* Left Pane - Animated Visuals & Testimonial */}
      <div className="bg-surface/40 relative hidden h-full flex-col border-r border-border p-10 lg:flex overflow-hidden">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent opacity-80" />

        {/* Brand header */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-DEFAULT via-brand-accent to-brand-cyan flex items-center justify-center text-white font-extrabold shadow-glow-indigo text-lg">
            C
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-gradient">ContextOS</span>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Organizational Context Layer</p>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="z-10 mt-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-semibold text-brand-cyan">
            <Sparkles className="w-3.5 h-3.5" /> B.Tech Capstone Project
          </div>
          <blockquote className="space-y-2">
            <p className="text-xl text-text-primary font-medium leading-relaxed">
              &ldquo;ContextOS automatically turns all video meetings, emails, and commitments into a single searchable knowledge graph.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-brand-DEFAULT">
              ~ Unified Organizational Context Layer
            </footer>
          </blockquote>
        </div>

        {/* Ambient Floating Paths */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 md:p-12 overflow-y-auto">
        {/* Radial ambient background */}
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60 pointer-events-none"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
        </div>

        {/* Back to Home Button */}
        <Button
          variant="ghost"
          className="absolute top-7 left-6 text-text-secondary hover:text-text-primary"
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon className="size-4 mr-2" />
          Home
        </Button>

        <div className="mx-auto w-full max-w-sm space-y-5 pt-12 md:pt-0">
          {/* Mobile brand badge */}
          <div className="flex items-center gap-2 lg:hidden mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-DEFAULT to-brand-cyan flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <p className="text-lg font-bold text-gradient">ContextOS</p>
          </div>

          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {isLogin ? 'Sign In to ContextOS' : 'Create ContextOS Account'}
            </h1>
            <p className="text-text-secondary text-sm">
              {isLogin ? 'Access unified meeting memory, tasks & decisions.' : 'Join your team’s organizational context space.'}
            </p>
          </div>

          {/* 1-Click Demo Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="glow"
              size="lg"
              className="w-full text-sm font-semibold justify-center"
              onClick={handleQuickDemoAdmin}
              disabled={loading}
            >
              <Shield className="size-4 mr-2" />
              Demo Quick Login as Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full text-sm font-semibold justify-center"
              onClick={handleQuickDemoParticipant}
              disabled={loading}
            >
              <UserIcon className="size-4 mr-2" />
              Demo Quick Login as Member
            </Button>
          </div>

          <AuthSeparator />

          {/* Social Icons Quick Logins */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleQuickDemoAdmin}
            >
              <GoogleIcon className="size-3.5 mr-2" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleQuickDemoParticipant}
            >
              <GithubIcon className="size-3.5 mr-2" />
              GitHub
            </Button>
          </div>

          {/* Toggle between Login and Register */}
          <div className="flex p-1 bg-surface-hover/70 border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${isLogin ? 'bg-surface shadow text-brand-DEFAULT font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${!isLogin ? 'bg-surface shadow text-brand-DEFAULT font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-medium">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhed Tyagi"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-medium">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-9"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <AtSignIcon className="size-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-medium">Password</label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <Lock className="size-4" />
                </div>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1.5 h-1.5 w-full">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all ${pwdStrength > step ? strengthColors[pwdStrength] : 'bg-surface-hover'
                        }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-muted">
                  <span>Strength: {strengthLabels[pwdStrength]}</span>
                  <span>Role: {role}</span>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              {isLogin ? 'Continue with Email' : 'Create Free Account'}
            </Button>
          </form>

          <p className="text-text-muted text-center text-xs">
            By clicking continue, you agree to our{' '}
            <a href="#" className="hover:text-brand-DEFAULT underline underline-offset-4">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="hover:text-brand-DEFAULT underline underline-offset-4">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
};

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(99,102,241,${0.1 + i * 0.02})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-brand-DEFAULT"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.15 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669 C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62 c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401 c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);

const GithubIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center my-1">
      <div className="bg-border h-px w-full" />
      <span className="text-text-muted px-2 text-[10px] uppercase font-semibold">OR</span>
      <div className="bg-border h-px w-full" />
    </div>
  );
};

export default AuthPage;
