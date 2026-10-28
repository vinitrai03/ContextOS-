import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Command, LogOut, User as UserIcon, Shield, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useCommandStore } from '../../store/useCommandStore';
import { Badge } from '../ui/Badge';
import { useNotifications } from '../../hooks/useNotifications';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDemoMode, toggleDemoMode } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { openCommandPalette } = useCommandStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Notifications polling
  const { data: notifications = [] } = useNotifications();

  // Generate breadcrumb title based on path
  const pathName = location.pathname.substring(1) || 'dashboard';
  const formattedBreadcrumbs = pathName.split('/').map(segment => 
    segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
  );

  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-muted">ContextOS</span>
        {formattedBreadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-text-muted">/</span>
            <span className="font-semibold text-text-primary capitalize">{crumb}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Global Search Trigger (Cmd+K) */}
      <div
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface border border-border text-text-muted text-sm hover:border-brand-DEFAULT/40 hover:text-text-primary transition-all cursor-pointer w-72"
      >
        <Search className="w-4 h-4 text-brand-DEFAULT" />
        <span className="truncate">Search context or ask AI...</span>
        <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-hover border border-border text-[10px] font-mono">
          <Command className="w-3 h-3" /> K
        </div>
      </div>

      {/* Controls & Avatar Menu */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Toggle Badge */}
        <button
          onClick={toggleDemoMode}
          title="Toggle Offline Demo Mode"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-DEFAULT/10 text-brand-DEFAULT border border-brand-DEFAULT/20 hover:bg-brand-DEFAULT/20 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Demo Mode: {isDemoMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-border shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-sm text-text-primary">Notifications</span>
                <Badge variant="cyan" size="sm">3 New</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n: any) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-surface-hover/50 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                      <span className="text-[10px] text-text-muted">{n.time}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-hover transition-colors"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-DEFAULT/30"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-border shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Profile & Settings
                </button>
                <button
                  onClick={() => { logout(); navigate('/auth'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-error hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
