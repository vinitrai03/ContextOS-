import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Video, Mail, CheckSquare, GitFork, Sparkles, Calendar, ArrowUpRight, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary } from '../hooks/useDashboard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="text-status-error text-sm font-mono">Failed to load dashboard data. Please make sure backend is running.</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-full border border-border text-xs font-semibold uppercase tracking-wider hover:border-foreground/40 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    upcomingMeetings = 0,
    todayMeetings = 0,
    completedMeetings = 0,
    recentActivity = [],
  } = data || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Executive Context Dashboard</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-border bg-surface-hover text-text-muted">
              Live Pipeline
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-mono">Unified meeting schedule, AI decision log, tasks, and organizational memory graph.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/calendar')}
            className="px-4 py-2 rounded-full border border-border text-xs font-semibold uppercase tracking-wider hover:border-foreground/40 transition-colors"
          >
            Calendar
          </button>
          <button
            onClick={() => navigate('/meetings/new')}
            className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-minimal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Live Meetings Callout Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-minimal relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-border bg-surface-hover flex items-center justify-center relative">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text-primary">Q3 Architecture Review</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-border bg-surface-hover text-text-muted">
                mock-code
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono mt-0.5 flex items-center gap-2">
              <span className="text-status-success font-medium">● ACTIVE NOW</span>
              <span>• 3 participants connected</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/meet/mock%20code/room')}
          className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-minimal"
        >
          <span>Join Meeting Room</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Minimal Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="space-y-2 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Upcoming</span>
            <Video className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-text-primary">{upcomingMeetings}</div>
          <p className="text-xs text-text-secondary font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-status-success" /> {todayMeetings} scheduled today
          </p>
        </GlassCard>

        <GlassCard className="space-y-2 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Completed</span>
            <Calendar className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-text-primary">{completedMeetings}</div>
          <p className="text-xs text-text-muted font-mono">Total archived</p>
        </GlassCard>

        <GlassCard className="space-y-2 p-5 cursor-pointer hover:border-foreground/30 transition-all" onClick={() => navigate('/tasks')}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-text-primary">3</div>
          <p className="text-xs text-text-secondary font-mono">1 pending review</p>
        </GlassCard>

        <GlassCard className="space-y-2 p-5 cursor-pointer hover:border-foreground/30 transition-all" onClick={() => navigate('/decisions')}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Decisions</span>
            <GitFork className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-text-primary">12</div>
          <p className="text-xs text-text-secondary font-mono">+2 recorded this week</p>
        </GlassCard>
      </div>

      {/* Activity Overview */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-text-primary font-mono">Recent Activity Stream</h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Automated Audit Log</span>
        </div>
        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-xs font-mono border border-dashed border-border rounded-xl">
              No recent activity recorded
            </div>
          ) : (
            recentActivity.map((activity: any) => (
              <div key={activity.id} className="p-3 rounded-xl bg-surface-hover/40 border border-border flex items-center justify-between hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full border border-border bg-surface flex items-center justify-center font-mono text-xs text-text-muted">
                    &bull;
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-primary">{activity.action}</p>
                    <p className="text-[10px] text-text-muted font-mono">Entity: {activity.entityType || 'SYSTEM'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded border border-border bg-surface">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardPage;
