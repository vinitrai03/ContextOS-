'use client';

import React, { FormEvent, ReactNode, useState } from 'react';
import { Eye, EyeOff, Shield, UserCheck } from 'lucide-react';

// ==================== Styles (scoped with a cx- prefix) ====================

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400..800;1,400..800&display=swap');

:root {
  --font-inter-tight: 'Inter Tight', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --cx-bg: #fff;
  --cx-fg: #0a0a0a;
  --cx-mut: #737373;
  --cx-line: #e5e5e5;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --cx-bg: #0a0a0a;
    --cx-fg: #fafafa;
    --cx-mut: #8a8a8a;
    --cx-line: #262626;
  }
}
:root[data-theme='dark'], .dark {
  --cx-bg: #0a0a0a;
  --cx-fg: #fafafa;
  --cx-mut: #8a8a8a;
  --cx-line: #262626;
}

.cx-page{display:grid;grid-template-columns:1fr 1fr;min-height:100dvh;background:var(--cx-bg);color:var(--cx-fg);font-family:var(--font-inter-tight),system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
.cx-page *,.cx-page *::before,.cx-page *::after{box-sizing:border-box}
.cx-page button,.cx-page input{font:inherit;color:inherit}
.cx-page :focus-visible{outline:2px solid var(--cx-fg);outline-offset:3px}
.cx-label{font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--cx-mut)}

/* left (always black) */
.cx-left{position:relative;display:flex;flex-direction:column;min-height:100dvh;padding:40px 44px;overflow:hidden;background:#0a0a0a;color:#fafafa}
.cx-left::before{content:'';position:absolute;inset:0;opacity:.09;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.cx-left .cx-label{color:#8a8a8a}
.cx-frame{position:absolute;inset:18px;border:1px solid rgba(255,255,255,.1);pointer-events:none}
.cx-top{position:relative;display:flex;align-items:center;justify-content:space-between}
.cx-logo{font-size:18px;font-weight:800;letter-spacing:-.01em;text-transform:uppercase}
.cx-nav{display:flex;gap:26px}
.cx-mid{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
.cx-stage{position:relative;flex:none;width:480px;height:480px}
@media (max-height:760px){.cx-stage{transform:scale(.78)}}
.cx-ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1px solid rgba(255,255,255,.14);transform:translate(-50%,-50%)}
.cx-ring.cx-dash{border-style:dashed;border-color:rgba(255,255,255,.1)}
.cx-hub{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#0a0a0a}
.cx-hub svg{width:46px;height:46px}
.cx-hub i{position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(255,255,255,.35);animation:cx-beat 2.8s ease-out infinite}
.cx-orb{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:40px;height:40px;margin:-20px 0 0 -20px;padding:8px;border-radius:50%;background:#fafafa;animation:cx-orbit 24s linear infinite;animation-delay:calc(var(--d)*-1s);animation-direction:var(--dir,normal);box-shadow:0 4px 14px rgba(0,0,0,0.5)}
.cx-orb svg{width:100%;height:100%}
.cx-bottom{position:relative}
.cx-bottom h1{margin:0;font-size:clamp(46px,5.6vw,88px);font-weight:700;line-height:.92;letter-spacing:-.055em}
.cx-bottom em,.cx-h2 em{font-style:normal;color:var(--cx-mut)}
.cx-left .cx-bottom em{color:#8a8a8a}
.cx-stats{display:flex;gap:44px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,.14)}
.cx-stats b{display:block;font-size:32px;font-weight:700;letter-spacing:-.04em;line-height:1.1}

/* right */
.cx-right{position:relative;display:flex;flex-direction:column;min-height:100dvh;padding:28px 44px;border-left:1px solid var(--cx-line)}
.cx-rtop{display:flex;align-items:center;justify-content:space-between;gap:12px}
.cx-mbrand{display:none;font-weight:800;text-transform:uppercase}
.cx-actions{display:flex;align-items:center;gap:10px;margin-left:auto}
.cx-pill{padding:9px 18px;border:1px solid var(--cx-fg);border-radius:99px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--cx-fg);text-decoration:none;transition:background .2s,color .2s;cursor:pointer}
.cx-pill:hover{background:var(--cx-fg);color:var(--cx-bg)}
.cx-theme{padding:8px 14px;border:1px solid var(--cx-line);border-radius:99px;background:transparent;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--cx-mut)}
.cx-theme:hover{color:var(--cx-fg);border-color:var(--cx-fg)}
.cx-center{flex:1;display:flex;align-items:center;justify-content:center;padding:20px 0}
.cx-form{width:372px;max-width:100%}
.cx-fx{animation:cx-up .8s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*.07s + .05s)}
.cx-eyebrow{margin-bottom:18px}
.cx-h2{margin:0 0 10px;font-size:clamp(46px,4.8vw,72px);font-weight:700;line-height:.92;letter-spacing:-.055em}
.cx-sub{margin:0 0 30px;color:var(--cx-mut)}
.cx-gbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:50px;border:1px solid var(--cx-line);border-radius:99px;background:transparent;cursor:pointer;font-weight:500;transition:border-color .2s}
.cx-gbtn:hover{border-color:var(--cx-fg)}
.cx-gbtn svg{width:18px;height:18px}
.cx-or{display:flex;align-items:center;gap:14px;margin:22px 0 6px}
.cx-or::before,.cx-or::after{content:'';flex:1;height:1px;background:var(--cx-line)}
.cx-ln{position:relative;margin-top:8px;padding-top:16px;border-bottom:1px solid var(--cx-line)}
.cx-ln::after{content:'';position:absolute;left:0;bottom:-1px;width:100%;height:1px;background:var(--cx-fg);transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.cx-ln:focus-within::after{transform:scaleX(1)}
.cx-ln input{display:block;width:100%;height:38px;padding:0;border:0;background:transparent;font-size:16px}
.cx-ln input:focus-visible{outline:0}
.cx-ln input::placeholder{color:var(--cx-mut);opacity:.55}
.cx-eye{position:absolute;right:0;bottom:6px;padding:4px;border:0;background:none;cursor:pointer;color:var(--cx-mut)}
.cx-eye:hover{color:var(--cx-fg)}
.cx-err{min-height:18px;margin:4px 0 0;font-size:11px;color:#e5484d}
.cx-row{display:flex;justify-content:flex-end;margin:4px 0 22px}
.cx-row button{padding:0;border:0;background:none;cursor:pointer;font-size:13px;color:var(--cx-mut);text-decoration:underline;text-underline-offset:3px}
.cx-row button:hover{color:var(--cx-fg)}
.cx-go{display:flex;align-items:center;justify-content:space-between;width:100%;height:54px;padding:0 22px;border:0;border-radius:99px;background:var(--cx-fg);color:var(--cx-bg);font-weight:600;cursor:pointer}
.cx-go:disabled{opacity:.6;cursor:wait}
.cx-go span{transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.cx-go:hover:not(:disabled) span{transform:translateX(6px)}
.cx-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}
.cx-live{display:inline-flex;align-items:center;gap:7px}
.cx-live::before{content:'';width:6px;height:6px;border-radius:50%;background:#2fbf71}

.cx-quick-demos{margin-top:20px;padding-top:16px;border-top:1px solid var(--cx-line);display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cx-demo-btn{display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border:1px solid var(--cx-line);border-radius:99px;background:transparent;font-size:12px;font-weight:600;cursor:pointer;transition:border-color .2s,background .2s}
.cx-demo-btn:hover{border-color:var(--cx-fg);background:rgba(255,255,255,0.04)}

@keyframes cx-beat{from{transform:scale(.85);opacity:.9}to{transform:scale(1.5);opacity:0}}
@keyframes cx-orbit{from{transform:rotate(0) translateY(calc(var(--r)*1px)) rotate(0)}to{transform:rotate(360deg) translateY(calc(var(--r)*1px)) rotate(-360deg)}}
@keyframes cx-up{from{opacity:0;transform:translateY(22px)}}

@media (max-width:1023px){.cx-page{grid-template-columns:1fr}.cx-left{display:none}.cx-right{padding:24px;border-left:0}.cx-mbrand{display:block}}
@media (prefers-reduced-motion:reduce){.cx-orb,.cx-hub i{animation-play-state:paused}.cx-fx{animation:none}}
`;

// ==================== Logos (inline, high fidelity) ====================

const LOGOS: Record<string, ReactNode> = {
  meet: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Google Meet'>
      <rect x='8' y='26' width='56' height='48' rx='9' fill='#00AC47' />
      <path d='M64 44 92 26v48L64 56z' fill='#00832D' />
      <path d='M8 35a9 9 0 0 1 9-9h12v22H8z' fill='#EA4335' />
      <path d='M8 52h21v22H17a9 9 0 0 1-9-9z' fill='#0066DA' />
      <path d='M29 26h35v22H29z' fill='#FFBA00' />
    </svg>
  ),
  zoom: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Zoom'>
      <rect width='100' height='100' rx='24' fill='#2D8CFF' />
      <rect x='16' y='32' width='43' height='36' rx='8' fill='#fff' />
      <path d='M63 45 84 32v36L63 55z' fill='#fff' />
    </svg>
  ),
  teams: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Microsoft Teams'>
      <rect width='100' height='100' rx='22' fill='#5059C9' />
      <path d='M28 32h44v12H56v28H44V44H28z' fill='#fff' />
    </svg>
  ),
  skype: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Skype'>
      <circle cx='50' cy='50' r='48' fill='#00AFF0' />
      <text x='50' y='68' textAnchor='middle' fontSize='56' fontWeight='700' fill='#fff' fontFamily='Arial, sans-serif'>
        S
      </text>
    </svg>
  ),
  webex: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Cisco Webex'>
      <circle cx='50' cy='50' r='48' fill='#00BCEB' />
      <path d='M22 36l10 30 10-20 10 20 10-30' fill='none' stroke='#fff' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  ),
  jitsi: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Jitsi Meet'>
      <rect x='6' y='14' width='88' height='62' rx='18' fill='#1D76BA' />
      <path d='M26 76 22 92 44 76z' fill='#1D76BA' />
      <circle cx='50' cy='45' r='14' fill='#fff' />
    </svg>
  ),
  slack: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Slack'>
      <rect x='8' y='38' width='42' height='16' rx='8' fill='#36C5F0' />
      <rect x='46' y='8' width='16' height='42' rx='8' fill='#2EB67D' />
      <rect x='50' y='46' width='42' height='16' rx='8' fill='#ECB22E' />
      <rect x='38' y='50' width='16' height='42' rx='8' fill='#E01E5A' />
    </svg>
  ),
  zoho: (
    <svg viewBox='0 0 100 100' role='img' aria-label='Zoho Meeting'>
      <rect width='100' height='100' rx='20' fill='#E42527' />
      <path d='M26 30h48L30 70h44' fill='none' stroke='#fff' strokeWidth='10' strokeLinejoin='round' />
    </svg>
  ),
};

// 4 logos per ring, evenly spaced (delay steps of 6s on a 24s loop)
const ORBITS: { key: string; radius: number; delay: number; reverse?: boolean }[] = [
  { key: 'meet', radius: 150, delay: 0 },
  { key: 'zoom', radius: 150, delay: 6 },
  { key: 'teams', radius: 150, delay: 12 },
  { key: 'skype', radius: 150, delay: 18 },
  { key: 'webex', radius: 220, delay: 3, reverse: true },
  { key: 'jitsi', radius: 220, delay: 9, reverse: true },
  { key: 'slack', radius: 220, delay: 15, reverse: true },
  { key: 'zoho', radius: 220, delay: 21, reverse: true },
];

const STATS = [
  { value: '8+', label: 'Platforms' },
  { value: '100%', label: 'Searchable' },
  { value: '0', label: 'Notes to take' },
];

// ==================== Small pieces ====================

function Mark({ stroke = 6 }: { stroke?: number }) {
  return (
    <svg viewBox='0 0 120 120' fill='none' stroke='#fff' strokeWidth={stroke} aria-hidden='true'>
      <path d='M60 60V18M60 60l36-21M60 60l36 21M60 60v42M60 60 24 81M60 60 24 39' />
      {[
        [60, 18],
        [96, 39],
        [96, 81],
        [60, 102],
        [24, 81],
        [24, 39],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='9' fill='#fff' />
      ))}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox='0 0 48 48' aria-hidden='true'>
      <path fill='#EA4335' d='M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z' />
      <path fill='#4285F4' d='M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z' />
      <path fill='#FBBC05' d='M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z' />
      <path fill='#34A853' d='M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z' />
    </svg>
  );
}

const delay = (i: number) => ({ '--i': i }) as React.CSSProperties;

// ==================== Sign-in page ====================

export type SignInData = { email: string; password: string };

export type SignInPageProps = {
  onSubmit?: (data: SignInData) => void | Promise<void>;
  onGoogle?: () => void;
  onForgotPassword?: () => void;
  onQuickDemo?: (role: 'ADMIN' | 'PARTICIPANT') => void;
  requestAccessHref?: string;
  defaultEmail?: string;
  defaultPassword?: string;
};

export function SignInPage({
  onSubmit,
  onGoogle,
  onForgotPassword,
  onQuickDemo,
  requestAccessHref = '#',
  defaultEmail = 'admin@contextos.local',
  defaultPassword = 'password123',
}: SignInPageProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    const current =
      root.getAttribute('data-theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    if (next === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Invalid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters long';
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await onSubmit?.({ email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='cx-page'>
      <style>{CSS}</style>

      {/* ---------- Left: brand + orbit ---------- */}
      <aside className='cx-left' aria-hidden='true'>
        <div className='cx-frame' />
        <div className='cx-top'>
          <div className='cx-logo'>ContextOS.</div>
          <nav className='cx-label cx-nav'>
            <span>Meetings</span>
            <span>Memory</span>
            <span>Ask</span>
          </nav>
        </div>

        <div className='cx-mid'>
          <div className='cx-stage'>
            <div className='cx-ring' style={{ width: 300, height: 300 }} />
            <div className='cx-ring cx-dash' style={{ width: 440, height: 440 }} />
            <div className='cx-hub'>
              <i />
              <Mark />
            </div>
            {ORBITS.map((o) => (
              <div
                key={o.key}
                className='cx-orb'
                style={
                  {
                    '--r': o.radius,
                    '--d': o.delay,
                    '--dir': o.reverse ? 'reverse' : 'normal',
                  } as React.CSSProperties
                }
              >
                {LOGOS[o.key]}
              </div>
            ))}
          </div>
        </div>

        <div className='cx-bottom'>
          <h1>
            Every meeting.
            <br />
            <em>Remembered.</em>
          </h1>
          <div className='cx-stats'>
            {STATS.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                <span className='cx-label'>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ---------- Right: form ---------- */}
      <main className='cx-right'>
        <div className='cx-rtop'>
          <div className='cx-mbrand'>ContextOS.</div>
          <div className='cx-actions'>
            <a className='cx-pill' href={requestAccessHref}>
              Request access
            </a>
            <button className='cx-theme' type='button' onClick={toggleTheme}>
              Theme
            </button>
          </div>
        </div>

        <div className='cx-center'>
          <div className='cx-form'>
            <div className='cx-label cx-eyebrow cx-fx' style={delay(0)}>
              Sign in
            </div>
            <h2 className='cx-h2 cx-fx' style={delay(1)}>
              Welcome
              <br />
              <em>back.</em>
            </h2>
            <p className='cx-sub cx-fx' style={delay(2)}>
              Sign in to your ContextOS account.
            </p>

            <button
              type='button'
              className='cx-gbtn cx-fx'
              style={delay(3)}
              onClick={onGoogle ?? (() => console.log('Google login clicked'))}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className='cx-or cx-label cx-fx' style={delay(4)}>
              or
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className='cx-fx' style={delay(5)}>
                <div className='cx-ln'>
                  <label htmlFor='cx-email' className='cx-label'>
                    Email
                  </label>
                  <input
                    id='cx-email'
                    type='email'
                    autoComplete='email'
                    placeholder='you@company.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className='cx-err' role='alert'>
                  {errors.email}
                </p>
              </div>

              <div className='cx-fx' style={delay(6)}>
                <div className='cx-ln'>
                  <label htmlFor='cx-password' className='cx-label'>
                    Password
                  </label>
                  <input
                    id='cx-password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    placeholder='At least 6 characters'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='cx-eye'
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <p className='cx-err' role='alert'>
                  {errors.password}
                </p>
              </div>

              <div className='cx-row cx-fx' style={delay(7)}>
                <button
                  type='button'
                  onClick={onForgotPassword ?? (() => console.log('forgot password'))}
                >
                  Forgot password?
                </button>
              </div>

              <button type='submit' className='cx-go cx-fx' style={delay(8)} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'} <span>&rarr;</span>
              </button>

              {/* 1-Click Instant Demo Access */}
              {onQuickDemo && (
                <div className='cx-quick-demos cx-fx' style={delay(9)}>
                  <button
                    type='button'
                    className='cx-demo-btn'
                    onClick={() => onQuickDemo('ADMIN')}
                  >
                    <Shield size={14} className="text-indigo-400" />
                    <span>Admin Demo</span>
                  </button>
                  <button
                    type='button'
                    className='cx-demo-btn'
                    onClick={() => onQuickDemo('PARTICIPANT')}
                  >
                    <UserCheck size={14} className="text-cyan-400" />
                    <span>User Demo</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className='cx-foot cx-label'>
          <span className='cx-live'>All systems normal</span>
          <span>&copy; 2026 ContextOS</span>
        </div>
      </main>
    </div>
  );
}

// Backwards-compatibility aliases and exports
export const AuthPage = SignInPage;
export default SignInPage;

export {
  LOGOS,
  ORBITS,
  STATS,
  Mark,
  GoogleIcon,
};
