import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Calendar, Mail, CheckSquare, GitFork, 
  Sparkles, FileText, BarChart3, ShieldCheck, Settings, ChevronLeft, 
  ChevronRight, Cpu, PlusCircle, Handshake 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

function MarkSmall() {
  return (
    <svg viewBox='0 0 120 120' fill='none' stroke='currentColor' strokeWidth={8} className="w-4 h-4 text-text-primary" aria-hidden='true'>
      <path d='M60 60V18M60 60l36-21M60 60l36 21M60 60v42M60 60 24 81M60 60 24 39' />
      {[
        [60, 18],
        [96, 39],
        [96, 81],
        [60, 102],
        [24, 81],
        [24, 39],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='8' fill='currentColor' />
      ))}
    </svg>
  );
}

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
      className={`relative h-screen bg-surface border-r border-border transition-all duration-300 flex flex-col z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-border bg-surface-hover flex items-center justify-center text-text-primary shadow-minimal">
              <MarkSmall />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-text-primary">ContextOS.</span>
              <div className="text-[10px] text-text-muted tracking-widest uppercase font-mono">Workspace</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-full border border-border bg-surface-hover flex items-center justify-center text-text-primary mx-auto shadow-minimal">
            <MarkSmall />
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
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-foreground text-background font-semibold text-xs tracking-wider uppercase transition-all hover:opacity-90 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all duration-150 group ${
                  isActive
                    ? 'bg-surface-hover text-text-primary border border-border font-semibold shadow-minimal'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {!isCollapsed && item.highlight && (
                <span className="ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-surface text-text-muted">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Footer */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-[11px] text-text-muted truncate">{user.email}</p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-surface-hover text-text-secondary">
            {user.role}
          </span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
