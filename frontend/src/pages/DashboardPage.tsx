import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Video, Mail, CheckSquare, GitFork, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary } from '../hooks/useDashboard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-DEFAULT"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
        <div className="text-rose-500">Failed to load dashboard data. Please make sure backend is running.</div>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-primary">Executive Context Dashboard</h1>
            <Badge variant="cyan" size="sm">Phase 4 Online</Badge>
          </div>
          <p className="text-sm text-text-secondary">Unified meeting schedule, AI decision log, tasks, and organizational memory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            View Calendar
          </Button>
          <Button variant="glow" onClick={() => navigate('/meetings/new')} icon={<Video className="w-4 h-4" />}>
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Live Meetings Card (Mocked for now) */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>
                  <Video className="w-6 h-6 text-red-500" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      Q3 Architecture Review <Badge variant="cyan" size="sm">mock-code</Badge>
                  </h3>
                  <p className="text-red-400 font-medium text-sm">Live now • 3 participants</p>
              </div>
          </div>
          <Button onClick={() => navigate('/meet/mock-code')} className="bg-red-500 hover:bg-red-600 border-none shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              Join Meeting
          </Button>
      </div>

      {/* Bento Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Upcoming Meetings</span>
            <div className="p-2 rounded-xl bg-brand-DEFAULT/10 text-brand-DEFAULT">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">{upcomingMeetings}</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> {todayMeetings} scheduled for today
          </p>
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Completed Meetings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">{completedMeetings}</div>
          <p className="text-xs text-text-muted font-medium">Total meetings finished</p>
        </GlassCard>

        <GlassCard className="space-y-3 cursor-pointer hover:border-cyan-500/50 transition-all" onClick={() => navigate('/tasks')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">3</div>
          <p className="text-xs text-cyan-400 font-medium">1 overdue</p>
        </GlassCard>

        <GlassCard className="space-y-3 cursor-pointer hover:border-brand-DEFAULT/50 transition-all" onClick={() => navigate('/decisions')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Decisions Logged</span>
            <div className="p-2 rounded-xl bg-brand-DEFAULT/10 text-brand-DEFAULT">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">12</div>
          <p className="text-xs text-brand-light font-medium">+2 this week</p>
        </GlassCard>
      </div>

      {/* Activity Overview */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="font-bold text-lg text-text-primary">Recent Activity Feed</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="p-4 text-center text-text-muted text-sm border border-dashed border-border rounded-xl">
              No recent activity recorded
            </div>
          ) : (
            recentActivity.map((activity: any) => (
              <div key={activity.id} className="p-3.5 rounded-xl bg-surface/50 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-DEFAULT/15 text-brand-DEFAULT flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Action: {activity.action}</p>
                    <p className="text-xs text-text-muted">Entity: {activity.entityType || 'SYSTEM'}</p>
                  </div>
                </div>
                <Badge variant="purple" size="sm">{new Date(activity.createdAt).toLocaleDateString()}</Badge>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
