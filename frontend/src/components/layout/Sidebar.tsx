import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Calendar, Mail, CheckSquare, GitFork, 
  Sparkles, FileText, BarChart3, ShieldCheck, Settings, ChevronLeft, 
  ChevronRight, Cpu, PlusCircle, Handshake 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', path: '/meetings', icon: Video },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Email Hub', path: '/email', icon: Mail },
    { name: 'Tasks (Kanban)', path: '/tasks', icon: CheckSquare },
    { name: 'Decisions', path: '/decisions', icon: GitFork },
    { name: 'Commitments', path: '/commitments', icon: Handshake },
    { name: 'Context Explorer', path: '/graph', icon: Cpu },
    { name: 'AI Assistant', path: '/ai-search', icon: Sparkles, highlight: true },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative h-screen glass-panel border-r border-border transition-all duration-300 flex flex-col z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-DEFAULT via-brand-accent to-brand-cyan flex items-center justify-center shadow-glow-indigo text-white font-bold">
              C
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-gradient">ContextOS</span>
              <div className="text-[10px] text-text-muted tracking-wider uppercase font-mono">v1.0 Capstone</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-DEFAULT to-brand-cyan flex items-center justify-center text-white font-bold mx-auto">
            C
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors hidden md:flex"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <NavLink
          to="/meetings/new"
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-brand-DEFAULT hover:bg-brand-accent text-white font-medium shadow-md shadow-brand-DEFAULT/30 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>New Meeting</span>}
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-DEFAULT/15 text-brand-DEFAULT border border-brand-DEFAULT/30 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`
              }
            >
              <Icon className={`w-5 h-5 shrink-0 ${item.highlight ? 'text-brand-cyan animate-pulse' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {!isCollapsed && item.highlight && (
                <Badge variant="cyan" size="sm" className="ml-auto">AI</Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Footer */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-border bg-surface/30 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-[11px] text-text-muted truncate">{user.email}</p>
          </div>
          <Badge variant={user.role === 'ADMIN' ? 'purple' : 'info'} size="sm">
            {user.role}
          </Badge>
        </div>
      )}
    </aside>
  );
};
